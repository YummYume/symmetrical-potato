import { createRequestHandler, type RequestHandler } from '@remix-run/express';
import { broadcastDevReady, installGlobals, type ServerBuild } from '@remix-run/node';
import compression from 'compression';
import express from 'express';
import { ClientError, GraphQLClient } from 'graphql-request';
import morgan from 'morgan';
import sourceMapSupport from 'source-map-support';

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';

import {
  AUTHORIZATION_COOKIE_PREFIX,
  bearerCookie,
  darkModeCookie,
  refreshTokenCookie,
} from '~/lib/cookies.server';
import { getCurrentUser, refreshAuthToken } from '~api/user';
import { getLocale } from '~utils/locale';

import type { GetLoadContextFunction } from '@remix-run/express';
import type { CookieSerializeOptions } from '@remix-run/node';
import type { MeUser } from '~api/types';

sourceMapSupport.install();
installGlobals();

const BUILD_PATH = path.resolve('build/index.js');
const VERSION_PATH = path.resolve('build/version.txt');

const initialBuild = await reimportServer();
/**
 * Load context to be used before passing the request to Remix.
 */
const getLoadContext = (async (req, res) => {
  const authorizationToken = await bearerCookie.parse(req.headers.cookie ?? '');
  const locale = await getLocale(req.headers.cookie ?? '', req.headers['accept-language'] ?? '');
  const darkMode = await darkModeCookie.parse(req.headers.cookie ?? '');
  const client = new GraphQLClient(`${process.env.API_HOST}${process.env.API_GRAPHQL_ENDPOINT}`, {
    credentials: 'include',
    headers: {
      'Authorization': authorizationToken
        ? `${AUTHORIZATION_COOKIE_PREFIX} ${authorizationToken}`
        : '',
      'Accept-Language': locale,
    },
  });
  let user: MeUser | null = null;

  try {
    const userResponse = await getCurrentUser(client);

    if (userResponse.getMeUser) {
      user = userResponse.getMeUser;
    }
  } catch (error) {
    const refreshToken = await refreshTokenCookie.parse(req.headers.cookie ?? '');
    const isExpiredError = error instanceof ClientError && error.response.code === 401;

    if (refreshToken && isExpiredError) {
      try {
        const refreshedTokenResponse = await refreshAuthToken(client, refreshToken);
        const newToken = refreshedTokenResponse.refreshToken.token;

        if (newToken) {
          let jwtCookieOptions: CookieSerializeOptions = {};
          let refreshTokenCookieOptions: CookieSerializeOptions = {};

          if (newToken.tokenTtl) {
            jwtCookieOptions['maxAge'] = newToken.tokenTtl;
          }

          if (newToken.refreshTokenTtl) {
            refreshTokenCookieOptions['maxAge'] = newToken.refreshTokenTtl;
          }

          client.setHeader('Authorization', `${AUTHORIZATION_COOKIE_PREFIX} ${newToken.token}`);

          res.appendHeader(
            'Set-Cookie',
            await bearerCookie.serialize(newToken.token, jwtCookieOptions),
          );
          res.appendHeader(
            'Set-Cookie',
            await refreshTokenCookie.serialize(newToken.refreshToken, refreshTokenCookieOptions),
          );

          const userResponse = await getCurrentUser(client);

          if (userResponse.getMeUser) {
            user = userResponse.getMeUser;
          }
        }
      } catch (refreshTokenError) {
        client.setHeader('Authorization', '');

        res.appendHeader('Set-Cookie', await bearerCookie.serialize('', { maxAge: 0 }));
        res.appendHeader('Set-Cookie', await refreshTokenCookie.serialize('', { maxAge: 0 }));

        user = null;
      }
    } else {
      client.setHeader('Authorization', '');

      user = null;
    }
  }

  return { client, user, locale, useDarkMode: darkMode === 'true' };
}) satisfies GetLoadContextFunction;
const remixHandler =
  process.env.NODE_ENV === 'development'
    ? await createDevRequestHandler(initialBuild, getLoadContext)
    : createRequestHandler({
        build: initialBuild,
        mode: initialBuild.mode,
        getLoadContext,
      });

const app = express();
const port = process.env.PORT ?? 3000;

app
  .use(compression())
  // http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
  .disable('x-powered-by')
  // Remix fingerprints its assets so we can cache forever.
  .use('/build', express.static('public/build', { immutable: true, maxAge: '1y' }));

// We want to disable asset caching in development
if (process.env.NODE_ENV !== 'development') {
  // Everything else (like favicon.ico) is cached for 24 hours. You may want to be
  // more aggressive with this caching.
  app.use(express.static('public', { maxAge: '24h' }));
} else {
  app.use(
    express.static('public', {
      maxAge: '0',
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-cache');
      },
    }),
  );
}

app
  .use(morgan('tiny'))
  .all('*', remixHandler)
  .listen(port, async () => {
    console.log(`Express server listening on port ${port}.`);

    if (process.env.NODE_ENV === 'development') {
      broadcastDevReady(initialBuild);
    }
  });

async function reimportServer(): Promise<ServerBuild> {
  const stat = fs.statSync(BUILD_PATH);

  // convert build path to URL for Windows compatibility with dynamic `import`
  const BUILD_URL = url.pathToFileURL(BUILD_PATH).href;

  // use a timestamp query parameter to bust the import cache
  return import(BUILD_URL + '?t=' + stat.mtimeMs);
}

async function createDevRequestHandler(
  initialBuild: ServerBuild,
  getLoadContext: GetLoadContextFunction,
): Promise<RequestHandler> {
  let build = initialBuild;

  async function handleServerUpdate() {
    // 1. re-import the server build
    build = await reimportServer();
    // 2. tell Remix that this app server is now up-to-date and ready
    broadcastDevReady(build);
  }

  const chokidar = await import('chokidar');

  chokidar
    // see https://github.com/remix-run/remix/issues/6919
    .watch(VERSION_PATH, { ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 200 } })
    .on('add', handleServerUpdate)
    .on('change', handleServerUpdate);

  // wrap request handler to make sure its recreated with the latest build for every request
  return async (req, res, next) => {
    try {
      return createRequestHandler({
        build,
        mode: 'development',
        getLoadContext,
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
