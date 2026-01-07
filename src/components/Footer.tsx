import { A } from "@solidjs/router"
import { Home, Info, Mail, ShoppingBag } from 'lucide-solid';

export default () => {
    return (
        <footer class="footer bg-base-200 text-base-content p-10 border-t-2 border-primary/20">
            <aside class="flex flex-col items-center lg:items-start">
                <div class="flex items-center gap-2 mb-2">
                    <ShoppingBag size={24} class="text-primary" />
                    <span class="text-xl font-bold text-primary">Tinker Store</span>
                </div>
                <p class="text-sm text-base-content/70">
                    Your marketplace for quality products
                </p>
                <p class="text-xs text-base-content/50">
                    Copyright © {new Date().getFullYear()} - All rights reserved
                </p>
            </aside>
            <nav class="flex flex-col gap-2">
                <h6 class="footer-title text-primary">Quick Links</h6>
                <A class="link link-hover flex items-center gap-2" href="/">
                    <Home size={16} />
                    Home
                </A>
                <A class="link link-hover flex items-center gap-2" href="/about">
                    <Info size={16} />
                    About
                </A>
                <A class="link link-hover flex items-center gap-2" href="/contact">
                    <Mail size={16} />
                    Contact
                </A>
            </nav>
        </footer>
    )
}
