import { Product } from "../types";
import { A } from "@solidjs/router";
import { getOptimizedImageUrl, ImageKitTransformation } from '../lib/imagekit';

export default (props: Product) => {
    const cardTransformations: ImageKitTransformation[] = [
        { height: '400', width: '600', crop: 'maintain_ratio' }
    ];

    const imageUrl = getOptimizedImageUrl(props.image_url, cardTransformations);

    return (
        <div class="card w-full h-full bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-300 border border-base-200">

            <figure class="px-0 pt-0">
                <img
                    src={imageUrl}
                    alt={props.name}
                    class="h-56 w-full object-cover"
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
                    <button class="btn btn-sm btn-secondary">Add</button>
                    <button class="btn btn-sm btn-primary">Buy Now</button>
                </div>
            </div>
        </div >
    )
}
