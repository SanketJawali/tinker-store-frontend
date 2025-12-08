import { createSignal, createMemo, For, Show } from "solid-js";

export default function CartPage() {
    // Mock Data - Replace with your global store or API data
    const [cartItems, setCartItems] = createSignal([
        { id: 1, name: "Premium Wireless Headphones", price: 199.99, quantity: 1, image: "https://via.placeholder.com/150" },
        { id: 2, name: "Ergonomic Mechanical Keyboard", price: 145.00, quantity: 2, image: "https://via.placeholder.com/150" },
        { id: 3, name: "USB-C Fast Charger", price: 25.50, quantity: 1, image: "https://via.placeholder.com/150" },
    ]);

    // Derived State for Calculations
    const subtotal = createMemo(() =>
        cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0)
    );

    const tax = createMemo(() => subtotal() * 0.1); // 10% tax example
    const total = createMemo(() => subtotal() + tax() + 10); // +$10 Shipping

    // Handlers
    const updateQuantity = (id, change) => {
        setCartItems((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const newQty = Math.max(1, item.quantity + change);
                    return { ...item, quantity: newQty };
                }
                return item;
            })
        );
    };

    const removeItem = (id) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <div class="container mx-auto p-4 md:p-8">
            <h1 class="text-3xl font-bold mb-8">Shopping Cart</h1>

            <Show
                when={cartItems().length > 0}
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
                                            <img src={item.image} alt={item.name} />
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div class="flex-1 text-center sm:text-left">
                                        <h3 class="font-bold text-lg">{item.name}</h3>
                                        <p class="text-base-content/70 text-sm">Ref: {item.id}</p>
                                        <div class="mt-2 font-semibold text-primary">
                                            ${item.price.toFixed(2)}
                                        </div>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div class="flex items-center gap-2">
                                        <button
                                            class="btn btn-sm btn-circle btn-ghost"
                                            onClick={() => updateQuantity(item.id, -1)}
                                        >
                                            -
                                        </button>
                                        <span class="w-8 text-center font-bold">{item.quantity}</span>
                                        <button
                                            class="btn btn-sm btn-circle btn-ghost"
                                            onClick={() => updateQuantity(item.id, 1)}
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        class="btn btn-ghost btn-sm text-error"
                                        onClick={() => removeItem(item.id)}
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
                                    <span>${subtotal().toFixed(2)}</span>
                                </div>

                                <div class="flex justify-between py-2">
                                    <span>Estimated Tax</span>
                                    <span>${tax().toFixed(2)}</span>
                                </div>

                                <div class="flex justify-between py-2">
                                    <span>Shipping</span>
                                    <span>$10.00</span>
                                </div>

                                <div class="divider my-2"></div>

                                <div class="flex justify-between font-bold text-lg text-primary">
                                    <span>Total</span>
                                    <span>${total().toFixed(2)}</span>
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
        </div>
    );
}
