import { Component } from "solid-js";
import { Product, NewCartItem } from "../types";
import { addToCart } from "../lib/cartHelpers";
import { useSession } from "clerk-solidjs"; // Import Hook
import { A } from "@solidjs/router";
import { getOptimizedImageUrl, ImageKitTransformation } from '../lib/imagekit';


// Helper function stays the same
async function handleAddToCart(cartItem: NewCartItem, authToken: string) {
    console.log("Adding to cart with token:", authToken.substring(0, 10) + "...");
    await addToCart(cartItem, authToken);
}

const ItemCard: Component<Product> = (props) => {
    // 1. Use the hook inside the component
    const { session } = useSession();

    const onAddClick = async () => {
        const currentSession = session();
        if (!currentSession) {
            alert("Please log in to add items to cart.");
            return;
        }

        // 2. Get token asynchronously when the user CLICKS
        const token = await currentSession.getToken();
        
        if (token) {
            await handleAddToCart(
                { product_id: props.id, quantity: 1 }, 
                token
            );
        }
    };

    const cardTransformations: ImageKitTransformation[] = [
        { height: '600', width: '600', crop: 'maintain_ratio' }
    ];

    const imageUrl = getOptimizedImageUrl(props.image_url, cardTransformations);

    return (
        <div class="card w-full h-full bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-300 border border-base-200">

            <figure class="px-0 pt-0">
                <img
                    src={imageUrl}
                    alt={props.name}
                    class="w-full object-cover"
                />
            </figure>

            <div class="card-body flex flex-col p-5">
                <div class="flex justify-between items-start gap-2">
                    <A class="card-title text-lg leading-tight" href={`/product/${props.id}`}>{props.name}</A>
                    <span class="badge badge-lg badge-ghost font-bold shrink-0">
                        ₹{props.price}
                    </span>
                </div>

                {/* FIX 3: limit text lines so cards don't become excessively tall */}
                <p class="text-sm text-base-content/70 grow line-clamp-3">
                    {props.description}
                </p>

                <div class="card-actions justify-end mt-4">
                    <button 
                        class="btn btn-primary btn-sm"
                        onClick={onAddClick} // Use our new wrapper
                    >
                        Add to Cart
                    </button>
                    {/* <button class="btn btn-secondary btn-sm">Buy Now</button> */}
                </div>
            </div>
        </div >
    )
}

export default ItemCard;
