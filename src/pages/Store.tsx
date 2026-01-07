import { createSignal, Suspense, createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';
import { useSearchParams, useNavigate } from "@solidjs/router";
import FilterSidebar from '../components/FilterSidebar';
import CategoryTabs from '../components/CategoryTabs';
import ProductGridContainer from '../components/ProductGridContainer';
import ProductSkeleton from '../components/ProductSkeleton';
import { FilterState } from '../types';
import { Filter, X } from 'lucide-solid';

export default () => {
    const [searchParams, setSearchParams] = useSearchParams<{ search?: string; category?: string }>();
    const navigate = useNavigate();

    const [filters, setFilters] = createStore<FilterState>({
        category: searchParams.category || "All",
        search: searchParams.search || "",
        maxPrice: 10000
    });

    const [isLoading, setIsLoading] = createSignal(true);
    const [isFilterOpen, setIsFilterOpen] = createSignal(false);

    // Update URL when filters change
    createEffect(() => {
        const params = new URLSearchParams();
        if (filters.search) {
            params.set('search', filters.search);
        }
        if (filters.category !== "All") {
            params.set('category', filters.category);
        }
        
        const queryString = params.toString();
        if (queryString) {
            navigate(`/?${queryString}`, { replace: true });
        } else {
            navigate('/', { replace: true });
        }
    });

    const updateFilter = (key: keyof FilterState, value: any) => {
        setFilters(key, value);
    };

    const resetFilters = () => {
        setFilters({ category: "All", search: "", maxPrice: 10000 });
        setIsFilterOpen(false);
        navigate('/', { replace: true });
    };

    return (
        <div class="flex flex-col lg:flex-row min-h-screen bg-base-200">
            {/* Mobile Header & Filter Toggle */}
            <div class="lg:hidden p-4 bg-base-100 flex flex-col gap-4 sticky top-16 z-30 shadow-md border-b-2 border-primary/20">
                <div class="flex justify-between items-center">
                    <h1 class="text-2xl font-bold text-primary">Marketplace</h1>
                    <button 
                        class={`btn btn-sm rounded-lg font-semibold transition-all ${isFilterOpen() ? 'btn-error' : 'btn-outline btn-primary'}`}
                        onClick={() => setIsFilterOpen(!isFilterOpen())}
                    >
                        <Filter size={18} />
                        {isFilterOpen() ? 'Close' : 'Filters'}
                    </button>
                </div>
                <div class="overflow-x-auto pb-2 -mx-4 px-4">
                    <CategoryTabs
                        activeCategory={filters.category}
                        onCategoryChange={(cat) => updateFilter("category", cat)}
                    />
                </div>
            </div>

            {/* Sidebar */}
            <aside class={`
                w-full lg:w-80 bg-base-100 border-r-2 border-primary/20 p-6 z-20 
                lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:block
                fixed inset-0 top-32 overflow-y-auto transition-transform duration-300 ease-in-out
                ${isFilterOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div class="flex justify-between items-center mb-6">
                    {/* <h2 class="text-xl font-bold text-base-content">Filters</h2> */}
                    <button class="btn btn-ghost btn-sm lg:hidden text-error" onClick={() => setIsFilterOpen(false)}>
                        <X size={20} />
                    </button>
                </div>
                <FilterSidebar
                    currentFilters={filters}
                    onFilterChange={updateFilter}
                    onReset={resetFilters}
                    loading={isLoading()}
                />
            </aside>

            {/* Main Content */}
            <main class="flex-1 p-4 lg:p-8">
                <div class="hidden lg:flex flex-col gap-6 mb-8">
                    <div class="flex justify-between items-center">
                        <h1 class="text-4xl font-bold text-primary">Marketplace</h1>
                    </div>
                    <CategoryTabs
                        activeCategory={filters.category}
                        onCategoryChange={(cat) => updateFilter("category", cat)}
                    />
                </div>

                <div class="min-h-[600px]">
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
