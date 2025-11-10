import ItemCard from "./ItemCard";
import { Item } from "../types";
import { For } from "solid-js";

export default () => {
  let Items: Item[] = [
    {
      imgSrc: "src/assets/red-shoes.png",
      imgAlt: "Red running shoes",
      title: "Red Running Shoes",
      price: 2499,
      description: "Lightweight running shoes designed for comfort and durability."
    },
    {
      imgSrc: "src/assets/wireless-headphones.png",
      imgAlt: "Wireless over-ear headphones",
      title: "Wireless Headphones",
      price: 4499,
      description: "Noise-cancelling wireless headphones with 20 hours of battery life."
    },
    {
      imgSrc: "src/assets/coffee-mug.png",
      imgAlt: "Ceramic coffee mug",
      title: "Ceramic Coffee Mug",
      price: 399,
      description: "Matte-finish ceramic mug suitable for hot and cold beverages."
    },
    {
      imgSrc: "src/assets/leather-wallet.png",
      imgAlt: "Brown leather wallet",
      title: "Leather Wallet",
      price: 1599,
      description: "Genuine leather wallet with multiple compartments for cards and cash."
    },
    {
      imgSrc: "src/assets/office-chair.png",
      imgAlt: "Ergonomic office chair",
      title: "Ergonomic Office Chair",
      price: 8999,
      description: "Adjustable office chair with lumbar support and breathable mesh."
    }
  ];
  return (
    <div class="p-8 w-screen flex justify-center">
      <div class="grid grid-cols-3 gap-8">
        <For each={Items}>
          {(item, _) =>
            <ItemCard
              title={item.title}
              imgSrc={item.imgSrc}
              imgAlt={item.imgAlt}
              description={item.description}
              price={item.price}
            />
          }
        </For>
      </div>
    </div>
  )
}
