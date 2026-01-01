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
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 content-start">
            <Show when={filteredList().length === 0}>
                <div class="col-span-full text-center py-12">
                    <h3 class="text-lg font-bold">No products found</h3>
                    <p class="text-base-content/70">Try adjusting your filters or search query.</p>
                    <button class="btn btn-link" onClick={props.onReset}>Clear filters</button>
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
