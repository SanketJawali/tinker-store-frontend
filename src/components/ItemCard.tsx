import { Item } from "../types";
import { getOptimizedImageUrl, ImageKitTransformation } from '../lib/imagekit';

export default (props: Item) => {
  // 2. Define the transformation using the imported type
  const cardTransformations: ImageKitTransformation[] = [
    { height: '300', width: '400', crop: 'at_max' } // Using string values for IK parameters
  ];

  // 3. Generate the ImageKit URL using the typed helper function
  const imageUrl = getOptimizedImageUrl(props.imgSrc, cardTransformations);

  return (
    <div class="card bg-base-100 w-96 shadow-md border-2 border-base-300">
      <figure>
        <img
          // Use the generated, optimized ImageKit URL
          src={imageUrl}
        />
      </figure>

      <div class="card-body">
        <h2 class="card-title">{props.title}</h2>
        <h2 class="card-title">₹ {props.price}</h2>
        <p>{props.description}</p>
        <div class="card-actions justify-end">
          <button class="btn btn-secondary">Add to Cart</button>
          <button class="btn btn-primary">Buy Now</button>
        </div>
      </div>
    </div>
  )
}
