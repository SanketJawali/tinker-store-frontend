import { For } from "solid-js";

export default () => {
    return (
        <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 content-start">
            <For each={Array(8).fill(0)}>
                {() => (
                    <div class="card w-full h-full bg-base-100 shadow-sm border border-base-300 overflow-hidden rounded-xl">
                        <figure class="relative aspect-square overflow-hidden bg-base-200">
                            <div class="skeleton w-full h-full"></div>
                        </figure>
                        <div class="card-body p-3 sm:p-4 gap-2">
                            <div class="flex flex-col gap-1">
                                <div class="skeleton h-3 w-1/3"></div>
                                <div class="skeleton h-4 sm:h-5 w-3/4"></div>
                            </div>

                            <div class="hidden sm:block space-y-1">
                                <div class="skeleton h-3 w-full"></div>
                                <div class="skeleton h-3 w-2/3"></div>
                            </div>

                            <div class="flex flex-col sm:flex-row sm:items-center gap-2 mt-auto pt-2 border-t border-base-300">
                                <div class="skeleton h-6 sm:h-7 w-20 sm:w-24"></div>
                                <div class="skeleton h-7 sm:h-8 w-full sm:w-16 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                )}
            </For>
        </div>
    );
};