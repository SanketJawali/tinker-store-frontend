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
import SeoHead from './components/SeoHead';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';

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
                <SeoHead />
                <Navbar />
                <div class="alert rounded-none border-x-0 border-base-300 bg-warning/20 text-warning-content">
                    <span class="text-sm">
                        Demo personal project: products, pricing, and checkout are for demonstration only and are not for real purchases.
                    </span>
                </div>
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
                <Route path="/product/:id" component={ItemInfo} />
                <Route path="/new-product" component={NewItemForm} />
                <Route path="/checkout" component={Checkout} />
                <Route path="/terms" component={TermsOfService} />
                <Route path="/privacy" component={PrivacyPolicy} />
            </Router>
        </ClerkProvider>
    </>
    , root!);
