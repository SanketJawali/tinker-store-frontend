import { ClerkLoading, ClerkLoaded, SignedIn, SignedOut } from "clerk-solidjs";
import CartContent from "../components/CartContent";

export default function CartPage() {
    return (
        <div class="container mx-auto p-4 md:p-8">
            <h1 class="text-3xl font-bold mb-8">Shopping Cart</h1>

            <ClerkLoading>
                <div class="text-center py-20"><span class="loading loading-spinner loading-lg"></span></div>
            </ClerkLoading>

            <ClerkLoaded>
                <SignedOut>
                    <div class="text-center py-20">
                        <h2 class="text-2xl font-bold text-base-content/50">Please sign in to view your cart</h2>
                        <p class="mt-4">You need to be logged in to manage your cart.</p>
                    </div>
                </SignedOut>

                <SignedIn>
                    <CartContent />
                </SignedIn>
            </ClerkLoaded>
        </div>
    );
}
