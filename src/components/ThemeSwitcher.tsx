import { createSignal, onMount, For } from "solid-js";
import { Palette, Check } from 'lucide-solid';

const DEFAULT_THEME = "lofi"

const THEMES = [
    { name: "lofi", label: "Lo-Fi", emoji: "🎵" },
    { name: "nord", label: "Nord", emoji: "❄️" },
    { name: "cupcake", label: "Cupcake", emoji: "🧁" },
    { name: "emerald", label: "Emerald", emoji: "💎" },
    { name: "corporate", label: "Corporate", emoji: "🏢" },
    { name: "forest", label: "Forest", emoji: "🌲" },
    { name: "pastel", label: "Pastel", emoji: "🎨" },
    { name: "wireframe", label: "Wireframe", emoji: "📐" },
    { name: "black", label: "Black", emoji: "🖤" },
    { name: "luxury", label: "Luxury", emoji: "👑" },
    { name: "dracula", label: "Dracula", emoji: "🧛" },
    { name: "autumn", label: "Autumn", emoji: "🍂" },
];

export default function ThemeSwitcher() {
    const [currentTheme, setCurrentTheme] = createSignal(DEFAULT_THEME);

    onMount(() => {
        const savedTheme = localStorage.getItem("theme") || DEFAULT_THEME;
        setCurrentTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
    });

    const changeTheme = (theme: string) => {
        setCurrentTheme(theme);
        localStorage.setItem("theme", theme);
        document.documentElement.setAttribute("data-theme", theme);
    };

    return (
        <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-sm gap-2">
                <Palette size={18} />
                <span class="hidden sm:inline">Theme</span>
            </div>
            <div tabindex="0" class="dropdown-content z-[100] mt-3 p-3 shadow-xl bg-base-100 rounded-box w-56 border border-base-300 max-h-80 overflow-y-auto">
                <div class="text-sm font-bold mb-2 px-2 text-base-content/70">Select Theme</div>
                <ul class="menu menu-sm p-0 gap-1">
                    <For each={THEMES}>
                        {(theme) => (
                            <li>
                                <button
                                    class={`flex items-center justify-between rounded-lg ${currentTheme() === theme.name ? 'bg-primary text-primary-content' : ''}`}
                                    onClick={() => changeTheme(theme.name)}
                                >
                                    <span class="flex items-center gap-2">
                                        <span>{theme.emoji}</span>
                                        <span>{theme.label}</span>
                                    </span>
                                    {currentTheme() === theme.name && <Check size={16} />}
                                </button>
                            </li>
                        )}
                    </For>
                </ul>
            </div>
        </div>
    );
}
