import { createSignal, Suspense, createEffect, Show, For } from 'solid-js';
import { createStore } from 'solid-js/store';
import { useSearchParams, useNavigate } from "@solidjs/router";
import FilterSidebar from '../components/FilterSidebar';
import CategoryTabs from '../components/CategoryTabs';
import ProductGridContainer from '../components/ProductGridContainer';
import ProductSkeleton from '../components/ProductSkeleton';
import { FilterState } from '../types';
import { Filter, X } from 'lucide-solid';

export default () => {
    const [searchParams, setSearchParams] = useSearchParams<{ search?: string; category?: string; sort?: string }>();
    const navigate = useNavigate();

    const [filters, setFilters] = createStore<FilterState>({
        category: searchParams.category || "All",
        search: searchParams.search || "",
        maxPrice: 10000,
        sortBy: (searchParams.sort as FilterState['sortBy']) || 'default'
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
        if (filters.sortBy !== 'default') {
            params.set('sort', filters.sortBy);
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
        setFilters({ category: "All", search: "", maxPrice: 10000, sortBy: 'default' });
        setIsFilterOpen(false);
        navigate('/', { replace: true });
    };

    // Get active filters for display
    const getActiveFilters = () => {
        const active: { label: string; value: string; key: keyof FilterState }[] = [];
        
        if (filters.search) {
            active.push({ label: 'Search', value: filters.search, key: 'search' });
        }
        if (filters.maxPrice < 10000) {
            active.push({ label: 'Max Price', value: `₹${filters.maxPrice.toLocaleString()}`, key: 'maxPrice' });
        }
        if (filters.sortBy !== 'default') {
            const sortLabels = {
                'price-asc': 'Price: Low-High',
                'price-desc': 'Price: High-Low',
                'name-asc': 'Name: A-Z',
                'name-desc': 'Name: Z-A'
            };
            active.push({ label: 'Sort', value: sortLabels[filters.sortBy as keyof typeof sortLabels], key: 'sortBy' });
        }
        
        return active;
    };

    const clearFilter = (key: keyof FilterState) => {
        if (key === 'search') {
            updateFilter('search', '');
        } else if (key === 'maxPrice') {
            updateFilter('maxPrice', 10000);
        } else if (key === 'sortBy') {
            updateFilter('sortBy', 'default');
        }
    };

    return (
        <div class="flex flex-col lg:flex-row min-h-screen bg-base-200">
            {/* Mobile Header & Filter Toggle */}
            <div class="lg:hidden p-2 pt-4 bg-base-100 flex flex-col gap-3 sticky top-16 z-30 shadow-sm border-b border-base-300">
                <div class="flex justify-between items-center">
                        <div class="px-2">
                            <h1 class="text-2xl font-bold text-base-content">Marketplace</h1>
                            <p class="text-xs text-base-content/70">
                                Demo listings only
                            </p>
                        </div>
                    <button
                        class={`btn btn-sm rounded-lg font-semibold transition-all ${isFilterOpen() ? 'btn-error' : 'btn-outline'}`}
                        onClick={() => setIsFilterOpen(!isFilterOpen())}
                    >
                        <Filter size={18} />
                        {isFilterOpen() ? 'Close' : 'Filters'}
                    </button>
                </div>
                <div class="overflow-x-auto px-2">
                    <CategoryTabs
                        activeCategory={filters.category}
                        onCategoryChange={(cat) => updateFilter("category", cat)}
                    />
                </div>
                {/* Active Filters Tags */}
                <Show when={getActiveFilters().length > 0}>
                    <div class="flex flex-wrap gap-1.5 px-2 pb-1">
                        <For each={getActiveFilters()}>
                            {(filter) => (
                                <div class="badge badge-sm gap-1 bg-primary/10 text-primary border-primary/20 py-2.5 px-2">
                                    <span class="text-xs font-medium">
                                        {filter.label}: {filter.value}
                                    </span>
                                    <button 
                                        class="btn btn-ghost btn-xs p-0 min-h-0 h-4 w-4 hover:bg-primary/20 rounded-full"
                                        onClick={() => clearFilter(filter.key)}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                        </For>
                    </div>
                </Show>
            </div>

            {/* Sidebar */}
            <aside class={`
                w-full lg:w-80 bg-base-100 border-r border-base-300 p-6 z-20 
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
                        <div>
                            <h1 class="text-4xl font-bold text-base-content">Marketplace</h1>
                            <p class="text-base-content/70 mt-2 max-w-2xl">
                                Explore sample products in this personal demo ecommerce project. Listings and prices are
                                for showcase purposes only.
                            </p>
                        </div>
                    </div>
                    <CategoryTabs
                        activeCategory={filters.category}
                        onCategoryChange={(cat) => updateFilter("category", cat)}
                    />
                    {/* Active Filters Tags for Large Screens */}
                    <Show when={getActiveFilters().length > 0}>
                        <div class="flex flex-wrap gap-2">
                            <For each={getActiveFilters()}>
                                {(filter) => (
                                    <div class="badge badge-md gap-2 bg-primary/10 text-primary border-primary/20 py-3 px-3">
                                        <span class="text-sm font-medium">
                                            {filter.label}: {filter.value}
                                        </span>
                                        <button 
                                            class="btn btn-ghost btn-xs p-0 min-h-0 h-5 w-5 hover:bg-primary/20 rounded-full"
                                            onClick={() => clearFilter(filter.key)}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                            </For>
                        </div>
                    </Show>
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
