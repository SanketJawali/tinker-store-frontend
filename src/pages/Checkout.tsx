import { createSignal, createResource, createMemo, Show } from "solid-js";
import { useSession, ClerkLoaded, SignedIn, SignedOut } from "clerk-solidjs";
import { useNavigate } from "@solidjs/router";
import CheckoutForm from "../components/CheckoutForm";
import OrderSuccess from "../components/OrderSuccess";
import OrderSummary from "../components/OrderSummary";
import { 
    CheckoutRequest, 
    CheckoutSuccessResponse, 
    CheckoutErrorResponse,
    CartListWrapper, 
    APIErrorResponse,
    CheckoutData
} from "../types";
import { fetchWithTimeout, parseJsonResponse, BACKEND_URL, CRITICAL_TIMEOUT } from '../lib/api';
import { showToast } from '../lib/toast';

const fetchCart = async (token: string) => {
    const response = await fetchWithTimeout(`${BACKEND_URL}/api/cart`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    });

    const data: CartListWrapper | APIErrorResponse = await parseJsonResponse(response);

    if (!response.ok || !data.success) {
        throw new Error((data as APIErrorResponse).message || 'Failed to fetch cart');
    }

    return (data as CartListWrapper).data;
};

export default function Checkout() {
    const { session } = useSession();
    const navigate = useNavigate();
    
    const [checkoutLoading, setCheckoutLoading] = createSignal(false);
    const [orderData, setOrderData] = createSignal<CheckoutData | null>(null);

    // Fetch cart data
    const [cartItems] = createResource(
        () => session(),
        async (currentSession) => {
            if (!currentSession) throw new Error("No session");
            const token = await currentSession.getToken();
            if (!token) throw new Error("No token");
            return await fetchCart(token);
        }
    );

    // Calculate totals
    const subtotal = createMemo(() => {
        const items = cartItems();
        if (!items) return 0;
        return items.reduce((sum: number, item) => sum + (item.price * item.quantity), 0);
    });

    const tax = createMemo(() => subtotal() * 0.1);
    const shipping = 10;
    const total = createMemo(() => subtotal() + tax() + shipping);

    const handleCheckout = async (checkoutData: CheckoutRequest) => {
        const currentSession = session();
        if (!currentSession) {
            showToast("Please log in to continue", "error");
            return;
        }

        const token = await currentSession.getToken();
        if (!token) {
            showToast("Authentication failed. Please log in again", "error");
            return;
        }

        setCheckoutLoading(true);

        try {
            const response = await fetchWithTimeout(`${BACKEND_URL}/api/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(checkoutData),
                timeout: CRITICAL_TIMEOUT, // Use longer timeout for checkout
            });

            const data: CheckoutSuccessResponse | CheckoutErrorResponse = await parseJsonResponse(response);

            if (response.ok && data.success) {
                // Success
                const successData = data as CheckoutSuccessResponse;
                setOrderData(successData.data);
                showToast(successData.message || "Order placed successfully!", "success");
                // Scroll to top to show success message
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Error from backend
                const errorData = data as CheckoutErrorResponse;
                showToast(errorData.message || "Failed to place order", "error");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            showToast("Network error. Please check your connection and try again", "error");
        } finally {
            setCheckoutLoading(false);
        }
    };

    return (
        <div class="min-h-screen bg-base-200">
            <div class="container mx-auto p-4 md:p-8">
                <ClerkLoaded>
                    <SignedOut>
                        <div class="card bg-base-100 shadow-xl max-w-2xl mx-auto">
                            <div class="card-body items-center text-center py-16">
                                <div class="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h2 class="text-xl font-bold text-base-content mb-2">Please sign in</h2>
                                <p class="text-base-content/60 max-w-sm">You need to be logged in to checkout.</p>
                            </div>
                        </div>
                    </SignedOut>

                    <SignedIn>
                        <Show when={!orderData()}>
                            <h1 class="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Checkout</h1>
                            
                            <Show 
                                when={!cartItems.loading && cartItems() && cartItems()!.length > 0}
                                fallback={
                                    <Show when={!cartItems.loading} fallback={<CheckoutSkeleton />}>
                                        <div class="card bg-base-100 shadow-xl max-w-2xl mx-auto">
                                            <div class="card-body items-center text-center py-16">
                                                <div class="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mb-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </div>
                                                <h2 class="text-xl font-bold text-base-content mb-2">Your cart is empty</h2>
                                                <p class="text-base-content/60 max-w-sm mb-4">Add some items to your cart before checking out</p>
                                                <button 
                                                    class="btn btn-primary"
                                                    onClick={() => navigate('/')}
                                                >
                                                    Continue Shopping
                                                </button>
                                            </div>
                                        </div>
                                    </Show>
                                }
                            >
                                <div class="flex flex-col lg:flex-row gap-8">
                                    {/* Left Side: Checkout Form */}
                                    <div class="flex-1">
                                        <div class="card bg-base-100 shadow-xl border border-base-300">
                                            <div class="card-body p-6 sm:p-8">
                                                <h2 class="card-title text-xl mb-4">Delivery Details</h2>
                                                <CheckoutForm 
                                                    onSubmit={handleCheckout}
                                                    loading={checkoutLoading()}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side: Order Summary */}
                                    <div class="w-full lg:w-96 shrink-0">
                                        <OrderSummary
                                            cartItems={cartItems()!}
                                            subtotal={subtotal()}
                                            tax={tax()}
                                            shipping={shipping}
                                            total={total()}
                                        />
                                    </div>
                                </div>
                            </Show>
                        </Show>

                        {/* Success State */}
                        <Show when={orderData()}>
                            <OrderSuccess orderData={orderData()!} />
                        </Show>
                    </SignedIn>
                </ClerkLoaded>
            </div>

            {/* Add CSS for toast animations */}
            <style>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slide-out {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
                
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
                
                .animate-slide-out {
                    animation: slide-out 0.3s ease-in;
                }
            `}</style>
        </div>
    );
}

// Skeleton component for checkout loading state
const CheckoutSkeleton = () => {
    return (
        <div class="flex flex-col lg:flex-row gap-8 animate-pulse">
            {/* Left Side: Checkout Form Skeleton */}
            <div class="flex-1">
                <div class="card bg-base-100 shadow-xl border border-base-300">
                    <div class="card-body p-6 sm:p-8">
                        <div class="h-7 w-40 bg-base-300 rounded mb-6"></div>
                        
                        <div class="space-y-6">
                            {/* Name field skeleton */}
                            <div class="form-control">
                                <div class="h-5 w-24 bg-base-300 rounded mb-2"></div>
                                <div class="h-12 bg-base-300 rounded-lg"></div>
                            </div>

                            {/* Address field skeleton */}
                            <div class="form-control">
                                <div class="h-5 w-32 bg-base-300 rounded mb-2"></div>
                                <div class="h-24 bg-base-300 rounded-lg"></div>
                            </div>

                            {/* Phone field skeleton */}
                            <div class="form-control">
                                <div class="h-5 w-28 bg-base-300 rounded mb-2"></div>
                                <div class="h-12 bg-base-300 rounded-lg"></div>
                            </div>

                            {/* Payment method skeleton */}
                            <div class="form-control">
                                <div class="h-5 w-36 bg-base-300 rounded mb-2"></div>
                                <div class="h-12 bg-base-300 rounded-lg"></div>
                            </div>

                            {/* Submit button skeleton */}
                            <div class="h-14 bg-base-300 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Order Summary Skeleton */}
            <div class="w-full lg:w-96 shrink-0">
                <div class="card bg-base-100 shadow-xl border border-base-300 lg:sticky lg:top-24">
                    <div class="card-body p-6">
                        {/* Header skeleton */}
                        <div class="flex items-center gap-2 mb-4">
                            <div class="w-5 h-5 bg-base-300 rounded"></div>
                            <div class="h-6 w-32 bg-base-300 rounded"></div>
                        </div>

                        {/* Items count skeleton */}
                        <div class="space-y-3 mb-4">
                            <div class="flex items-center gap-2">
                                <div class="w-4 h-4 bg-base-300 rounded"></div>
                                <div class="h-4 w-16 bg-base-300 rounded"></div>
                            </div>

                            {/* Cart items skeleton */}
                            <div class="space-y-2">
                                {[1, 2].map(() => (
                                    <div class="flex gap-3 p-2 bg-base-200 rounded-lg">
                                        <div class="w-16 h-16 bg-base-300 rounded-lg shrink-0"></div>
                                        <div class="flex-1 space-y-2">
                                            <div class="h-4 bg-base-300 rounded w-full"></div>
                                            <div class="flex justify-between">
                                                <div class="h-3 bg-base-300 rounded w-12"></div>
                                                <div class="h-4 bg-base-300 rounded w-16"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div class="divider my-2"></div>

                        {/* Price breakdown skeleton */}
                        <div class="space-y-2">
                            <div class="flex justify-between py-2">
                                <div class="h-4 w-16 bg-base-300 rounded"></div>
                                <div class="h-4 w-20 bg-base-300 rounded"></div>
                            </div>
                            <div class="flex justify-between py-2">
                                <div class="h-4 w-24 bg-base-300 rounded"></div>
                                <div class="h-4 w-16 bg-base-300 rounded"></div>
                            </div>
                            <div class="flex justify-between py-2">
                                <div class="h-4 w-20 bg-base-300 rounded"></div>
                                <div class="h-4 w-16 bg-base-300 rounded"></div>
                            </div>
                        </div>

                        <div class="divider my-2"></div>

                        {/* Total skeleton */}
                        <div class="flex justify-between">
                            <div class="h-7 w-16 bg-base-300 rounded"></div>
                            <div class="h-7 w-24 bg-base-300 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
