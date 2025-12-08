import { createResource, createMemo, For, Show } from 'solid-js';
import { createStore } from "solid-js/store"; // Import createStore
import { FilterState, ProductListResponse, APIErrorResponse } from '../types';
import ItemCard from '../components/ItemCard';
import FilterSidebar from '../components/FilterSidebar';
import CategoryTabs from '../components/CategoryTabs';

const fetchProducts = async () => {
    const response = await fetch(`http://localhost:8000/api/product`);
    const data: ProductListResponse | APIErrorResponse = await response.json();
    if (!response.ok || !data.success) throw new Error((data as APIErrorResponse).message);

    // Safety: Ensure prices are actually numbers coming from API
    return (data as ProductListResponse).data.map(p => ({
        ...p,
        price: Number(p.price)
    }));
};

export default () => {
    const [products] = createResource(fetchProducts);

    // 1. USE CREATE STORE (Better for objects)
    const [filters, setFilters] = createStore<FilterState>({
        category: "All",
        search: "",
        maxPrice: 5000
    });

    // 2. Filter Logic
    const filteredProducts = createMemo(() => {
        const list = products();
        if (!list) return [];

        // Debugging: Log to console to verify updates are firing
        // console.log("Filtering with:", filters.category, filters.maxPrice);

        return list.filter((item) => {
            // Access store properties directly (no parentheses)
            const categoryMatch = filters.category === "All" || item.category === filters.category;
            const priceMatch = item.price <= filters.maxPrice;
            const searchMatch = item.name.toLowerCase().includes(filters.search.toLowerCase());

            return categoryMatch && priceMatch && searchMatch;
        });
    });

    // Helper functions for updating the store
    const updateFilter = (key: keyof FilterState, value: any) => {
        setFilters(key, value);
    };

    const resetFilters = () => {
        setFilters({ category: "All", search: "", maxPrice: 5000 });
    };

    return (
        <div class="flex flex-col lg:flex-row min-h-screen bg-base-200">
            <aside class="w-full lg:w-80 lg:h-screen lg:sticky lg:top-0 bg-base-100 border-r border-base-300 p-6 shadow-sm z-10">
                <h2 class="text-xl font-bold mb-6">Filters</h2>
                {/* Pass the store and handlers */}
                <FilterSidebar
                    currentFilters={filters}
                    onFilterChange={updateFilter}
                    onReset={resetFilters}
                />
            </aside>

            <main class="flex-1 p-6 lg:p-10">
                <div class="mb-4 text-center">
                    <h1 class="text-3xl font-bold text-base-content">Marketplace</h1>
                </div>

                <CategoryTabs
                    activeCategory={filters.category}
                    onCategoryChange={(cat) => setFilters("category", cat)}
                />

                <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                    <Show when={products.loading}>
                        <div class="col-span-full flex justify-center py-20">
                            <span class="loading loading-spinner loading-lg text-primary"></span>
                        </div>
                    </Show>

                    <Show when={!products.loading && filteredProducts().length === 0}>
                        <div class="col-span-full text-center py-12">
                            <h3 class="text-lg font-bold">No products found</h3>
                            <button class="btn btn-link" onClick={resetFilters}>Clear filters</button>
                        </div>
                    </Show>

                    <For each={filteredProducts()}>
                        {(product) => (
                            <ItemCard
                                title={product.name}
                                imgSrc={product.image_url}
                                description={product.description}
                                price={product.price}
                            />
                        )}
                    </For>
                </div>
            </main>
        </div>
    );
};
