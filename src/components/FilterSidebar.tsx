import { Component, createSignal, createEffect, onCleanup, Show } from "solid-js";
import { FilterState } from "../types";
import { Search, RotateCcw, Sliders, ArrowUpDown } from 'lucide-solid';

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
                {/* Filter Header */}
                <div class="flex items-center gap-2 pb-2 border-b border-base-300">
                    <Sliders size={20} class="text-primary" />
                    <h2 class="text-lg font-bold text-base-content">Filters</h2>
                </div>

                {/* Search Input */}
                <div class="form-control w-full">
                    <div class="relative">
                        <input
                            type="text"
                            placeholder="Search products..."
                            class="input input-bordered w-full pl-10 bg-base-100 border border-base-300 focus:border-primary focus:outline-none transition-all"
                            value={searchTerm()}
                            onInput={handleSearch}
                            disabled={props.loading} 
                        />
                        <Search size={18} class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
                    </div>
                </div>

                {/* Sort By */}
                <div class="form-control w-full">
                    <label class="label py-1">
                        <span class="label-text font-semibold text-base-content flex items-center gap-2">
                            <ArrowUpDown size={16} class="text-primary" />
                            Sort By
                        </span>
                    </label>
                    <select 
                        class="select select-bordered w-full bg-base-100 border border-base-300"
                        value={props.currentFilters.sortBy}
                        onChange={(e) => props.onFilterChange("sortBy", e.currentTarget.value)}
                        disabled={props.loading}
                    >
                        <option value="default">Default</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="name-asc">Name: A to Z</option>
                        <option value="name-desc">Name: Z to A</option>
                    </select>
                </div>

                {/* Price Filter */}
                <div class="form-control w-full">
                    <label class="label py-1">
                        <span class="label-text font-semibold text-base-content">Price Range</span>
                    </label>
                    <div class="bg-base-200 rounded-xl p-4 border border-base-300">
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-sm font-medium text-base-content">Max Price</span>
                            <span class="badge badge-primary font-bold">
                                ₹{props.currentFilters.maxPrice >= 10000 ? "10,000+" : props.currentFilters.maxPrice.toLocaleString()}
                            </span>
                        </div>
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
                        <div class="w-full flex justify-between text-xs font-medium text-base-content/60 mt-2">
                            <span>₹100</span>
                            <span>₹5,000</span>
                            <span>₹10,000+</span>
                        </div>
                    </div>
                </div>

                {/* Reset Button */}
                <button
                    class="btn btn-outline w-full font-semibold transition-all duration-200 rounded-xl"
                    onClick={props.onReset}
                    disabled={props.loading}
                >
                    <RotateCcw size={18} />
                    Reset All Filters
                </button>
            </div>
        </div>
    );
};

export default FilterSidebar;
