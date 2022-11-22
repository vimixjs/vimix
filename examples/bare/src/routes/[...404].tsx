import { Title } from '@vimix/react';
import { HttpStatusCode } from '@vimix/server';

export default function NotFound() {
  return (
    <main>
      <Title>Not Found</Title>
      <HttpStatusCode code={404} />
      <h1>Page Not Found</h1>
      <p>
        Visit{' '}
        <a href="https://vimixjs.com" target="_blank" rel="noopener">
          vimixjs.com
        </a>
        to learn how to build Vimix apps.
      </p>
    </main>
  );
}
