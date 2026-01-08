import { For } from "solid-js";
import { Grid3x3, Lightbulb, Home, UtensilsCrossed, Zap, Trees, BookOpen, Play } from 'lucide-solid';

// Define your categories here (or pass them as props if dynamic)
const CATEGORIES = [
    { name: "All", icon: Grid3x3 },
    { name: "Electronics", icon: Zap },
    { name: "Home", icon: Home },
    { name: "Kitchen", icon: UtensilsCrossed },
    { name: "Sports", icon: Play },
    { name: "Outdoors", icon: Trees },
    { name: "Books", icon: BookOpen },
    { name: "Media", icon: Lightbulb }
];

interface CategoryTabsProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export default function CategoryTabs(props: CategoryTabsProps) {
    return (
        <div class="flex justify-center w-full mb-1">
            {/* Scrollable container on mobile, centered wrap on larger screens */}
            <div class="overflow-x-auto w-full sm:w-auto scrollbar-hide">
                <div role="tablist" class="tabs tabs-boxed bg-base-100 p-2 shadow-sm border border-base-300 rounded-2xl flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-1 min-w-max sm:min-w-0">
                    <For each={CATEGORIES}>
                        {(category) => {
                            const Icon = category.icon;
                            return (
                                <a
                                    role="tab"
                                    class={`tab transition-all duration-200 flex items-center gap-2 font-medium whitespace-nowrap ${props.activeCategory === category.name
                                        ? "tab-active bg-neutral text-neutral-content font-bold shadow-md rounded-xl"
                                        : "text-base-content/70 hover:bg-base-200 rounded-xl"
                                        }`}
                                    onClick={() => props.onCategoryChange(category.name)}
                                >
                                    <Icon size={18} class="shrink-0" />
                                    <span>{category.name}</span>
                                </a>
                            );
                        }}
                    </For>
                </div>
            </div>
        </div>
    );
}
