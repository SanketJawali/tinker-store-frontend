import { Component, createSignal, createEffect, onCleanup } from "solid-js";
import { FilterState } from "../types";

interface SidebarProps {
    // Pass the raw store object, do not destructure!
    currentFilters: FilterState;
    // The setter now accepts a key and value for easier store updates
    onFilterChange: (key: keyof FilterState, value: any) => void;
    onReset: () => void;
}

export default (props: SidebarProps) => {
    // Local state for the input to ensure immediate UI updates while typing
    const [searchTerm, setSearchTerm] = createSignal(props.currentFilters.search);
    let debounceTimer: any;

    // Sync local state with prop (e.g. when Reset is clicked)
    createEffect(() => {
        setSearchTerm(props.currentFilters.search);
    });

    const handleSearch = (e: InputEvent) => {
        const value = (e.currentTarget as HTMLInputElement).value;
        setSearchTerm(value);

        // Clear previous timer
        clearTimeout(debounceTimer);

        // Set new timer (Debounce 500ms)
        debounceTimer = setTimeout(() => {
            props.onFilterChange("search", value);
        }, 500);
    };

    onCleanup(() => clearTimeout(debounceTimer));

    return (
        <div class="flex flex-col gap-6">

            {/* Search Input */}
            <div class="form-control w-full">
                <label class="label">
                    <span class="label-text font-bold">Search</span>
                </label>
                <input
                    type="text"
                    placeholder="Product name..."
                    class="input input-bordered w-full"
                    value={searchTerm()}
                    onInput={handleSearch}
                />
            </div>

            {/* Price Filter */}
            <div class="form-control w-full">
                <label class="label">
                    <span class="label-text font-bold">Max Price</span>
                    <span class="label-text-alt">₹ {props.currentFilters.maxPrice}</span>
                </label>
                <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    class="range range-primary range-sm"
                    value={props.currentFilters.maxPrice}
                    // FIX: Use valueAsNumber to ensure it's not a string "100"
                    onInput={(e) =>
                        props.onFilterChange("maxPrice", e.currentTarget.valueAsNumber)
                    }
                />
                <div class="w-full flex justify-between text-xs px-2 mt-2">
                    <span>₹100</span>
                    <span>₹5000</span>
                    <span>₹10000</span>
                </div>
            </div>

            {/* Reset Button */}
            <button
                class="btn btn-outline btn-sm mt-4"
                onClick={props.onReset}
            >
                Reset Filters
            </button>
        </div>
    );
};
