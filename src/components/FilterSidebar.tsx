import { Component } from "solid-js";
import { FilterState } from "../types";

interface SidebarProps {
    // Pass the raw store object, do not destructure!
    currentFilters: FilterState;
    // The setter now accepts a key and value for easier store updates
    onFilterChange: (key: keyof FilterState, value: any) => void;
    onReset: () => void;
}

const FilterSidebar: Component<SidebarProps> = (props) => {
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
                    // Access store directly without parenthesis
                    value={props.currentFilters.search}
                    onInput={(e) =>
                        props.onFilterChange("search", e.currentTarget.value)
                    }
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
                    min="0"
                    max="5000"
                    step="100"
                    class="range range-primary range-sm"
                    value={props.currentFilters.maxPrice}
                    // FIX: Use valueAsNumber to ensure it's not a string "100"
                    onInput={(e) =>
                        props.onFilterChange("maxPrice", e.currentTarget.valueAsNumber)
                    }
                />
                <div class="w-full flex justify-between text-xs px-2 mt-2">
                    <span>₹0</span>
                    <span>₹2500</span>
                    <span>₹5000</span>
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

export default FilterSidebar;
