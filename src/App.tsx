import type { Component } from 'solid-js';
import Navbar from './components/Navbar';
import Store from './components/Store';

const App: Component = () => {
  return (
    <>
      <Navbar />
      <Store />
    </>
  );
};

export default App;
