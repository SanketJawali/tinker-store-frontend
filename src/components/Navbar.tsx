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
                <A href="/" class="btn btn-ghost text-xl lg:text-2xl cursor-pointer font-bold hover:bg-base-200 transition-colors">
                    Tinker Store
                </A>
            </div>
            <div class="navbar-end px-2 lg:px-4 gap-1 lg:gap-2">
                <div class="flex">
                    <ul class="flex flex-row">
                        <ClerkLoaded>
                            <SignedIn>
                                <li><A href="/cart" class="btn btn-ghost btn-sm gap-2"><ShoppingCart size={18} /> <span class="hidden lg:inline">Cart</span></A></li>
                                <li><A href="/new-product" class="btn btn-ghost btn-sm gap-2"><Plus size={18} /> <span class="hidden lg:inline">Sell Product</span></A></li>
                            </SignedIn>
                        </ClerkLoaded>
                    </ul>
                </div>
                <ThemeSwitcher />
                <ClerkLoading>
                    <span class="loading loading-spinner loading-xs"></span>
                </ClerkLoading>
                <ClerkLoaded>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                    <SignedOut>
                        <SignInButton>
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
