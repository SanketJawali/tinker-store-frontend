import { For } from "solid-js";

export default () => {
    return (
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 content-start">
            <For each={Array(6).fill(0)}>
                {() => (
                    <div class="card bg-base-100 shadow-xl">
                        <figure class="px-4 pt-4">
                            <div class="skeleton h-48 w-full rounded-xl"></div>
                        </figure>
                        <div class="card-body">
                            <div class="skeleton h-6 w-3/4 mb-2"></div>
                            <div class="flex justify-between items-center mb-2">
                                <div class="skeleton h-6 w-20 rounded-full"></div>
                            </div>
                            <div class="skeleton h-4 w-full"></div>
                            <div class="skeleton h-4 w-2/3"></div>
                            <div class="card-actions justify-end mt-4">
                                <div class="skeleton h-10 w-20 rounded-lg"></div>
                                <div class="skeleton h-10 w-24 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                )}
            </For>
        </div>
    );
};