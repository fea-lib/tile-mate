import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';

import logo from './assets/logo.svg';
import styles from './App.module.css';
import Button from './components/Button';

const App: Component = () => {
  const [count, setCount] = createSignal(0);

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          class={styles.link}
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solid
        </a>
      </header>
      <main class={styles.main}>
        <h1>Welcome to Tile Mate</h1>
        <p>A modern SolidJS TypeScript SPA</p>
        <Button onClick={() => setCount(count() + 1)}>
          count is {count()}
        </Button>
      </main>
    </div>
  );
};

export default App;
