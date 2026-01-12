import type { Component } from 'solid-js';
import { Router, Route } from "@solidjs/router";
import { createSignal, onMount, Show } from 'solid-js';
import Navbar from './components/Navbar';
import Store from './pages/Store';
import Footer from './components/Footer';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import ItemInfo from './pages/ItemInfo';
import Checkout from './pages/Checkout';
import { checkBackendHealth, validateHealth } from './lib/api';

const App: Component = () => {
  const [backendHealthy, setBackendHealthy] = createSignal<boolean | null>(null);
  const [healthCheckDone, setHealthCheckDone] = createSignal(false);

  onMount(async () => {
    // Check backend health on app load
    const health = await checkBackendHealth();
    const isHealthy = validateHealth(health);
    setBackendHealthy(isHealthy);
    setHealthCheckDone(true);
  });

  return (
    <>
      {/* Health Warning Banner */}
      <Show when={healthCheckDone() && backendHealthy() === false}>
        <div class="alert alert-warning shadow-lg fixed top-0 left-0 right-0 z-50 rounded-none">
          <div class="flex items-center justify-center w-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="ml-2">Backend service is experiencing issues. Some features may not work properly.</span>
          </div>
        </div>
      </Show>

      <Router>
        <Navbar />
        <Footer />
      </Router>
    </>
  );
};

export default App;
