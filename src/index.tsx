/* @refresh reload */
import { render } from 'solid-js/web';
import 'solid-devtools';
import { Router, Route } from '@solidjs/router';
import { ClerkProvider } from 'clerk-solidjs'
import { Suspense } from 'solid-js';

import Navbar from './components/Navbar';
import Store from './pages/Store';
import Footer from './components/Footer';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import NewItemForm from './pages/NewItemForm';
import ItemInfo from './pages/ItemInfo';
import Checkout from './pages/Checkout';

const root = document.getElementById('root');


// Clerk setup
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

const Layout = (props: any) => {
  return (
    <>
      <Suspense>
        <Navbar />
        {props.children}
        <Footer />
      </Suspense>
    </>
  )
}

render(() =>
  <>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Router root={Layout}>
        <Route path="/" component={Store} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/cart" component={Cart} />
        <Route path="/item/{id}" component={ItemInfo} />
        <Route path="/new-item" component={NewItemForm} />
        <Route path="/checkout" component={Checkout} />
      </Router>
    </ClerkProvider>
  </>
  , root!);
