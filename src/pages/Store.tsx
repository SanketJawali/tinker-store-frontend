import { createResource, For } from 'solid-js';
import { ProductAPI, Item } from '../types';
import ItemCard from '../components/ItemCard'; // Assuming ItemCard is your card component

// 1. Define the TypeScript interface for the API response pattern

// 3. Define the async data fetching function
const fetchProducts = async () => {
  // NOTE: Use the correct base URL if not running on the same host/port
  const response = await fetch(`http://localhost:8000/api/product`);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  const data: ProductAPI[] = await response.json();
  return data;
};

// 4. Update the component to use createResource
export default () => {
  // products() is a signal that will contain the fetched data
  const [products] = createResource(fetchProducts);

  return (
    <div class="p-8 w-screen flex justify-center">
      <div class="grid grid-cols-3 gap-8">
        {/* 5. Handle Loading, Error, and Success States */}

        {/* Loading State */}
        <span class="col-span-3 text-center" hidden={!products.loading}>
          Loading products...
        </span>

        {/* Error State */}
        {products.error &&
          <span class="col-span-3 text-center text-red-600">
            Error fetching data: {products.error.message}
          </span>
        }

        {/* Success State */}
        <For each={products()}>
          {(product) =>
            <ItemCard
              // Map API fields to ItemCard props
              title={product.name}
              imgSrc={product.image_url}
              description={product.description}
              price={product.price}
            />
          }
        </For>
      </div>
    </div>
  );
};
