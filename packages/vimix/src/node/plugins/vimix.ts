import fs from 'fs';
import path from 'path';
import type { Plugin, ViteDevServer } from 'vite';

/**
 * @param {string} locate
 * @param {string} [cwd]
 */
function find(locate: string, cwd: string): string | undefined {
  cwd = cwd || process.cwd();
  if (cwd.split(path.sep).length < 2) return undefined;
  const match = fs.readdirSync(cwd).find((f) => f === locate);
  if (match) return match;
  return find(locate, path.join(cwd, '..'));
}
const nodeModulesPath = find('node_modules', process.cwd());

function remove_html_middlewares(server: ViteDevServer['middlewares']) {
  const html_middlewares = [
    'viteIndexHtmlMiddleware',
    'vite404Middleware',
    'viteSpaFallbackMiddleware',
    'viteHtmlFallbackMiddleware',
  ];
  for (let i = server.stack.length - 1; i > 0; i--) {
    // @ts-ignore
    if (html_middlewares.includes(server.stack[i].handle.name)) {
      server.stack.splice(i, 1);
    }
  }
}

console.log('nodeModulesPath', nodeModulesPath);
export default function pluginVimix(): Plugin {
  return {
    name: 'plugin-vimix',
    apply: 'serve',
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          // {
          //   tag: 'script',
          //   attrs: {
          //     type: 'module',
          //     src: `/@fs/${CLIENT_ENTRY_PATH}`,
          //   },
          //   injectTo: 'body',
          // },
        ],
      };
    },
    configureServer(server) {
      return async () => {
        server.middlewares.use(async (req, res, next) => {
          if (res.writableEnded) {
            return next();
          }
          if (req.url?.replace(/\?.*/, '')) {
            let html = `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Vimix</title>
              </head>
              <body>
                <noscript>
                  <strong
                    >We're sorry but vite-vue2-ts-template-starter doesn't work properly without JavaScript
                    enabled. Please enable it to continue.</strong
                  >
                </noscript>
                <div id="app"></div>
                <script type="module" src="/src/main.ts"></script>
              </body>
            </html>
            `;

            try {
              html = await server.transformIndexHtml(req.url, html, req.originalUrl);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/html');
              res.end(html);
            } catch (e) {
              return next(e);
            }
          }
        });
      };
    },
  };
}
