import { createSignal, For } from "solid-js";

const FilterSidebar = (props: any) => {
    // State management
    const [priceRange, setPriceRange] = createSignal(5000);
    const [selectedRating, setSelectedRating] = createSignal(0);

    const categories = [
        "Electronics",
        "Footwear",
        "Clothing",
        "Home & Kitchen",
        "Accessories"
    ];

    const handleCategoryChange = (category: string, checked: boolean) => {
        // Logic to update parent state or local filter list
        console.log(`Category: ${category}, Checked: ${checked}`);
    };

    return (
        <aside class="w-full md:w-64 bg-base-100 p-4 border-r border-base-300 h-full overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h2 class="font-bold text-xl text-base-content">Filters</h2>
                <button class="btn btn-ghost btn-xs text-error">Reset</button>
            </div>

            {/* Categories Section */}
            <div class="mb-6">
                <h3 class="font-semibold mb-3 text-sm uppercase tracking-wider text-base-content/70">Categories</h3>
                <div class="form-control gap-2">
                    <For each={categories}>
                        {(item) => (
                            <label class="label cursor-pointer justify-start gap-3 p-0 hover:bg-base-200 rounded px-1 transition-colors">
                                <input
                                    type="checkbox"
                                    class="checkbox checkbox-sm checkbox-primary rounded-md"
                                    onChange={(e) => handleCategoryChange(item, e.currentTarget.checked)}
                                />
                                <span class="label-text text-base">{item}</span>
                            </label>
                        )}
                    </For>
                </div>
            </div>

            <div class="divider my-2"></div>

            {/* Price Range Section */}
            <div class="mb-6">
                <h3 class="font-semibold mb-3 text-sm uppercase tracking-wider text-base-content/70">Price Range</h3>
                <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange()}
                    class="range range-primary range-xs"
                    onInput={(e) => setPriceRange(e.currentTarget.value)}
                />
                <div class="flex justify-between items-center mt-2">
                    <span class="text-xs text-base-content/60">₹0</span>
                    <span class="font-bold text-sm">₹{priceRange()}</span>
                </div>
            </div>

            <div class="divider my-2"></div>

            {/* Rating Section */}
            <div class="mb-6">
                <h3 class="font-semibold mb-3 text-sm uppercase tracking-wider text-base-content/70">Rating</h3>
                <div class="rating rating-sm">
                    <For each={[1, 2, 3, 4, 5]}>
                        {(star) => (
                            <input
                                type="radio"
                                name="rating-2"
                                class="mask mask-star-2 bg-orange-400"
                                checked={selectedRating() === star}
                                onChange={() => setSelectedRating(star)}
                            />
                        )}
                    </For>
                    <span class="ml-2 text-sm text-base-content/70">& Up</span>
                </div>
            </div>

            <div class="divider my-2"></div>

            {/* Availability Toggle */}
            <div class="mb-8">
                <div class="form-control">
                    <label class="label cursor-pointer">
                        <span class="font-semibold text-sm uppercase tracking-wider text-base-content/70">Include Out of Stock</span>
                        <input type="checkbox" class="toggle toggle-primary toggle-sm" />
                    </label>
                </div>
            </div>

            {/* Apply Button */}
            <button class="btn btn-primary w-full">Apply Filters</button>
        </aside>
    );
};

export default FilterSidebar;
