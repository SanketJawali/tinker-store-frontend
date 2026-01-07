import { Component, createSignal } from "solid-js";
import { Product, NewCartItem } from "../types";
import { addToCart } from "../lib/cartHelpers";
import { useSession } from "clerk-solidjs"; // Import Hook
import { A } from "@solidjs/router";
import { getOptimizedImageUrl, ImageKitTransformation } from '../lib/imagekit';
import { ShoppingCart, Tag } from 'lucide-solid';


// Helper function stays the same
async function handleAddToCart(cartItem: NewCartItem, authToken: string) {
    // console.log("Adding to cart with token:", authToken.substring(0, 10) + "...");
    return await addToCart(cartItem, authToken);
}

const ItemCard: Component<Product> = (props) => {
    // 1. Use the hook inside the component
    const { session } = useSession();

    const [addToCartLoading, setAddToCartLoading] = createSignal<boolean>(false);
    const [buttonMessage, setButtonMessage] = createSignal<string>("Add to Cart");
    const [buttonColor, setButtonColor] = createSignal<string>("btn-primary");

    const onAddClick = async (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const currentSession = session();
        if (!currentSession) {
            alert("Please log in to add items to cart.");
            return;
        }

        // 2. Get token asynchronously when the user CLICKS
        const token = await currentSession.getToken();

        if (token) {
            setAddToCartLoading(true);

            const response = await handleAddToCart(
                { product_id: props.id, quantity: 1 },
                token
            );

            if (response?.success === true) {
                setButtonMessage("Added!");
                setButtonColor("btn-success");
                setTimeout(() => setButtonMessage("Add to Cart"), 2000);
                setTimeout(() => setButtonColor("btn-primary"), 2000);
            }
            else if (response?.success === false) {
                setButtonMessage("Error!");
                setButtonColor("btn-error");
                setTimeout(() => setButtonMessage("Add to Cart"), 2000);
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
            <div class="card w-full h-full bg-base-100 shadow-md hover:shadow-2xl transition-all duration-300 border border-base-300 group overflow-hidden rounded-2xl hover:scale-105 cursor-pointer">

                <figure class="relative aspect-square overflow-hidden bg-base-200">
                    <img
                        src={imageUrl}
                        alt={props.name}
                        class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                    />
                    <div class="absolute top-3 right-3 bg-base-100 px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Tag size={16} class="text-primary" />
                        <span class="text-sm font-bold text-primary">₹{props.price}</span>
                    </div>
                </figure>

                <div class="card-body p-4 sm:p-5 gap-3">
                    <div class="flex flex-col gap-2">
                        <span class="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-1 rounded-full w-fit">{props.category}</span>
                        <h3 class="card-title text-lg text-base-content group-hover:text-primary transition-colors line-clamp-2">{props.name}</h3>
                    </div>

                    <p class="text-sm text-base-content/60 line-clamp-2">{props.description}</p>
                   
                    <div class="flex items-center gap-2 mt-auto pt-3 border-t border-base-300">
                        <button
                            class={`btn btn-sm flex-1 font-semibold transition-all duration-300 rounded-lg ${buttonColor()} ${addToCartLoading() ? 'opacity-75' : ''}`}
                            onClick={onAddClick}
                            disabled={addToCartLoading()}
                        >
                            {addToCartLoading() ? (
                                <span class="loading loading-spinner loading-sm text-white"></span>
                            ) : (
                                <>
                                    <ShoppingCart size={16} />
                                    {buttonMessage()}
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
