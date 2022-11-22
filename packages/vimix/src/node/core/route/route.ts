import minimatch from 'minimatch';
import fs from 'node:fs';
import path from 'node:path';
import { resolveConfig } from '../config';

export async function routes(vimixRoot: string) {
  const config = await resolveConfig({
    root: vimixRoot,
    mode: 'production',
  });
  console.log('config', config);

  const routesConfig = {};
  console.log(routesConfig);
  return routesConfig;
}

/**
 * A route that was created using `defineRoutes` or created conventionally from
 * looking at the files on the filesystem.
 */
export interface ConfigRoute {
  /**
   * The path this route uses to match on the URL pathname.
   */
  path?: string;

  /**
   * Should be `true` if it is an index route. This disallows child routes.
   */
  index?: boolean;

  /**
   * Should be `true` if the `path` is case-sensitive. Defaults to `false`.
   */
  caseSensitive?: boolean;

  /**
   * The unique id for this route, named like its `file` but without the
   * extension. So `app/routes/gists/$username.jsx` will have an `id` of
   * `routes/gists/$username`.
   */
  id: string;

  /**
   * The unique `id` for this route's parent route, if there is one.
   */
  parentId?: string;

  /**
   * The path to the entry point for this route, relative to
   * `config.appDirectory`.
   */
  file: string;
}

export interface DefineRouteOptions {
  /**
   * Should be `true` if the route `path` is case-sensitive. Defaults to
   * `false`.
   */
  caseSensitive?: boolean;

  /**
   * Should be `true` if this is an index route that does not allow child routes.
   */
  index?: boolean;
}

interface DefineRouteChildren {
  (): void;
}

/**
 * A function for defining a route that is passed as the argument to the
 * `defineRoutes` callback.
 *
 * Calls to this function are designed to be nested, using the `children`
 * callback argument.
 *
 *   defineRoutes(route => {
 *     route('/', 'pages/layout', () => {
 *       route('react-router', 'pages/react-router');
 *       route('reach-ui', 'pages/reach-ui');
 *     });
 *   });
 */
export interface DefineRouteFunction {
  (
    /**
     * The path this route uses to match the URL pathname.
     */
    path: string | undefined,

    /**
     * The path to the file that exports the React component rendered by this
     * route as its default export, relative to the `app` directory.
     */
    file: string,

    /**
     * Options for defining routes, or a function for defining child routes.
     */
    optionsOrChildren?: DefineRouteOptions | DefineRouteChildren,

    /**
     * A function for defining child routes.
     */
    children?: DefineRouteChildren,
  ): void;
}

export type DefineRoutesFunction = typeof defineRoutes;

export interface RouteManifest {
  [routeId: string]: ConfigRoute;
}

/**
 * A function for defining routes programmatically, instead of using the
 * filesystem convention.
 */
export function defineRoutes(callback: (defineRoute: DefineRouteFunction) => void): RouteManifest {
  const routes: RouteManifest = {};
  const parentRoutes: ConfigRoute[] = [];
  let alreadyReturned = false;

  const defineRoute: DefineRouteFunction = (path, file, optionsOrChildren, children) => {
    if (alreadyReturned) {
      throw new Error(
        'You tried to define routes asynchronously but started defining ' +
          'routes before the async work was done. Please await all async ' +
          'data before calling `defineRoutes()`',
      );
    }
    let options: DefineRouteOptions;
    if (typeof optionsOrChildren === 'function') {
      options = {};
      children = optionsOrChildren;
    } else {
      options = optionsOrChildren || {};
    }

    const route: ConfigRoute = {
      path: path ? path : undefined,
      index: options.index ? true : undefined,
      caseSensitive: options.caseSensitive ? true : undefined,
      id: createRouteId(file),
      parentId: parentRoutes.length > 0 ? parentRoutes[parentRoutes.length - 1].id : undefined,
      file,
    };

    routes[route.id] = route;

    if (children) {
      parentRoutes.push(route);
      children();
      parentRoutes.pop();
    }
  };

  callback(defineRoute);
  alreadyReturned = true;
  return routes;
}

export function createRouteId(file: string) {
  return normalizeSlashes(stripFileExtension(file));
}

export function normalizeSlashes(file: string) {
  return file.split(path.win32.sep).join('/');
}

function stripFileExtension(file: string) {
  return file.replace(/\.[a-z0-9]+$/i, '');
}

const routeModuleExts = ['.js', '.jsx', '.ts', '.tsx', '.md', '.mdx', '.vue'];

export function isRouteModuleFile(filename: string): boolean {
  return routeModuleExts.includes(path.extname(filename));
}

/**
 * Defines routes using the filesystem convention in `app/routes`. The rules are:
 *
 * - Route paths are derived from the file path. A `.` in the filename indicates
 *   a `/` in the URL (a "nested" URL, but no route nesting). A `$` in the
 *   filename indicates a dynamic URL segment.
 * - Subdirectories are used for nested routes.
 *
 * For example, a file named `app/routes/gists/$username.tsx` creates a route
 * with a path of `gists/:username`.
 */
