import type { Component } from 'solid-js';
import Navbar from './components/Navbar';
import Store from './components/Store';
import Footer from './components/Footer';

const App: Component = () => {
  return (
    <>
      <Navbar />
      <Store />
      <Footer />
    </>
  );
};

export default App;
