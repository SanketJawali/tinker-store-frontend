import { Component, For, Show } from "solid-js";
import ItemCard from "./ItemCard";
import { Product, FilterState } from "../types";

interface ProductGridProps {
    products: Product[];
    filters: FilterState;
    onReset: () => void;
}

const ProductGrid: Component<ProductGridProps> = (props) => {
    const filteredList = () => {
        return props.products.filter((item) => {
            const categoryMatch = props.filters.category === "All" || item.category === props.filters.category.toLowerCase();

            // CHANGE: If maxPrice is 10000, treat it as "10000+" (show everything)
            // Otherwise, strictly filter by price.
            const priceMatch = props.filters.maxPrice >= 10000
                ? true
                : item.price <= props.filters.maxPrice;

            return categoryMatch && priceMatch;
        });
    };

    return (
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 content-start">
            <Show when={filteredList().length === 0}>
                <div class="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div class="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold mb-2">No products found</h3>
                    <p class="text-base-content/60 mb-4 max-w-sm">We couldn't find any products matching your criteria. Try adjusting your filters.</p>
                    <button class="btn btn-primary btn-sm" onClick={props.onReset}>Clear All Filters</button>
                </div>
            </Show>

            <For each={filteredList()}>
                {(product) => (
                    <ItemCard {...product} />
                )}
            </For>
        </div>
    );
};

export default ProductGrid;
