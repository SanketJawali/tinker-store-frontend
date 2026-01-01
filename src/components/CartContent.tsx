import { createMemo, For, Show, createResource } from "solid-js";
import { CartListWrapper, APIErrorResponse } from "../types";
import { useSession } from "clerk-solidjs";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const fetchCart = async () => {
    const { session } = useSession();

    const currentSession = session();
    if (!currentSession) {
        throw new Error("No active session found. User might not be logged in.");
    }

    const authToken = await currentSession.getToken();
    if (!authToken) {
        throw new Error("No active session found. User might not be logged in.");
    }

    const response = await fetch(`${BACKEND_URL}/api/cart`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken.toString()}`
        },
    });

    const data: CartListWrapper | APIErrorResponse = await response.json();

    if (!response.ok || !data.success) {
        throw new Error((data as APIErrorResponse).message || 'Failed to fetch cart');
    }

    return (data as CartListWrapper).data;
};

export default function CartContent() {
    // Fetch cart data
    const [cartItems, { mutate, refetch }] = createResource(fetchCart);

    // Derived State for Calculations
    const subtotal = createMemo(() => {
        const items = cartItems();
        if (!items) return 0;
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    });

    const tax = createMemo(() => subtotal() * 0.1); // 10% tax example
    const total = createMemo(() => subtotal() + tax() + 10); // +$10 Shipping

    // Handlers
    const updateQuantity = async (id: number, change: number) => {
        console.log(`Update quantity for cart_id ${id} by ${change}`);
        // await fetch(`${BACKEND_URL}/api/cart/${id}`, { method: 'PUT', ... });
        // refetch();
    };

    const removeItem = async (id: number) => {
        console.log(`Remove cart_id ${id}`);
        // TODO: await fetch(`${BACKEND_URL}/api/cart/${id}`, { method: 'DELETE' });
        // refetch();
    };

    return (
        <Show when={!cartItems.loading} fallback={<div class="text-center py-20"><span class="loading loading-spinner loading-lg"></span></div>}>
            <Show
                when={cartItems() && cartItems()!.length > 0}
                fallback={
                    <div class="text-center py-20">
                        <h2 class="text-2xl font-bold text-base-content/50">Your cart is empty</h2>
                        <a href="/" class="btn btn-primary mt-4">Continue Shopping</a>
                    </div>
                }
            >
                <div class="flex flex-col lg:flex-row gap-8">

                    {/* Left Side: Cart Items */}
                    <div class="flex-1 flex flex-col gap-4">
                        <For each={cartItems()}>
                            {(item) => (
                                <div class="flex flex-col sm:flex-row items-center gap-4 p-4 bg-base-100 shadow-md rounded-box border border-base-200">

                                    {/* Image */}
                                    <div class="avatar">
                                        <div class="w-24 h-24 rounded-xl">
                                            <img src={item.image_url} alt={item.name} />
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div class="flex-1 text-center sm:text-left">
                                        <h3 class="font-bold text-lg">{item.name}</h3>
                                        <p class="text-base-content/70 text-sm">Ref: {item.product_id}</p>
                                        <div class="mt-2 font-semibold text-primary">
                                            ₹{item.price.toFixed(2)}
                                        </div>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div class="flex items-center gap-2">
                                        <button
                                            class="btn btn-sm btn-circle btn-ghost"
                                            onClick={() => updateQuantity(item.cart_id, -1)}
                                        >
                                            -
                                        </button>
                                        <span class="w-8 text-center font-bold">{item.quantity}</span>
                                        <button
                                            class="btn btn-sm btn-circle btn-ghost"
                                            onClick={() => updateQuantity(item.cart_id, 1)}
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        class="btn btn-ghost btn-sm text-error"
                                        onClick={() => removeItem(item.cart_id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </For>
                    </div>

                    {/* Right Side: Order Summary */}
                    <div class="w-full lg:w-96">
                        <div class="card bg-base-100 shadow-xl border border-base-200 sticky top-4">
                            <div class="card-body">
                                <h2 class="card-title mb-4">Order Summary</h2>

                                <div class="flex justify-between py-2">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal().toFixed(2)}</span>
                                </div>

                                <div class="flex justify-between py-2">
                                    <span>Estimated Tax</span>
                                    <span>₹{tax().toFixed(2)}</span>
                                </div>

                                <div class="flex justify-between py-2">
                                    <span>Shipping</span>
                                    <span>₹10.00</span>
                                </div>

                                <div class="divider my-2"></div>

                                <div class="flex justify-between font-bold text-lg text-primary">
                                    <span>Total</span>
                                    <span>₹{total().toFixed(2)}</span>
                                </div>

                                <div class="card-actions mt-6">
                                    <button class="btn btn-primary btn-block">
                                        Checkout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </Show>
        </Show>
    );
}
