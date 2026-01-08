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
import ThemeSwitcher from './ThemeSwitcher';

export default () => {
    return (
        <div class="navbar bg-base-100 text-base-content shadow-md sticky top-0 z-50 border-b border-base-300">
            <div class="navbar-start">
                <div class="dropdown">
                    <div tabindex="0" role="button" class="btn btn-ghost lg:hidden hover:bg-base-200">
                        <Menu size={24} />
                    </div>
                    <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-base-content border border-base-300">
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
                <A href="/" class="btn btn-ghost text-xl lg:text-2xl cursor-pointer font-bold hover:bg-base-200 transition-colors">
                    Tinker Store
                </A>
            </div>
            <div class="navbar-center hidden lg:flex">
                <ul class="menu menu-horizontal px-1 gap-1">
                    <ClerkLoaded>
                        <SignedIn>
                            <li><A href="/" class="flex items-center gap-2 hover:bg-base-200 transition-colors rounded-lg"><Home size={18} /> Home</A></li>
                            <li><A href="/cart" class="flex items-center gap-2 hover:bg-base-200 transition-colors rounded-lg"><ShoppingCart size={18} /> Cart</A></li>
                            <li><A href="/about" class="flex items-center gap-2 hover:bg-base-200 transition-colors rounded-lg"><Info size={18} /> About</A></li>
                            <li><A href="/contact" class="flex items-center gap-2 hover:bg-base-200 transition-colors rounded-lg"><Mail size={18} /> Contact</A></li>
                            <li><A href="/new-product" class="flex items-center gap-2 hover:bg-base-200 transition-colors rounded-lg"><Plus size={18} /> New Product</A></li>
                        </SignedIn>
                        <SignedOut>
                            <li><A href="/" class="flex items-center gap-2 hover:bg-base-200 transition-colors rounded-lg"><Home size={18} /> Home</A></li>
                            <li><A href="/about" class="flex items-center gap-2 hover:bg-base-200 transition-colors rounded-lg"><Info size={18} /> About</A></li>
                            <li><A href="/contact" class="flex items-center gap-2 hover:bg-base-200 transition-colors rounded-lg"><Mail size={18} /> Contact</A></li>
                        </SignedOut>
                    </ClerkLoaded>
                </ul>
            </div>
            <div class="navbar-end px-2 lg:px-4 gap-1 lg:gap-2">
                <ThemeSwitcher />
                <ClerkLoading>
                    <span class="loading loading-spinner loading-xs"></span>
                </ClerkLoading>
                <ClerkLoaded>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                    <SignedOut>
                         <SignInButton class="hidden lg:block">
                            <button class='btn btn-primary btn-sm lg:btn-md'>
                                <LogIn size={18} />
                                <span class="hidden sm:inline">Sign In</span>
                            </button>
                        </SignInButton>
                    </SignedOut>
                </ClerkLoaded>
            </div>
        </div >
    )
};
