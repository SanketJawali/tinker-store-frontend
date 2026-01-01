import { createResource, createSignal, createEffect, Show } from "solid-js";
import ProductGrid from "./ProductGrid";
import { FilterState, ProductListResponse, APIErrorResponse } from "../types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const fetchProducts = async ({ page, search }: { page: number; search: string }) => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
    });

    if (search) {
        params.append('q', search);
    }

    const response = await fetch(`${BACKEND_URL}/api/product?${params.toString()}`);
    const data: ProductListResponse | APIErrorResponse = await response.json();

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
                <div class="flex justify-center items-center gap-4 mt-8 mb-12">
                    <button
                        class="btn btn-outline"
                        disabled={page() === 1 || products.loading}
                        onClick={() => handlePageChange(page() - 1)}
                    >
                        Previous
                    </button>

                    <span class="font-mono text-lg">Page {page()}</span>

                    <button
                        class="btn btn-outline"
                        disabled={products.loading || (products() && products()!.length < 20)}
                        onClick={() => handlePageChange(page() + 1)}
                    >
                        Next
                    </button>
                </div>
            </Show>
        </>
    );
};
