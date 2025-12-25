import { A } from "@solidjs/router"

export default () => {
    return (
        <footer class="footer footer-horizontal footer-center bg-base-200 text-base-content rounded p-10">
            <aside>
                <p>Copyright © {new Date().getFullYear()} - Tinker Store</p>
            </aside>
            <nav class="grid grid-flow-col gap-4">
                <A class="link link-hover" href="/">Home</A>
                <A class="link link-hover" href="/about">About</A>
                <A class="link link-hover" href="/contact">Contact</A>
            </nav>
        </footer>
    )
}
