import Counter from '~/components/Counter';

export default function Home() {
  return (
    <main>
      <h1>Hello world!</h1>
      <Counter />
      <p>
        Visit{' '}
        <a href="https://vimixjs.com" target="_blank" rel="noopener">
          vimixjs.com
        </a>{' '}
        to learn how to build Vimix apps.
      </p>
    </main>
  );
}
