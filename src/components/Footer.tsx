import { A } from "@solidjs/router"
import { Home, Info, Mail, ShoppingBag, ShieldCheck, FileText } from 'lucide-solid';

export default () => {
    return (
        <footer class="footer bg-base-200 text-base-content p-8 lg:p-10 border-t border-base-300 flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-between gap-8">
            <aside class="flex flex-col items-center text-center sm:text-left sm:items-start">
                <div class="flex items-center gap-2 mb-2">
                    <ShoppingBag size={24} class="text-primary" />
                    <span class="text-xl font-bold text-base-content">Tinker Store</span>
                </div>
                <p class="text-sm text-base-content/70">
                    Personal demo marketplace project
                </p>
                <p class="badge badge-outline badge-warning mt-2">Demo Only</p>
                <p class="text-xs text-base-content/50 mt-1">
                    Copyright © {new Date().getFullYear()} - All rights reserved
                </p>
            </aside>
            <nav class="flex flex-col items-center sm:items-start gap-2">
                <h6 class="footer-title text-base-content">Quick Links</h6>
                <A class="link link-hover flex items-center gap-2 text-base-content/70 hover:text-primary" href="/">
                    <Home size={16} />
                    Home
                </A>
                <A class="link link-hover flex items-center gap-2 text-base-content/70 hover:text-primary" href="/about">
                    <Info size={16} />
                    About
                </A>
                <A class="link link-hover flex items-center gap-2 text-base-content/70 hover:text-primary" href="/contact">
                    <Mail size={16} />
                    Contact
                </A>
                <A class="link link-hover flex items-center gap-2 text-base-content/70 hover:text-primary" href="/terms">
                    <FileText size={16} />
                    Terms of Service
                </A>
                <A class="link link-hover flex items-center gap-2 text-base-content/70 hover:text-primary" href="/privacy">
                    <ShieldCheck size={16} />
                    Privacy Policy
                </A>
            </nav>
        </footer>
    )
}