export function defineConventionalRoutes(
  appDir: string,
  ignoredFilePatterns?: string[],
): RouteManifest {
  const files: { [routeId: string]: string } = {};

  // First, find all route modules in app/routes
  visitFiles(path.join(appDir, 'pages'), (file) => {
    if (ignoredFilePatterns && ignoredFilePatterns.some((pattern) => minimatch(file, pattern))) {
      return;
    }

    if (isRouteModuleFile(file)) {
      const routeId = createRouteId(path.join('pages', file));
      files[routeId] = path.join('pages', file);
      return;
    }

    throw new Error(`Invalid route module file: ${path.join(appDir, 'pages', file)}`);
  });

  const routeIds = Object.keys(files).sort(byLongestFirst);

  const uniqueRoutes = new Map<string, string>();

  // Then, recurse through all routes using the public defineRoutes() API
  function defineNestedRoutes(defineRoute: DefineRouteFunction, parentId?: string): void {
    const childRouteIds = routeIds.filter((id) => findParentRouteId(routeIds, id) === parentId);

    for (const routeId of childRouteIds) {
      const routePath: string | undefined = createRoutePath(
        routeId.slice((parentId || 'pages').length + 1),
      );

      const isIndexRoute = routeId.endsWith('/index');
      const fullPath = createRoutePath(routeId.slice('pages'.length + 1));
      const uniqueRouteId = (fullPath || '') + (isIndexRoute ? '?index' : '');

      if (uniqueRouteId) {
        if (uniqueRoutes.has(uniqueRouteId)) {
          throw new Error(
            `Path ${JSON.stringify(fullPath)} defined by route ${JSON.stringify(
              routeId,
            )} conflicts with route ${JSON.stringify(uniqueRoutes.get(uniqueRouteId))}`,
          );
        } else {
          uniqueRoutes.set(uniqueRouteId, routeId);
        }
      }

      if (isIndexRoute) {
        const invalidChildRoutes = routeIds.filter(
          (id) => findParentRouteId(routeIds, id) === routeId,
        );

        if (invalidChildRoutes.length > 0) {
          throw new Error(
            `Child routes are not allowed in index routes. Please remove child routes of ${routeId}`,
          );
        }

        defineRoute(routePath, files[routeId], {
          index: true,
        });
      } else {
        defineRoute(routePath, files[routeId], () => {
          defineNestedRoutes(defineRoute, routeId);
        });
      }
    }
  }

  return defineRoutes(defineNestedRoutes);
}

const escapeStart = '[';
const escapeEnd = ']';

// TODO: Cleanup and write some tests for this function
export function createRoutePath(partialRouteId: string): string | undefined {
  let result = '';
  let rawSegmentBuffer = '';

  let inEscapeSequence = 0;
  let skipSegment = false;
  for (let i = 0; i < partialRouteId.length; i++) {
    const char = partialRouteId.charAt(i);
    const lastChar = i > 0 ? partialRouteId.charAt(i - 1) : undefined;
    const nextChar = i < partialRouteId.length - 1 ? partialRouteId.charAt(i + 1) : undefined;

    const isNewEscapeSequence = () => {
      return !inEscapeSequence && char === escapeStart && lastChar !== escapeStart;
    };

    const isCloseEscapeSequence = () => {
      return inEscapeSequence && char === escapeEnd && nextChar !== escapeEnd;
    };

    const isStartOfLayoutSegment = () => {
      return char === '_' && nextChar === '_' && !rawSegmentBuffer;
    };

    if (skipSegment) {
      if (char === '/' || char === '.' || char === path.win32.sep) {
        skipSegment = false;
      }
      continue;
    }

    if (isNewEscapeSequence()) {
      inEscapeSequence++;
      continue;
    }

    if (isCloseEscapeSequence()) {
      inEscapeSequence--;
      continue;
    }

    if (inEscapeSequence) {
      result += char;
      continue;
    }

    if (char === '/' || char === path.win32.sep || char === '.') {
      if (rawSegmentBuffer === 'index' && result.endsWith('index')) {
        result = result.replace(/\/?index$/, '');
      } else {
        result += '/';
      }
      rawSegmentBuffer = '';
      continue;
    }

    if (isStartOfLayoutSegment()) {
      skipSegment = true;
      continue;
    }

    rawSegmentBuffer += char;

    if (char === '$') {
      result += typeof nextChar === 'undefined' ? '*' : ':';
      continue;
    }

    result += char;
  }

  if (rawSegmentBuffer === 'index' && result.endsWith('index')) {
    result = result.replace(/\/?index$/, '');
  }

  return result || undefined;
}

function findParentRouteId(routeIds: string[], childRouteId: string): string | undefined {
  return routeIds.find((id) => childRouteId.startsWith(`${id}/`));
}

function byLongestFirst(a: string, b: string): number {
  return b.length - a.length;
}

function visitFiles(dir: string, visitor: (file: string) => void, baseDir = dir): void {
  for (const filename of fs.readdirSync(dir)) {
    const file = path.resolve(dir, filename);
    const stat = fs.lstatSync(file);

    if (stat.isDirectory()) {
      visitFiles(file, visitor, baseDir);
    } else if (stat.isFile()) {
      visitor(path.relative(baseDir, file));
    }
  }
}
