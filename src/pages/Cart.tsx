import { ClerkLoaded, SignedIn, SignedOut } from "clerk-solidjs";
import CartContent from "../components/CartContent";

export default function CartPage() {
    return (
        <div class="min-h-screen bg-base-200">
            <div class="container mx-auto p-4 md:p-8">
                <h1 class="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Shopping Cart</h1>

                <ClerkLoaded>
                    <SignedOut>
                        <div class="card bg-base-100 shadow-xl">
                            <div class="card-body items-center text-center py-16">
                                <div class="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h2 class="text-xl font-bold text-base-content mb-2">Please sign in</h2>
                                <p class="text-base-content/60 max-w-sm">You need to be logged in to view and manage your shopping cart.</p>
                            </div>
                        </div>
                    </SignedOut>

                    <SignedIn>
                        <CartContent />
                    </SignedIn>
                </ClerkLoaded>
            </div>
        </div>
    );
}
