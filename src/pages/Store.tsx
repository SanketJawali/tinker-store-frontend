import { createSignal, Suspense } from 'solid-js';
import { createStore } from 'solid-js/store';
import FilterSidebar from '../components/FilterSidebar';
import CategoryTabs from '../components/CategoryTabs';
import ProductGridContainer from '../components/ProductGridContainer';
import ProductSkeleton from '../components/ProductSkeleton';
import { FilterState } from '../types';

export default () => {
    const [filters, setFilters] = createStore<FilterState>({
        category: "All",
        search: "",
        maxPrice: 10000
    });

    const [isLoading, setIsLoading] = createSignal(true);

    const updateFilter = (key: keyof FilterState, value: any) => {
        setFilters(key, value);
    };

    const resetFilters = () => {
        setFilters({ category: "All", search: "", maxPrice: 10000 });
    };

    return (
        <div class="flex flex-col lg:flex-row min-h-screen bg-base-200">
            <aside class="w-full lg:w-80 lg:h-screen lg:sticky lg:top-16 bg-base-100 border-r border-base-300 p-6 shadow-sm z-10">
                <h2 class="text-xl font-bold mb-6">Filters</h2>
                <FilterSidebar
                    currentFilters={filters}
                    onFilterChange={updateFilter}
                    onReset={resetFilters}
                    loading={isLoading()}
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

                <div class="min-h-[600px]">
                    {/* 
                        CRITICAL: The Suspense boundary is HERE.
                        When ProductGridContainer suspends, this fallback renders.
                        The Sidebar and Header (above) remain visible.
                    */}
                    <Suspense fallback={<ProductSkeleton />}>
                        <ProductGridContainer 
                            filters={filters} 
                            onReset={resetFilters}
                            setLoadingState={setIsLoading}
                        />
                    </Suspense>
                </div>

            </main>
        </div>
    );
};
