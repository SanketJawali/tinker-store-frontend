import { Item } from "../types";
import { getOptimizedImageUrl, ImageKitTransformation } from '../lib/imagekit';

export default (props: Item) => {
    // Update: Request a slightly larger image to account for retina displays
    // and ensure aspect ratio matches CSS (roughly 4:3 here)
    const cardTransformations: ImageKitTransformation[] = [
        { height: '400', width: '600', crop: 'at_max' }
    ];

    const imageUrl = getOptimizedImageUrl(props.imgSrc, cardTransformations);

    return (
        // FIX 1: Removed 'w-96'. Added 'w-full' and 'h-full'.
        // Added 'hover:shadow-xl' and 'transition' for better UI feel.
        <div class="card w-full h-full bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-300 border border-base-200">

            <figure class="px-0 pt-0">
                <img
                    src={imageUrl}
                    alt={props.title}
                    // FIX 2: 'object-cover' prevents stretching. 'h-56' enforces consistent height.
                    class="h-56 w-full object-cover"
                />
            </figure>

            <div class="card-body flex flex-col p-5">
                <div class="flex justify-between items-start gap-2">
                    <h2 class="card-title text-lg leading-tight">{props.title}</h2>
                    <span class="badge badge-lg badge-ghost font-bold shrink-0">
                        ₹{props.price}
                    </span>
                </div>

                {/* FIX 3: limit text lines so cards don't become excessively tall */}
                <p class="text-sm text-base-content/70 grow line-clamp-3">
                    {props.description}
                </p>

                <div class="card-actions justify-end mt-4">
                    <button class="btn btn-sm btn-secondary">Add</button>
                    <button class="btn btn-sm btn-primary">Buy Now</button>
                </div>
            </div>
        </div>
    )
}
