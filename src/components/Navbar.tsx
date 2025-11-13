import { A } from "@solidjs/router";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  ClerkLoading,
  ClerkLoaded
} from "clerk-solidjs";

export default () => {
  return (
    <div class="navbar bg-base-100 shadow-md">
      <div class="flex-1">
        <A href="/" class="btn btn-ghost text-2xl cursor-pointer">Tinker Store</A>
      </div>
      <div class="flex-none px-4">
        <ClerkLoading>
          <p>Loading...</p>
        </ClerkLoading>
        <ClerkLoaded>
          <SignedIn>
            <ul class="menu menu-horizontal px-1 flex items-center py-0">
              <li><A href="/cart">Cart</A></li>
              <li><A href="/about">About</A></li>
              <li><A href="/contact">Contact</A></li>
              <li><UserButton /></li>
            </ul>
          </SignedIn>
          <SignedOut>
            <ul class="menu menu-horizontal px-1 flex items-center py-0">
              <li><A href="/about">About</A></li>
              <li><A href="/contact">Contact</A></li>
              <li>
                <SignInButton class="p-0">
                  <button class='btn bg-primary'>
                    Sign In
                  </button>
                </SignInButton>
              </li>
            </ul>
          </SignedOut>
        </ClerkLoaded>
      </div>
    </div >
  )
};
