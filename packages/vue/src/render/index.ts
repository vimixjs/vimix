import { createServer as createViteServer } from 'vite';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import fs from 'fs';
import path from 'path';

export async function render(ctx: any, opts: { csr?: boolean } = {}) {
  const vite = await createViteServer({
    appType: 'custom',
    publicDir: path.resolve(process.cwd(), 'app', 'public'),
    plugins: [vue(), vueJsx()],
    configFile: false,
    server: {
      middlewareMode: true,
    },
    resolve: {
      alias: {
        '@': path.join(process.cwd(), 'app'),
      },
    },
    ssr: {
      external: ['reflect-metadata'],
    },
  });

  const { req } = ctx;

  const { url } = req;

  const template = fs.readFileSync(
    path.resolve(process.cwd(), 'app/index.html'),
    'utf-8',
  );
  const renderHtml = await vite.transformIndexHtml(url, template);
  const { render: viteRender } = await vite.ssrLoadModule(
    '/app/entry-server.ts',
  );
  const appHtml = await viteRender(url);
  const html = renderHtml.replace('<!--ssr-outlet-->', appHtml);
  return html;
}
