import { Component, createSignal, createEffect, onCleanup, Show } from "solid-js";
import { FilterState } from "../types";

interface SidebarProps {
    // Pass the raw store object, do not destructure!
    currentFilters: FilterState;
    // The setter now accepts a key and value for easier store updates
    onFilterChange: (key: keyof FilterState, value: any) => void;
    onReset: () => void;
    loading?: boolean; // Added loading prop
}

const FilterSidebar: Component<SidebarProps> = (props) => {
    // Local state for the input to ensure immediate UI updates while typing
    const [searchTerm, setSearchTerm] = createSignal(props.currentFilters.search);
    let debounceTimer: number;

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
        <div class="relative">
            {/* Overlay when loading */}
            <Show when={props.loading}>
                <div class="absolute inset-0 z-20 bg-base-100/60 backdrop-blur-[1px] cursor-not-allowed rounded-lg transition-all duration-200"></div>
            </Show>

            <div class={`flex flex-col gap-6 transition-opacity duration-200 ${props.loading ? 'opacity-50 pointer-events-none' : ''}`}>
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
                        disabled={props.loading} 
                    />
                </div>

                {/* Price Filter */}
                <div class="form-control w-full">
                    <label class="label">
                        <span class="label-text font-bold">Max Price</span>
                        <span class="label-text-alt">
                            {/* CHANGE: Show 10000+ if maxed out */}
                            ₹ {props.currentFilters.maxPrice >= 10000 ? "10000+" : props.currentFilters.maxPrice}
                        </span>
                    </label>
                    <input
                        type="range"
                        min="100"
                        max="10000"
                        step="100"
                        class="range range-primary range-sm"
                        value={props.currentFilters.maxPrice}
                        onInput={(e) =>
                            props.onFilterChange("maxPrice", e.currentTarget.valueAsNumber)
                        }
                        disabled={props.loading}
                    />
                    <div class="w-full flex justify-between text-xs px-2 mt-2">
                        <span>₹100</span>
                        <span>₹5000</span>
                        <span>₹10000+</span>
                    </div>
                </div>

                {/* Reset Button */}
                <button
                    class="btn btn-outline btn-sm mt-4"
                    onClick={props.onReset}
                    disabled={props.loading}
                >
                    Reset Filters
                </button>
            </div>
        </div>
    );
};

export default FilterSidebar;
