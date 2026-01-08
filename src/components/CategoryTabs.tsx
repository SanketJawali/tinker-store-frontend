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
        <div class="flex justify-start lg:justify-center w-full mb-1">
            {/* Updated Tabs with Icons */}
            <div role="tablist" class="tabs tabs-boxed bg-base-100 p-2 shadow-sm border border-base-300 rounded-2xl flex-nowrap min-w-max lg:min-w-0 lg:flex-wrap gap-1">
                <For each={CATEGORIES}>
                    {(category) => {
                        const Icon = category.icon;
                        return (
                            <a
                                role="tab"
                                class={`tab transition-all duration-200 flex items-center gap-2 font-medium ${props.activeCategory === category.name
                                    ? "tab-active bg-neutral text-neutral-content font-bold shadow-md rounded-xl"
                                    : "text-base-content/70 hover:bg-base-200 rounded-xl"
                                    }`}
                                onClick={() => props.onCategoryChange(category.name)}
                            >
                                <Icon size={18} class="shrink-0" />
                                <span class="hidden sm:inline">{category.name}</span>
                            </a>
                        );
                    }}
                </For>
            </div>
        </div>
    );
}
