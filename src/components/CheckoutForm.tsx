import { createSignal } from "solid-js";
import { CheckoutRequest } from "../types";
import { User, MapPin, Phone, CreditCard } from 'lucide-solid';

interface CheckoutFormProps {
    onSubmit: (data: CheckoutRequest) => Promise<void>;
    loading: boolean;
}

export default function CheckoutForm(props: CheckoutFormProps) {
    const [name, setName] = createSignal("");
    const [address, setAddress] = createSignal("");
    const [phone, setPhone] = createSignal("");
    const [paymentMethod, setPaymentMethod] = createSignal("card");
    
    const [errors, setErrors] = createSignal<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name().trim()) {
            newErrors.name = "Full name is required";
        }

        if (!address().trim()) {
            newErrors.address = "Address is required";
        }

        if (!phone().trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\d{10}$/.test(phone().replace(/[\s-]/g, ''))) {
            newErrors.phone = "Please enter a valid 10-digit phone number";
        }

        if (!paymentMethod()) {
            newErrors.paymentMethod = "Please select a payment method";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        
        if (!validate()) {
            return;
        }

        const checkoutData: CheckoutRequest = {
            name: name().trim(),
            address: address().trim(),
            phone: phone().trim(),
            payment_method: paymentMethod(),
        };

        await props.onSubmit(checkoutData);
    };

    return (
        <form onSubmit={handleSubmit} class="space-y-6">
            {/* Shipping Name */}
            <div class="form-control">
                <label class="label">
                    <span class="label-text font-semibold flex items-center gap-2">
                        <User size={16} class="text-primary" />
                        Full Name
                    </span>
                </label>
                <input
                    type="text"
                    placeholder="Enter your full name"
                    class={`input input-bordered w-full ${errors().name ? 'input-error' : ''}`}
                    value={name()}
                    onInput={(e) => {
                        setName(e.currentTarget.value);
                        if (errors().name) {
                            setErrors({ ...errors(), name: "" });
                        }
                    }}
                    disabled={props.loading}
                />
                {errors().name && (
                    <label class="label">
                        <span class="label-text-alt text-error">{errors().name}</span>
                    </label>
                )}
            </div>

            {/* Shipping Address */}
            <div class="form-control">
                <label class="label">
                    <span class="label-text font-semibold flex items-center gap-2">
                        <MapPin size={16} class="text-primary" />
                        Delivery Address
                    </span>
                </label>
                <textarea
                    placeholder="Enter your complete delivery address"
                    class={`textarea textarea-bordered w-full h-24 ${errors().address ? 'textarea-error' : ''}`}
                    value={address()}
                    onInput={(e) => {
                        setAddress(e.currentTarget.value);
                        if (errors().address) {
                            setErrors({ ...errors(), address: "" });
                        }
                    }}
                    disabled={props.loading}
                />
                {errors().address && (
                    <label class="label">
                        <span class="label-text-alt text-error">{errors().address}</span>
                    </label>
                )}
            </div>

            {/* Phone Number */}
            <div class="form-control">
                <label class="label">
                    <span class="label-text font-semibold flex items-center gap-2">
                        <Phone size={16} class="text-primary" />
                        Phone Number
                    </span>
                </label>
                <input
                    type="tel"
                    placeholder="10-digit phone number"
                    class={`input input-bordered w-full ${errors().phone ? 'input-error' : ''}`}
                    value={phone()}
                    onInput={(e) => {
                        setPhone(e.currentTarget.value);
                        if (errors().phone) {
                            setErrors({ ...errors(), phone: "" });
                        }
                    }}
                    disabled={props.loading}
                />
                {errors().phone && (
                    <label class="label">
                        <span class="label-text-alt text-error">{errors().phone}</span>
                    </label>
                )}
            </div>

            {/* Payment Method */}
            <div class="form-control">
                <label class="label">
                    <span class="label-text font-semibold flex items-center gap-2">
                        <CreditCard size={16} class="text-primary" />
                        Payment Method
                    </span>
                </label>
                <select
                    class={`select select-bordered w-full ${errors().paymentMethod ? 'select-error' : ''}`}
                    value={paymentMethod()}
                    onChange={(e) => {
                        setPaymentMethod(e.currentTarget.value);
                        if (errors().paymentMethod) {
                            setErrors({ ...errors(), paymentMethod: "" });
                        }
                    }}
                    disabled={props.loading}
                >
                    <option value="card">Credit/Debit Card</option>
                    <option value="upi">UPI</option>
                    <option value="cod">Cash on Delivery</option>
                    <option value="netbanking">Net Banking</option>
                </select>
                {errors().paymentMethod && (
                    <label class="label">
                        <span class="label-text-alt text-error">{errors().paymentMethod}</span>
                    </label>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                class="btn btn-primary btn-block btn-lg"
                disabled={props.loading}
            >
                {props.loading ? (
                    <>
                        <span class="loading loading-spinner"></span>
                        Processing...
                    </>
                ) : (
                    <>
                        <CreditCard size={20} />
                        Place Order
                    </>
                )}
            </button>
        </form>
    );
}
