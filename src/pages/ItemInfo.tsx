import { createResource, createSignal, Suspense, Show, For } from "solid-js";
import { useParams } from "@solidjs/router";
import { A } from "@solidjs/router";
import { SolidMarkdown } from "solid-markdown";
import { getOptimizedImageUrl, ImageKitTransformation } from '../lib/imagekit';
import ReviewSection, { Review } from '../components/Reviews';
import { Product, SingleProductResponse } from '../types';


// --- Fetchers ---
const fetchProduct = async (id: string): Promise<Product> => {
    const response = await fetch(`http://localhost:8000/api/product/${id}`);

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

export default () => {
    const params = useParams();

    // 1. Use a function for the source to ensure reactivity to URL changes
    const [product] = createResource(() => params.id, fetchProduct);
    const [reviews] = createResource(() => params.id, fetchReviews);

    const [activeTab, setActiveTab] = createSignal<"Info" | "Description" | "Reviews">("Info");

    const getProductImage = (url: string) => {
        const transforms: ImageKitTransformation[] = [
            { height: '600', width: '600', crop: 'at_max_enlarge', background: 'white' }
        ];
        return getOptimizedImageUrl(url, transforms);
    };

    const scrollToSection = (id: string, tabName: typeof activeTab) => {
        setActiveTab(tabName());
        const el = document.getElementById(id);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div class="min-h-screen bg-base-100 pb-20">

            {/* Sticky Nav */}
            <div class="sticky top-16 z-30 bg-base-100/95 backdrop-blur border-b border-base-200 shadow-sm">
                <div class="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex gap-2 overflow-x-auto no-scrollbar">
                    <button
                        class={`btn btn-sm rounded-full ${activeTab() === 'Info' ? 'btn-neutral' : 'btn-ghost'}`}
                        onClick={() => scrollToSection('section-info', () => 'Info')}
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

            <div class="max-w-7xl mx-auto p-4 lg:p-8">
                <Suspense fallback={<ProductSkeleton />}>
                    <Show when={product.error}>
                        <div class="alert alert-error">
                            <span>Error loading product: {product.error.message}</span>
                        </div>
                    </Show>

                    <Show when={product()} keyed>
                        {(item) => (
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">

                                {/* Left Column: Image */}
                                <div class="lg:col-span-5">
                                    <div class="sticky top-24 border border-base-200 rounded-xl bg-white p-4 shadow-sm flex justify-center items-center">
                                        <img
                                            src={getProductImage(item.image_url)}
                                            alt={item.name}
                                            class="max-h-[500px] w-auto object-contain"
                                        />
                                    </div>
                                </div>

                                {/* Middle Column: Details */}
                                <div class="lg:col-span-4 flex flex-col gap-4" id="section-info">
                                    <div class="text-sm breadcrumbs text-base-content/60">
                                        <ul>
                                            <li><A href="/">Home</A></li>
                                            <li><A href={`/search?category=${item.category}`}>{item.category}</A></li>
                                            <li>{item.name}</li>
                                        </ul>
                                    </div>

                                    <h1 class="text-3xl font-bold leading-tight">{item.name}</h1>
                                    <p class="text-sm text-base-content/60">Sold by User #{item.owner_id}</p>

                                    <div class="divider my-1"></div>

                                    <div class="flex items-baseline gap-2">
                                        <span class="text-3xl font-bold text-base-content">₹{item.price}</span>
                                        <span class="text-sm text-base-content/60">Inclusive of all taxes</span>
                                    </div>

                                    <div class="bg-base-200/50 p-4 rounded-lg mt-2 text-sm grid grid-cols-2 gap-y-2">
                                        <span class="font-bold opacity-70">Category</span> <span>{item.category}</span>
                                        <span class="font-bold opacity-70">Stock</span>
                                        <span class={item.stock > 0 ? "text-success font-bold" : "text-error font-bold"}>
                                            {item.stock > 0 ? "In Stock" : "Out of Stock"}
                                        </span>
                                    </div>

                                    <div id="section-desc" class="mt-8">
                                        <h3 class="font-bold text-lg mb-2">About this item</h3>
                                        <A class="prose prose-sm max-w-none prose-img:rounded-xl">
                                            <SolidMarkdown>{item.description}</SolidMarkdown>
                                        </A>
                                    </div>

                                </div>

                                {/* Right Column: Buy Box */}
                                <div class="lg:col-span-3">
                                    <div class="sticky top-24 card bg-base-100 border border-base-300 shadow-xl">
                                        <div class="card-body p-5">
                                            <h3 class="text-xl font-bold">₹{item.price.toLocaleString()}</h3>
                                            <div class="text-success text-lg font-medium mt-4">
                                                {item.stock > 0 ? 'In Stock' : 'Currently Unavailable'}
                                            </div>

                                            <div class="form-control w-full mt-4">
                                                <label class="label"><span class="label-text">Quantity</span></label>
                                                <select class="select select-bordered select-sm w-full">
                                                    <For each={[1, 2, 3, 4, 5]}>{(n) => <option value={n}>{n}</option>}</For>
                                                </select>
                                            </div>

                                            <div class="flex flex-col gap-3 mt-6">
                                                <button class="btn btn-primary w-full rounded-full shadow-md" disabled={item.stock <= 0}>
                                                    Add to Cart
                                                </button>
                                                <button class="btn btn-secondary w-full rounded-full shadow-md" disabled={item.stock <= 0}>
                                                    Buy Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <ReviewSection reviews={reviews() || []} loading={reviews.loading} />
                            </div>
                        )}
                    </Show>
                </Suspense>
            </div>
        </div>
    );
}

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
