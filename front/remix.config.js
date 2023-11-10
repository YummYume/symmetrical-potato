import { flatRoutes } from 'remix-flat-routes';

/** @type {import('@remix-run/dev').AppConfig} */
const config = {
  ignoredRouteFiles: ['**/.*'],
  routes: async (defineRoutes) => {
    return flatRoutes('routes', defineRoutes);
  },
  browserNodeBuiltinsPolyfill: {
    modules: {
      path: true,
      fs: true,
    },
  },
  serverDependenciesToBundle: ['remix-i18next'],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
};

export default config;
