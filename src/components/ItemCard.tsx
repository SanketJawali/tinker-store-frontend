import { Item } from "../types";

export default (props: Item) => {
  return (
    <div class="card bg-base-100 w-96 shadow-md border-2 border-base-300">
      <figure>
        <img
          src={props.imgSrc}
          alt={props.imgAlt} />
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
