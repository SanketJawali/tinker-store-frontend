import { A } from "@solidjs/router";
import { CheckCircle2, ShoppingBag, Calendar } from 'lucide-solid';
import { CheckoutData } from "../types";

interface OrderSuccessProps {
    orderData: CheckoutData;
}

export default function OrderSuccess(props: OrderSuccessProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div class="max-w-2xl mx-auto">
            <div class="card bg-base-100 shadow-xl border border-base-300">
                <div class="card-body items-center text-center p-8 sm:p-12">
                    {/* Success Icon */}
                    <div class="rounded-full bg-success/10 p-6 mb-6">
                        <CheckCircle2 size={64} class="text-success" />
                    </div>

                    {/* Title */}
                    <h1 class="text-2xl sm:text-3xl font-bold text-base-content mb-2">
                        Order Placed Successfully!
                    </h1>
                    
                    <p class="text-base-content/60 mb-8 max-w-md">
                        Thank you for your order. We've received your order and will start processing it shortly.
                    </p>

                    {/* Order Details Card */}
                    <div class="w-full bg-base-200 rounded-xl p-6 mb-8 text-left">
                        <div class="space-y-4">
                            <div class="flex justify-between items-center pb-4 border-b border-base-300">
                                <span class="text-base-content/60">Order ID</span>
                                <span class="font-bold text-lg text-base-content">#{props.orderData.order_id}</span>
                            </div>
                            
                            <div class="flex justify-between items-center pb-4 border-b border-base-300">
                                <span class="text-base-content/60 flex items-center gap-2">
                                    <ShoppingBag size={16} />
                                    Items
                                </span>
                                <span class="font-semibold text-base-content">{props.orderData.item_count} {props.orderData.item_count === 1 ? 'item' : 'items'}</span>
                            </div>
                            
                            <div class="flex justify-between items-center pb-4 border-b border-base-300">
                                <span class="text-base-content/60">Total Amount</span>
                                <span class="font-bold text-xl text-success">₹{props.orderData.total_amount.toFixed(2)}</span>
                            </div>
                            
                            <div class="flex justify-between items-center">
                                <span class="text-base-content/60 flex items-center gap-2">
                                    <Calendar size={16} />
                                    Order Date
                                </span>
                                <span class="text-sm text-base-content">{formatDate(props.orderData.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div class="flex flex-col sm:flex-row gap-3 w-full">
                        <A href="/" class="btn btn-primary flex-1">
                            <ShoppingBag size={18} />
                            Continue Shopping
                        </A>
                        <A href="/orders" class="btn btn-outline flex-1">
                            View Orders
                        </A>
                    </div>

                    {/* Additional Info */}
                    <div class="mt-8 p-4 bg-info/10 rounded-lg w-full">
                        <p class="text-sm text-base-content/70">
                            📧 A confirmation email has been sent to your registered email address.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
