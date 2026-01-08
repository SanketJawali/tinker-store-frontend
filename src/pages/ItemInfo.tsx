import { useSession } from "clerk-solidjs";
import { createResource, createSignal, Suspense, Show, For } from "solid-js";
import { useParams } from "@solidjs/router";
import { A } from "@solidjs/router";
import { SolidMarkdown } from "solid-markdown";
import { getOptimizedImageUrl, ImageKitTransformation } from '../lib/imagekit';
import ReviewSection, { Review } from '../components/Reviews';
import { Product, SingleProductResponse, NewCartItem } from '../types';
import { addToCart } from "../lib/cartHelpers";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
// --- Fetchers ---
const fetchProduct = async (id: string): Promise<Product> => {
    const response = await fetch(`${BACKEND_URL}/api/product/${id}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    const json: SingleProductResponse = await response.json();
    console.log("Fetched product:", json);

    if (!json.success || !json.data) {
        throw new Error(`API Error: ${json.message}`);
    }

    // Ensure price is a number to prevent .toLocaleString() crashes
    return {
        ...json.data.product,
        price: Number(json.data.product.price)
    };
};

// Keeping reviews mocked for now as no API route was provided for them
const fetchReviews = async (id: string): Promise<Review[]> => {
    await new Promise(r => setTimeout(r, 1000));
    return [
        { id: 1, user: "John Doe", rating: 5, comment: "Excellent build quality!", date: "2023-11-01" },
        { id: 2, user: "Jane Smith", rating: 4, comment: "Good, but shipping was slow.", date: "2023-10-25" },
    ];
};

async function handleAddToCart(cartItem: NewCartItem, authToken: string) {
    return await addToCart(cartItem, authToken);
}

export default () => {
    // 1. Use the hook inside the component
    const { session } = useSession();

    const [addToCartLoading, setAddToCartLoading] = createSignal<boolean>(false);
    const [buttonMessage, setButtonMessage] = createSignal<string>("Add to Cart");
    const [buttonColor, setButtonColor] = createSignal<string>("btn-primary");
    const [activeTab, setActiveTab] = createSignal<"Info" | "Description" | "Reviews">("Info");
    const [quantity, setQuantity] = createSignal<number>(1);

    const params = useParams();

    // 1. Use a function for the source to ensure reactivity to URL changes
    const [product] = createResource(() => params.id, fetchProduct);
    const [reviews] = createResource(() => params.id, fetchReviews);

    const onAddClick = async () => {
        const currentSession = session();
        if (!currentSession) {
            alert("Please log in to add items to cart.");
            return;
        }

        // 2. Get token asynchronously when the user CLICKS
        const token = await currentSession.getToken();

        if (token && !product.loading && product()?.id !== undefined) {
            setAddToCartLoading(true);

            // if (product == undefined || !product().id) {
            //     return;
            // }
            const response = await handleAddToCart(
                { product_id: product()!.id, quantity: quantity() },
                token
            );

            if (response?.success === true) {
                setButtonMessage("Added!");
                setButtonColor("btn-success");
                setTimeout(() => setButtonMessage("Add to Cart"), 2000);
                setTimeout(() => setButtonColor("btn-primary"), 2000);
            }
            else if (response?.success === false) {
                setButtonMessage("Error occured");
                setButtonColor("btn-error");
                setTimeout(() => setButtonMessage("Add to Cart"), 2000);
                setTimeout(() => setButtonColor("btn-primary"), 2000);
            }
        }
    };

    const getProductImage = (url: string) => {
        const transforms: ImageKitTransformation[] = [
            { height: '600', width: '600', crop: 'at_max_enlarge', background: 'white' }
        ];
        return getOptimizedImageUrl(url, transforms);
    };

    const scrollToSection = (id: string, tabName: () => "Info" | "Description" | "Reviews") => {
        const el = document.getElementById(id);
        if (el) {
            const offset = 100; // Adjust for sticky header
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
            setActiveTab(tabName());
        }
    };

    return (
        <div class="min-h-screen bg-base-200 pb-24 lg:pb-10">
            {/* Desktop Navigation Tabs */}
            <div class="sticky top-16 z-30 bg-base-100/90 backdrop-blur border-b border-base-200 shadow-sm hidden lg:block">
                <div class="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex gap-2">
                    <button
                        class={`btn btn-sm rounded-full ${activeTab() === 'Info' ? 'btn-neutral' : 'btn-ghost'}`}
                        onClick={() => scrollToSection('section-top', () => 'Info')}
                    >
                        Overview
                    </button>
                    <button
                        class={`btn btn-sm rounded-full ${activeTab() === 'Description' ? 'btn-neutral' : 'btn-ghost'}`}
                        onClick={() => scrollToSection('section-desc', () => 'Description')}
                    >
                        Description
                    </button>
                    <button
                        class={`btn btn-sm rounded-full ${activeTab() === 'Reviews' ? 'btn-neutral' : 'btn-ghost'}`}
                        onClick={() => scrollToSection('section-reviews', () => 'Reviews')}
                    >
                        Reviews ({reviews()?.length || 0})
                    </button>
                </div>
            </div>

            <div class="max-w-7xl mx-auto p-4 lg:p-8" id="section-top">
                <Suspense fallback={<ProductSkeleton />}>
                    <Show when={product.error}>
                        <div class="alert alert-error">
                            <span>Error loading product: {product.error.message}</span>
                        </div>
                    </Show>

                    <Show when={product()} keyed>
                        {(item) => (
                            <div class="flex flex-col gap-6">

                                {/* Top Section: Image and Buy Box */}
                                <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
                                    
                                    {/* Left Column: Image */}
                                    <div class="lg:col-span-7">
                                        <div class="sticky top-32 bg-base-100 rounded-2xl p-4 shadow-sm border border-base-300 flex justify-center items-center overflow-hidden">
                                            <img
                                                src={getProductImage(item.image_url)}
                                                alt={item.name}
                                                class="w-full h-auto max-h-[500px] object-contain hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column: Buy Box */}
                                    <div class="lg:col-span-5">
                                        <div class="sticky top-32 flex flex-col gap-6">
                                            <div class="text-sm breadcrumbs text-base-content/60 px-1">
                                                <ul>
                                                    <li><A href="/">Home</A></li>
                                                    <li><A href={`/?category=${item.category}`}>{item.category}</A></li>
                                                    <li><span class="truncate max-w-[150px]">{item.name}</span></li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h1 class="text-2xl lg:text-3xl font-bold leading-tight mb-2 text-base-content">{item.name}</h1>
                                                <div class="flex items-center gap-2 text-sm text-base-content/60">
                                                    <span>Sold by User #{item.owner_id}</span>
                                                    <span>•</span>
                                                    <span class="text-success font-medium">Verified Seller</span>
                                                </div>
                                            </div>

                                            <div class="flex flex-col gap-2 p-4 bg-base-100 rounded-xl border border-base-300 shadow-sm">
                                                <div class="flex justify-between items-center">
                                                    <span class="text-2xl font-bold text-base-content">₹{item.price.toLocaleString()}</span>
                                                    <div class={`badge ${item.stock > 0 ? 'badge-success' : 'badge-error'} gap-1 font-semibold`}>
                                                        {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                                    </div>
                                                </div>
                                                <span class="text-xs text-base-content/60">Inclusive of all taxes</span>
                                            </div>

                                            {/* Desktop Buy Options */}
                                            <div class="hidden lg:block card bg-base-100 border border-base-300 shadow-lg overflow-hidden">
                                                <div class="card-body p-6 gap-5">
                                                    <div class="flex justify-between items-center">
                                                        <div>
                                                            <p class="text-sm text-base-content/60">Total Price</p>
                                                            <h3 class="text-2xl font-bold text-base-content">₹{(item.price * quantity()).toLocaleString()}</h3>
                                                        </div>
                                                        <div class="text-right">
                                                            <p class="text-xs text-base-content/60">₹{item.price.toLocaleString()} × {quantity()}</p>
                                                            <p class="text-success text-sm font-medium">Free Delivery</p>
                                                        </div>
                                                    </div>

                                                    <div class="form-control w-full">
                                                        <label class="label p-0 mb-2"><span class="label-text font-semibold">Quantity</span></label>
                                                        <select class="select select-bordered w-full" onChange={(q) => setQuantity(Number(q.target.value))} value={quantity()}>
                                                            <For each={[1, 2, 3, 4, 5]}>{(n) => <option value={n}>{n}</option>}</For>
                                                        </select>
                                                    </div>

                                                    <div class="flex flex-col gap-3">
                                                        <button
                                                            class={`btn btn-lg w-full rounded-xl ${buttonColor()}`}
                                                            onClick={onAddClick}
                                                            disabled={addToCartLoading() || item.stock <= 0}
                                                        >
                                                            {addToCartLoading() ? <span class="loading loading-spinner"></span> : buttonMessage()}
                                                        </button>
                                                        <button class="btn btn-outline btn-lg w-full rounded-xl" disabled={item.stock <= 0}>
                                                            Buy Now
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Full Width Description Section Below */}
                                <div id="section-desc" class="mt-8 pt-8 border-t border-base-300">
                                    <h2 class="font-bold text-2xl mb-6 text-base-content">Product Description</h2>
                                    <div class="bg-base-100 rounded-2xl p-6 border border-base-300 shadow-sm">
                                        <article class="prose prose-sm lg:prose-base w-full max-w-none prose-img:rounded-xl">
                                            <SolidMarkdown>{item.description}</SolidMarkdown>
                                        </article>
                                    </div>
                                </div>
                                
                                {/* Reviews Section Full Width */}
                                <div id="section-reviews" class="mt-8">
                                     <ReviewSection reviews={reviews() || []} loading={reviews.loading} />
                                </div>
                            </div>
                        )}
                    </Show>
                </Suspense>
            </div>

            {/* Mobile Sticky Buy Bar */}
             <Suspense>
                <Show when={product()}>
                    {(item) => (
                        <div class="fixed bottom-0 left-0 right-0 bg-base-100 p-3 px-4 border-t border-base-300 z-50 lg:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.08)] flex items-center gap-3 safe-bottom">
                            <div class="flex flex-col min-w-0">
                                <span class="text-xs text-base-content/60 font-medium">₹{item().price.toLocaleString()} × {quantity()}</span>
                                <span class="text-lg font-bold text-base-content">₹{(item().price * quantity()).toLocaleString()}</span>
                            </div>
                            <select 
                                class="select select-bordered select-sm w-16"
                                value={quantity()}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                            >
                                <For each={[1, 2, 3, 4, 5]}>{(n) => <option value={n}>{n}</option>}</For>
                            </select>
                            <button 
                                class="btn btn-primary flex-1 rounded-lg"
                                onClick={onAddClick}
                                disabled={addToCartLoading() || item().stock <= 0}
                            >
                                {addToCartLoading() ? <span class="loading loading-spinner loading-xs"></span> : buttonMessage()}
                            </button>
                        </div>
                    )}
                </Show>
            </Suspense>
        </div>
    );
};

const ProductSkeleton = () => (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
        <div class="lg:col-span-5 h-[400px] bg-base-300 rounded-xl"></div>
        <div class="lg:col-span-4 flex flex-col gap-4">
            <div class="h-8 bg-base-300 w-3/4 rounded"></div>
            <div class="h-4 bg-base-300 w-1/4 rounded"></div>
            <div class="h-16 bg-base-300 w-full rounded mt-4"></div>
            <div class="h-40 bg-base-300 w-full rounded mt-4"></div>
        </div>
        <div class="lg:col-span-3 h-80 bg-base-300 rounded-xl"></div>
    </div>
);
