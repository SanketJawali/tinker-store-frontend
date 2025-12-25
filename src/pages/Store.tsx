import { createResource, createMemo, For, Show, createSignal, createEffect, useTransition } from 'solid-js';
import { createStore } from 'solid-js/store';
import ItemCard from '../components/ItemCard';
import FilterSidebar from '../components/FilterSidebar';
import CategoryTabs from '../components/CategoryTabs';
import { Product, FilterState, ProductListResponse, APIErrorResponse } from '../types';

// Define fetch parameters
interface FetchParams {
    page: number;
    search: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const fetchProducts = async ({ page, search }: FetchParams) => {
    // Construct URL with query parameters
    const params = new URLSearchParams({
        page: page.toString(),
        limit: "20", // Fetch 20 items per page
    });

    if (search) {
        params.append('q', search);
    }

    const response = await fetch(`${BACKEND_URL}/api/product?${params.toString()}`);
    const data: ProductListResponse | APIErrorResponse = await response.json();

    if (!response.ok || !data.success) {
        throw new Error((data as APIErrorResponse).message || 'Failed to fetch');
    }

    // console.log(`Fetched page ${page}:`, data);
    return (data as ProductListResponse).data.map(p => ({
        ...p,
        price: Number(p.price)
    }));
};

export default () => {
    // 1. Pagination State
    const [page, setPage] = createSignal(1);

    // Add Transition Hook
    const [isPending, startTransition] = useTransition();

    // 2. Store for filters
    const [filters, setFilters] = createStore<FilterState>({
        category: "All",
        search: "",
        maxPrice: 10000
    });

    // 3. Resource depends on Page and Search
    const [products] = createResource(
        () => ({ page: page(), search: filters.search }),
        fetchProducts
    );

    // Reset to page 1 when search query changes
    createEffect(() => {
        // Track search changes
        filters.search;
        setPage(1);
    });

    // 4. Client-side Filter Logic
    const filteredProducts = createMemo(() => {
        // Use .latest to keep showing old data while fetching new data
        const list = products.latest || products();
        if (!list) return [];

        return list.filter((item) => {
            const categoryMatch = filters.category === "All" || item.category === filters.category.toLowerCase();
            const priceMatch = item.price <= filters.maxPrice;

            return categoryMatch && priceMatch;
        });
    });

    // Wrap updates in startTransition to prevent Suspense fallback
    const updateFilter = (key: keyof FilterState, value: any) => {
        startTransition(() => {
            setFilters(key, value);
        });
    };

    const resetFilters = () => {
        startTransition(() => {
            setFilters({ category: "All", search: "", maxPrice: 10000 });
            setPage(1);
        });
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1) return;
        startTransition(() => {
            setPage(newPage);
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div class="flex flex-col lg:flex-row min-h-screen bg-base-200">
            <aside class="w-full lg:w-80 lg:h-screen lg:sticky lg:top-16 bg-base-100 border-r border-base-300 p-6 shadow-sm z-10">
                <h2 class="text-xl font-bold mb-6">Filters</h2>
                <FilterSidebar
                    currentFilters={filters}
                    onFilterChange={updateFilter}
                    onReset={resetFilters}
                />
            </aside>

            <main class="flex-1 p-6 lg:p-4 lg:pt-2 pb-1">

                <div class='top-16 z-40 bg-base-200 p-4 opacity-95 flex flex-col lg:flex-row jusitfy-center items-center lg:justify-between items-center border-b border-base-300 mb-4'>
                    <div class="mb-4 text-center">
                        <h1 class="text-3xl font-bold text-base-content">Marketplace</h1>
                    </div>

                    <CategoryTabs
                        activeCategory={filters.category}
                        onCategoryChange={(cat) => updateFilter("category", cat)}
                    />
                </div>

                {/* 
                    UI CHANGE: 
                    Instead of if/else loading, we stack them.
                    The grid stays visible (but faded) while loading.
                */}
                <div class="relative min-h-[600px]">

                    {/* Loading Overlay */}
                    <Show when={products.loading || isPending()}>
                        <div class="absolute inset-0 z-10 bg-base-200/60 backdrop-blur-[1px] flex justify-center items-start pt-20 transition-all duration-200">
                            <span class="loading loading-spinner loading-lg text-primary"></span>
                        </div>
                    </Show>

                    {/* Product Grid */}
                    <div class={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 content-start transition-opacity duration-200 ${products.loading || isPending() ? 'opacity-50' : 'opacity-100'}`}>

                        <Show when={!products.loading && filteredProducts().length === 0}>
                            <div class="col-span-full text-center py-12">
                                <h3 class="text-lg font-bold">No products found</h3>
                                <p class="text-base-content/70">Try adjusting your filters or search query.</p>
                                <button class="btn btn-link" onClick={resetFilters}>Clear filters</button>
                            </div>
                        </Show>

                        <For each={filteredProducts()}>
                            {(product) => (
                                <ItemCard {...product} />
                            )}
                        </For>
                    </div>
                </div>

                {/* Pagination Controls */}
                <div class="flex justify-center items-center gap-4 mt-8 mb-12">
                    <button
                        class="btn btn-outline"
                        disabled={page() === 1 || products.loading}
                        onClick={() => handlePageChange(page() - 1)}
                    >
                        Previous
                    </button>

                    <span class="font-mono text-lg">Page {page()}</span>

                    <button
                        class="btn btn-outline"
                        // Check latest data for length
                        disabled={(products.latest && products.latest.length < 20) || products.loading}
                        onClick={() => handlePageChange(page() + 1)}
                    >
                        Next
                    </button>
                </div>
            </main>
        </div>
    );
};
