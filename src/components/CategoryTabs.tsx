import { For } from "solid-js";

// Define your categories here (or pass them as props if dynamic)
const CATEGORIES = ["All", "Electronics", "Clothing", "Home", "Accessories"];

interface CategoryTabsProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export default function CategoryTabs(props: CategoryTabsProps) {
    return (
        <div class="flex justify-center w-full mb-8">
            {/* DaisyUI Tabs Boxed Style */}
            <div role="tablist" class="tabs tabs-boxed bg-base-100 p-2 shadow-sm border border-base-200">
                <For each={CATEGORIES}>
                    {(category) => (
                        <a
                            role="tab"
                            class={`tab transition-all duration-200 ${props.activeCategory === category
                                    ? "tab-active bg-primary text-primary-content font-bold shadow-md"
                                    : "hover:bg-base-200"
                                }`}
                            onClick={() => props.onCategoryChange(category)}
                        >
                            {category}
                        </a>
                    )}
                </For>
            </div>
        </div>
    );
}
