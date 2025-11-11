import type { Component } from 'solid-js';
import { Router, Route } from "@solidjs/router";
import Navbar from './components/Navbar';
import Store from './pages/Store';
import Footer from './components/Footer';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import ItemInfo from './pages/ItemInfo';
import Checkout from './pages/Checkout';

const App: Component = () => {
  return (
    <>
      <Router>
        <Navbar />
        <Footer />
      </Router>
    </>
  );
};

export default App;
