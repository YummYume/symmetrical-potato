import { type RequestHandler, createRequestHandler } from '@remix-run/express';
import { type ServerBuild, broadcastDevReady, installGlobals } from '@remix-run/node';
import compression from 'compression';
import express from 'express';
import { GraphQLClient } from 'graphql-request';
import morgan from 'morgan';
import sourceMapSupport from 'source-map-support';

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';

import { AUTHORIZATION_COOKIE_PREFIX, bearerCookie } from '~/lib/cookies.server';
import { getCurrentUser } from '~api/user';

import type { GetLoadContextFunction } from '@remix-run/express';
import type { User } from '~api/types';

sourceMapSupport.install();
installGlobals();

const BUILD_PATH = path.resolve('build/index.js');
const VERSION_PATH = path.resolve('build/version.txt');
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/healthz',
];

const initialBuild = await reimportServer();
/**
 * Load context to be used before passing the request to Remix.
 */
const getLoadContext = (async (req, res) => {
  const authorizationToken = await bearerCookie.parse(req.headers.cookie ?? '');
  const client = new GraphQLClient(`${process.env.API_HOST}${process.env.API_GRAPHQL_ENDPOINT}`, {
    credentials: 'include',
    headers: {
      Authorization: authorizationToken
        ? `${AUTHORIZATION_COOKIE_PREFIX} ${authorizationToken}`
        : '',
    },
  });
  let user: User | null = null;

  try {
    const userResponse = await getCurrentUser(client);

    if (userResponse && userResponse.meUser) {
      user = userResponse.meUser;
    }
  } catch (error) {
    // TODO use refresh token?
    user = null;
  }

  // Protect all routes except public ones
  if (null === user && !PUBLIC_PATHS.includes(req.path)) {
    res.redirect('/login');
  }

  return { client, user };
}) satisfies GetLoadContextFunction;
const remixHandler =
  process.env.NODE_ENV === 'development'
    ? await createDevRequestHandler(initialBuild, getLoadContext)
    : createRequestHandler({
        // @ts-expect-error - Type mismatch between remix-run and @remix-run/node
        build: initialBuild,
        mode: initialBuild.mode,
        getLoadContext,
      });

const app = express();
const port = process.env.PORT || 3000;

app
  .use(compression())
  // http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
  .disable('x-powered-by')
  // Remix fingerprints its assets so we can cache forever.
  .use('/build', express.static('public/build', { immutable: true, maxAge: '1y' }))
  // Everything else (like favicon.ico) is cached for an hour. You may want to be
  // more aggressive with this caching.
  .use(express.static('public', { maxAge: '1h' }))
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
        // @ts-expect-error - Type mismatch between remix-run and @remix-run/node
        build,
        mode: 'development',
        getLoadContext,
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
