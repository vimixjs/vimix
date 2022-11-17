import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import Root from './root';

export async function render(url: string) {
  return renderToString(
    <React.StrictMode>
      <StaticRouter location={url}>
        <Root />
      </StaticRouter>
    </React.StrictMode>,
  );
}
