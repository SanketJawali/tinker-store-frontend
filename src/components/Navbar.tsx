import { A } from "@solidjs/router";
import {
    SignedIn,
    SignedOut,
    SignInButton,
    UserButton,
    ClerkLoading,
    ClerkLoaded
} from "clerk-solidjs";
import { ShoppingCart, Home, Info, Mail, Plus, Menu, LogIn } from 'lucide-solid';

export default () => {
    return (
        <div class="navbar bg-primary text-primary-content shadow-lg sticky top-0 z-50">
            <div class="navbar-start">
                <div class="dropdown">
                    <div tabindex="0" role="button" class="btn btn-ghost lg:hidden hover:bg-primary-focus">
                        <Menu size={24} />
                    </div>
                    <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-base-content">
                        <ClerkLoaded>
                            <SignedIn>
                                <li><A href="/cart" class="flex items-center gap-2"><ShoppingCart size={18} /> Cart</A></li>
                                <li><A href="/" class="flex items-center gap-2"><Home size={18} /> Home</A></li>
                                <li><A href="/about" class="flex items-center gap-2"><Info size={18} /> About</A></li>
                                <li><A href="/contact" class="flex items-center gap-2"><Mail size={18} /> Contact</A></li>
                                <li><A href="/new-product" class="flex items-center gap-2"><Plus size={18} /> New Product</A></li>
                            </SignedIn>
                            <SignedOut>
                                <li><A href="/" class="flex items-center gap-2"><Home size={18} /> Home</A></li>
                                <li><A href="/about" class="flex items-center gap-2"><Info size={18} /> About</A></li>
                                <li><A href="/contact" class="flex items-center gap-2"><Mail size={18} /> Contact</A></li>
                                <li>
                                    <SignInButton class="p-0">
                                        <button class='btn btn-sm btn-primary w-full'>
                                            Sign In
                                        </button>
                                    </SignInButton>
                                </li>
                            </SignedOut>
                        </ClerkLoaded>
                    </ul>
                </div>
                <A href="/" class="btn btn-ghost text-2xl cursor-pointer font-bold hover:bg-primary-focus transition-colors">
                    Tinker Store
                </A>
            </div>
            <div class="navbar-center hidden lg:flex">
                <ul class="menu menu-horizontal px-1 gap-1">
                    <ClerkLoaded>
                        <SignedIn>
                            <li><A href="/" class="flex items-center gap-2 hover:bg-primary-focus transition-colors rounded-lg"><Home size={18} /> Home</A></li>
                            <li><A href="/cart" class="flex items-center gap-2 hover:bg-primary-focus transition-colors rounded-lg"><ShoppingCart size={18} /> Cart</A></li>
                            <li><A href="/about" class="flex items-center gap-2 hover:bg-primary-focus transition-colors rounded-lg"><Info size={18} /> About</A></li>
                            <li><A href="/contact" class="flex items-center gap-2 hover:bg-primary-focus transition-colors rounded-lg"><Mail size={18} /> Contact</A></li>
                            <li><A href="/new-product" class="flex items-center gap-2 hover:bg-primary-focus transition-colors rounded-lg"><Plus size={18} /> New Product</A></li>
                        </SignedIn>
                        <SignedOut>
                            <li><A href="/" class="flex items-center gap-2 hover:bg-primary-focus transition-colors rounded-lg"><Home size={18} /> Home</A></li>
                            <li><A href="/about" class="flex items-center gap-2 hover:bg-primary-focus transition-colors rounded-lg"><Info size={18} /> About</A></li>
                            <li><A href="/contact" class="flex items-center gap-2 hover:bg-primary-focus transition-colors rounded-lg"><Mail size={18} /> Contact</A></li>
                        </SignedOut>
                    </ClerkLoaded>
                </ul>
            </div>
            <div class="navbar-end px-4 gap-2">
                <ClerkLoading>
                    <span class="loading loading-spinner loading-xs"></span>
                </ClerkLoading>
                <ClerkLoaded>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                    <SignedOut>
                         <SignInButton class="hidden lg:block">
                            <button class='btn btn-outline border-2 border-primary-content text-primary-content hover:bg-primary-content hover:text-primary transition-colors'>
                                <LogIn size={18} />
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>
                </ClerkLoaded>
            </div>
        </div >
    )
};
