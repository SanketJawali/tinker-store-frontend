import { createResource, createSignal, createEffect, Show } from "solid-js";
import ProductGrid from "./ProductGrid";
import { FilterState, ProductListResponse, APIErrorResponse } from "../types";
import { fetchWithTimeout, parseJsonResponse, BACKEND_URL } from "../lib/api";

const fetchProducts = async ({ page, search }: { page: number; search: string }) => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
    });

    if (search) {
        params.append('q', search);
    }

    const response = await fetchWithTimeout(`${BACKEND_URL}/api/product?${params.toString()}`);
    const data: ProductListResponse | APIErrorResponse = await parseJsonResponse(response);

    if (!response.ok || !data.success) {
        throw new Error((data as APIErrorResponse).message || 'Failed to fetch');
    }

    return (data as ProductListResponse).data.map(p => ({
        ...p,
        price: Number(p.price)
    }));
};

interface ContainerProps {
    filters: FilterState;
    onReset: () => void;
    setLoadingState: (loading: boolean) => void;
}

export default (props: ContainerProps) => {
    const [page, setPage] = createSignal(1);

    const [products] = createResource(
        () => ({ page: page(), search: props.filters.search }),
        fetchProducts
    );

    // Sync loading state to parent (for disabling sidebar)
    // This does NOT trigger suspense
    createEffect(() => {
        props.setLoadingState(products.loading);
    });

    createEffect(() => {
        props.filters.search;
        setPage(1);
    });

    const handlePageChange = (newPage: number) => {
        if (newPage < 1) return;
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <Show when={products()}>
                <ProductGrid
                    products={products()!}
                    filters={props.filters}
                    onReset={props.onReset}
                />
            </Show>

            {/* Pagination */}
            <Show when={products()}>
                <div class="flex justify-center items-center gap-2 sm:gap-4 mt-8 mb-12 px-4">
                    <button
                        class="btn btn-outline btn-sm sm:btn-md"
                        disabled={page() === 1 || products.loading}
                        onClick={() => handlePageChange(page() - 1)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span class="hidden sm:inline">Previous</span>
                    </button>

                    <div class="join">
                        <button class="join-item btn btn-sm sm:btn-md btn-active">Page {page()}</button>
                    </div>

                    <button
                        class="btn btn-outline btn-sm sm:btn-md"
                        disabled={products.loading || (products() && products()!.length < 20)}
                        onClick={() => handlePageChange(page() + 1)}
                    >
                        <span class="hidden sm:inline">Next</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </Show>
        </>
    );
};
