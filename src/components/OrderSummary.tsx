import { For } from "solid-js";
import { CartItem } from "../types";
import { ShoppingBag, Truck, Receipt } from 'lucide-solid';
import { A } from "@solidjs/router";

interface OrderSummaryProps {
    cartItems: CartItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
}

export default function OrderSummary(props: OrderSummaryProps) {
    return (
        <div class="card bg-base-100 shadow-xl border border-base-300 lg:sticky lg:top-24">
            <div class="card-body p-6">
                <div class="flex items-center gap-2 mb-4">
                    <Receipt size={20} class="text-secondary" />
                    <h2 class="card-title text-xl">Order Summary</h2>
                </div>

                {/* Cart Items List */}
                <div class="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    <div class="flex items-center gap-2 mb-2 text-sm text-base-content/60">
                        <ShoppingBag size={16} />
                        <span>{props.cartItems.length} {props.cartItems.length === 1 ? 'item' : 'items'}</span>
                    </div>
                    <For each={props.cartItems}>
                        {(item) => (
                            <div class="flex gap-3 p-2 bg-base-200 rounded-lg">
                                <A href={`/product/${item.product_id}`} class="avatar shrink-0">
                                    <div class="w-16 h-16 rounded-lg bg-base-300">
                                        <img src={item.image_url} alt={item.name} class="object-cover" />
                                    </div>
                                </A>
                                <div class="flex-1 min-w-0">
                                    <A href={`/product/${item.product_id}`} class="no-underline">
                                        <h4 class="font-semibold text-sm truncate hover:text-primary transition-colors">{item.name}</h4>
                                    </A>
                                    <div class="flex justify-between items-center mt-1">
                                        <span class="text-xs text-base-content/60">Qty: {item.quantity}</span>
                                        <span class="font-bold text-sm text-accent">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </For>
                </div>

                <div class="divider my-2"></div>

                {/* Price Breakdown */}
                <div class="space-y-2">
                    <div class="flex justify-between py-2 text-base-content/80">
                        <span>Subtotal</span>
                        <span>₹{props.subtotal.toFixed(2)}</span>
                    </div>

                    <div class="flex justify-between py-2 text-base-content/80">
                        <span>Estimated Tax</span>
                        <span>₹{props.tax.toFixed(2)}</span>
                    </div>

                    <div class="flex justify-between py-2 text-base-content/80 items-center">
                        <span class="flex items-center gap-1">
                            <Truck size={16} />
                            Shipping
                        </span>
                        <span>₹{props.shipping.toFixed(2)}</span>
                    </div>
                </div>

                <div class="divider my-2"></div>

                <div class="flex justify-between text-xl font-bold text-base-content">
                    <span>Total</span>
                    <span>₹{props.total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
