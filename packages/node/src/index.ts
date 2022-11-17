// import vue from '@vitejs/plugin-vue';
// import vueJsx from '@vitejs/plugin-vue-jsx';
// import type { NextHandleFunction } from 'connect';
import connect from 'connect';
import type { RequestHandler } from 'express';
import type * as Router from 'find-my-way';
// import fs from 'fs';
// import { createProxyMiddleware } from 'http-proxy-middleware';
// import path from 'path';
// import { createServer as createVimixServer } from 'vite';

interface Interface {
  new (...input: any): any;
}

export interface NodeHookOptions {
  addMiddleware: (...input: (Interface | RequestHandler)[]) => void;
  addRequestHandler: any;
  config: any;
  vite: any;
}

export type NodeAttacher = (options: NodeHookOptions) => Promise<void> | void;

export function hook(opts: NodeAttacher): NodeAttacher {
  return opts;
}

interface Server {
  app: connect.Server;
  listen: (port: number) => Promise<void>;
}

interface ServerConfig {
  matchedRoutes(url?: string): boolean;
  router: Router.Instance<Router.HTTPVersion.V1>;
}

export async function createServer(config: ServerConfig): Promise<Server> {
  let started = false;
  const { router } = config;
  // const vite = await createVimixServer({
  //   appType: 'custom',
  //   publicDir: path.resolve(process.cwd(), 'app', 'public'),
  //   plugins: [vue(), vueJsx()],
  //   configFile: false,
  //   server: {
  //     middlewareMode: true,
  //   },
  //   resolve: {
  //     alias: {
  //       '@': path.join(process.cwd(), 'app'),
  //     },
  //   },
  //   ssr: {
  //     external: ['reflect-metadata'],
  //   },
  // });

  const app = connect();

  const listen = async (port: number) => {
    return new Promise<void>((resolve) => {
      app.listen(port, () => {
        started = true;
        resolve();
      });
    });
  };

  // const serverProxy = createProxyMiddleware({
  //   target: 'http://0.0.0.0:3001',
  //   changeOrigin: true,
  // }) as NextHandleFunction;
  // app.use(vite.middlewares);

  // const viteRender: NextHandleFunction = async (req, res) => {
  //   console.log('req.url', req.url);
  //   const url = req.url!;
  //   const template = fs.readFileSync(
  //     path.resolve(process.cwd(), 'app/index.html'),
  //     'utf-8',
  //   );
  //   const renderHtml: string = await vite.transformIndexHtml(url, template);
  //   const { render: viteRender } = await vite.ssrLoadModule(
  //     '/app/entry-server.ts',
  //   );
  //   const appHtml = await viteRender(url);
  //   const html = renderHtml.replace('<!--ssr-outlet-->', appHtml);
  //   res.setHeader('content-type', 'text/html').end(html);
  // };

  app.use((req, res, next) => {
    //   if (req.url && router.lookup(req, res)) return viteRender(req, res, next);
    //   next();
    console.log(req.url);
    next();
  });

  // app.use(serverProxy);

  const server: Server = {
    app,
    listen,
  };

  return server;
}
