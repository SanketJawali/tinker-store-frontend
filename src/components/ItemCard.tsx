import { Component, createSignal } from "solid-js";
import { Product, NewCartItem } from "../types";
import { addToCart } from "../lib/cartHelpers";
import { useSession } from "clerk-solidjs";
import { A } from "@solidjs/router";
import { getOptimizedImageUrl, ImageKitTransformation } from '../lib/imagekit';
import { ShoppingCart } from 'lucide-solid';


// Helper function stays the same
async function handleAddToCart(cartItem: NewCartItem, authToken: string) {
    // console.log("Adding to cart with token:", authToken.substring(0, 10) + "...");
    return await addToCart(cartItem, authToken);
}

const ItemCard: Component<Product> = (props) => {
    // 1. Use the hook inside the component
    const { session } = useSession();

    const [addToCartLoading, setAddToCartLoading] = createSignal<boolean>(false);
    const [buttonMessage, setButtonMessage] = createSignal<string>("Add");
    const [buttonColor, setButtonColor] = createSignal<string>("btn-primary");

    const onAddClick = async (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const currentSession = session();
        if (!currentSession) {
            alert("Please log in to add items to cart.");
            return;
        }

        const token = await currentSession.getToken();

        if (token) {
            setAddToCartLoading(true);

            const response = await handleAddToCart(
                { product_id: props.id, quantity: 1 },
                token
            );

            setAddToCartLoading(false);

            if (response?.success === true) {
                setButtonMessage("Added!");
                setButtonColor("btn-success");
                setTimeout(() => setButtonMessage("Add"), 2000);
                setTimeout(() => setButtonColor("btn-primary"), 2000);
            }
            else if (response?.success === false) {
                setButtonMessage("Error!");
                setButtonColor("btn-error");
                setTimeout(() => setButtonMessage("Add"), 2000);
                setTimeout(() => setButtonColor("btn-primary"), 2000);
            }
        }
    };

    const cardTransformations: ImageKitTransformation[] = [
        { height: '600', width: '600', crop: 'maintain_ratio' }
    ];

    const imageUrl = getOptimizedImageUrl(props.image_url, cardTransformations);

    return (
        <A href={`/product/${props.id}`} class="no-underline group">
            <div class="card w-full h-full bg-base-100 shadow-sm hover:shadow-lg transition-all duration-300 border border-base-300 group overflow-hidden rounded-xl hover:scale-[1.02] cursor-pointer">

                <figure class="relative aspect-square overflow-hidden bg-base-200">
                    <img
                        src={imageUrl}
                        alt={props.name}
                        class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                </figure>

                <div class="card-body p-3 sm:p-4 gap-2">
                    <div class="flex flex-col gap-1">
                        <span class="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wider">{props.category}</span>
                        <h3 class="text-sm sm:text-base font-bold text-base-content group-hover:text-primary transition-colors line-clamp-2 leading-tight">{props.name}</h3>
                    </div>

                    <p class="text-xs sm:text-sm text-base-content/70 line-clamp-2 hidden sm:block">{props.description}</p>

                    <div class="flex flex-col sm:flex-row sm:items-center gap-2 mt-auto pt-2 border-base-300">
                        <span class="text-lg sm:text-xl font-bold text-base-content">
                            ₹{props.price.toLocaleString()}
                        </span>
                        <button
                            class={`btn btn-sm py-2 sm:py-2 px-3 flex-1 sm:flex-none font-semibold transition-all duration-300 rounded-lg gap-1.5 ${buttonColor()} ${addToCartLoading() ? 'opacity-75' : ''}`}
                            onClick={(e) => onAddClick(e)}
                            disabled={addToCartLoading()}
                        >
                            {addToCartLoading() ? (
                                <span class="loading loading-spinner loading-xs"></span>
                            ) : (
                                <>
                                    <ShoppingCart size={14} />
                                    <span>{buttonMessage()}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </A>
    );
};

export default ItemCard;
