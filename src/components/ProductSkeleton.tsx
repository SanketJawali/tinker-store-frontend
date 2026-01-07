import { For } from "solid-js";

export default () => {
    return (
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 content-start">
            <For each={Array(6).fill(0)}>
                {() => (
                    <div class="card bg-base-100 shadow-md border border-base-200 h-full">
                        <figure>
                            <div class="skeleton relative aspect-square w-full"></div>
                        </figure>
                        <div class="card-body p-4 sm:p-5 gap-3">
                            <div class="flex flex-col gap-2">
                                <div class="skeleton h-3 w-1/3"></div>
                                <div class="skeleton h-6 w-3/4"></div>
                            </div>
                            
                            <div class="skeleton h-4 w-full"></div>
                            <div class="skeleton h-4 w-2/3"></div>

                            <div class="flex items-center justify-between mt-auto pt-2">
                                <div class="skeleton h-8 w-16"></div>
                                <div class="skeleton h-8 w-24 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                )}
            </For>
        </div>
    );
};