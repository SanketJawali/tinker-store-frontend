import { createMemo, For, Show, createResource, createSignal, createEffect } from "solid-js";
import { CartListWrapper, APIErrorResponse, CartItem } from "../types";
import { useSession } from "clerk-solidjs";
import { addToCart } from "../lib/cartHelpers";
import { NewCartItem } from "../types";
import { A } from "@solidjs/router";
import { ShoppingBag, Minus, Plus, X, ShoppingCart, Truck, Receipt, CreditCard } from 'lucide-solid';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Helper function stays the same
async function handleAddToCart(cartItem: NewCartItem, authToken: string) {
    // console.log("Adding to cart with token:", authToken.substring(0, 10) + "...");
    return await addToCart(cartItem, authToken);
}

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

export default () => {
    const { session } = useSession();

    const currentSession = session();

    if (!currentSession) {
        alert("Please log in to add items to cart.");
        return;
    }


    // Fetch cart data
    const [fetchedCartItems, { mutate, refetch }] = createResource(fetchCart);
    const [cartItems, setCartItems] = createSignal(fetchedCartItems());
    const [loading, setLoading] = createSignal(fetchedCartItems.loading);

    createEffect(() => {
        if (fetchedCartItems.loading === false) {
            setLoading(false);
        };
        // console.log(`Is loading is changed: `, loading());
    });

    createEffect(() => {
        setCartItems(fetchedCartItems());
        // console.log("Cart items updated:", cartItems());
    });

    // Derived State for Calculations
    const subtotal = createMemo(() => {
        const items = cartItems();
        if (!items) return 0;
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    });

    const tax = createMemo(() => subtotal() * 0.1); // 10% tax example
    const total = createMemo(() => subtotal() + tax() + 10); // +10 Shipping

    // Handlers
    const updateQuantity = async (cartId: number, productId: number, change: number) => {
        const token = await currentSession.getToken();
        if (token) {
            try {
                const response = await handleAddToCart(
                    { cart_id: cartId, product_id: productId, quantity: change },
                    token
                );

                if (response == null) {
                    console.error("No response from server when trying to update item from cart");
                    throw new Error("No response from server");
                }

                if (response.success == true) {

                    const prevItems = cartItems();
                    if (prevItems == null) throw new Error("No cart item found");

                    setCartItems((prevItem) => {
                        if (prevItem == null) return prevItem;

                        const updatedItems = prevItem.map(item => {
                            if (item.cart_id === cartId) {
                                return {
                                    ...item,
                                    quantity: item.quantity + change
                                };
                            }
                            return item;
                        }).filter(item => item.quantity > 0);

                        return updatedItems;
                    });
                }

            }
            catch (e) {
                console.error("Failed to update item from cart:", e);
            }
        }
    };

    const removeItem = async (cartId: number, productId: number, quantity: number) => {
        const token = await currentSession.getToken();
        if (token) {
            try {
                const response = await handleAddToCart(
                    { cart_id: cartId, product_id: productId, quantity: quantity * -1 },
                    token
                )

                if (response == null) {
                    console.error("No response from server when trying to remove item from cart");
                    throw new Error("No response from server");
                }

                if (response.success == true) {
                    setCartItems((prevItems) => prevItems?.filter(item => item.cart_id !== cartId) || []);
                }

            }
            catch (e) {
                console.error("Failed to remove item from cart:", e);
            }
        };
    }
    return (
        <Show when={!loading()} fallback={<div class="text-center py-20"><span class="loading loading-spinner loading-lg"></span></div>}>
            <Show
                when={cartItems() && cartItems()!.length > 0}
                fallback={
                    <div class="text-center py-20">
                        <div class="flex justify-center mb-4">
                            <div class="rounded-full bg-base-200 p-6">
                                <ShoppingBag size={48} class="text-base-content/30" />
                            </div>
                        </div>
                        <h2 class="text-2xl font-bold text-base-content mb-2">Your cart is empty</h2>
                        <p class="text-base-content/60 mb-4">Looks like you haven't added anything to your cart yet</p>
                        <A href="/" class="btn btn-primary">
                            <ShoppingCart size={18} />
                            Continue Shopping
                        </A>
                    </div>
                }
            >
                <div class="flex flex-col lg:flex-row gap-8 pb-20 lg:pb-0">

                    {/* Left Side: Cart Items */}
                    <div class="flex-1 flex flex-col gap-4">
                        <div class="flex items-center gap-2 mb-2">
                            <ShoppingBag size={20} class="text-secondary" />
                            <h2 class="text-lg font-bold">Shopping Cart ({cartItems()?.length || 0} items)</h2>
                        </div>
                        <For each={cartItems()}>
                            {(item) => (
                                <div class="flex flex-row items-center gap-4 p-4 bg-base-100 shadow-sm hover:shadow-md transition-shadow rounded-xl border border-base-300">

                                    {/* Image */}
                                    <div class="avatar shrink-0">
                                        <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-base-200">
                                            <img src={item.image_url} alt={item.name} class="object-cover" />
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div class="flex-1 min-w-0">
                                        <div class="flex justify-between items-start">
                                            <div>
                                                <h3 class="font-bold text-base sm:text-lg truncate">{item.name}</h3>
                                                <p class="text-base-content/60 text-xs sm:text-sm">Ref: {item.product_id}</p>
                                            </div>
                                            <button
                                                class="btn btn-ghost btn-xs text-error sm:hidden"
                                                onClick={() => removeItem(item.cart_id, item.product_id, item.quantity)}
                                                aria-label="Remove item"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>

                                        <div class="flex flex-col sm:flex-row sm:items-end justify-between mt-2 gap-2">
                                             <div class="font-bold text-accent text-lg">
                                                ₹{item.price.toFixed(2)}
                                            </div>

                                            <div class="flex items-center gap-3">
                                                 <div class="join border border-base-300 rounded-lg h-9">
                                                    <button
                                                        class="join-item btn btn-xs btn-ghost px-3 h-full hover:bg-base-200"
                                                        onClick={() => updateQuantity(item.cart_id, item.product_id, -1)}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <div class="join-item px-4 flex items-center justify-center bg-base-100 text-sm font-bold min-w-10 h-full border-x border-base-300">
                                                        {item.quantity}
                                                    </div>
                                                    <button
                                                        class="join-item btn btn-xs btn-ghost px-3 h-full hover:bg-base-200"
                                                        onClick={() => updateQuantity(item.cart_id, item.product_id, 1)}
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                
                                                <button 
                                                    class="btn btn-ghost btn-xs text-error hidden sm:flex gap-1" 
                                                    onClick={() => removeItem(item.cart_id, item.product_id, item.quantity)}
                                                >
                                                    <X size={14} />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </For>
                    </div>

                    {/* Right Side: Order Summary */}
                    <div class="w-full lg:w-96 shrink-0">
                        <div class="card bg-base-100 shadow-xl border border-base-300 lg:sticky lg:top-24">
                            <div class="card-body p-6">
                                <div class="flex items-center gap-2 mb-4">
                                    <Receipt size={20} class="text-secondary" />
                                    <h2 class="card-title text-xl">Order Summary</h2>
                                </div>

                                <div class="flex justify-between py-2 text-base-content/80">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal().toFixed(2)}</span>
                                </div>

                                <div class="flex justify-between py-2 text-base-content/80">
                                    <span>Estimated Tax</span>
                                    <span>₹{tax().toFixed(2)}</span>
                                </div>

                                <div class="flex justify-between py-2 text-base-content/80">
                                    <div class="flex items-center gap-1">
                                        <Truck size={14} />
                                        <span>Shipping</span>
                                    </div>
                                    <span>₹10.00</span>
                                </div>

                                <div class="divider my-2"></div>

                                <div class="flex justify-between font-bold text-xl text-accent mb-6">
                                    <span>Total</span>
                                    <span>₹{total().toFixed(2)}</span>
                                </div>

                                <div class="card-actions flex flex-col gap-2">
                                    <A href="/checkout" class="btn btn-primary btn-block shadow-lg">
                                        <CreditCard size={18} />
                                        Proceed to Checkout
                                    </A>
                                    <A href="/" class="btn btn-ghost btn-block btn-sm">
                                        <ShoppingCart size={16} />
                                        Continue Shopping
                                    </A>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </Show>
        </Show>
    );
}

