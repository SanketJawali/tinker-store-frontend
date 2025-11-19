import { createResource, For } from 'solid-js';
import { ProductListResponse, APIErrorResponse } from '../types'; // Import new response type
import ItemCard from '../components/ItemCard'; // Assuming ItemCard is your card component

// 1. Define the async data fetching function
const fetchProducts = async () => {
  const response = await fetch(`http://localhost:8000/api/product`);
  const data: ProductListResponse | APIErrorResponse = await response.json();

  if (!response.ok || !data.success) {
    // If the HTTP status is not OK (e.g., 404, 500) OR the success flag is false
    const errorData = data as APIErrorResponse;

    // Throw a specific error object that includes the detailed message
    throw new Error(errorData.message || "Failed to fetch products with an unknown error.");
  }

  // If successful, return the actual product array from the 'data' field
  const successData = data as ProductListResponse;
  return successData.data;
};

// 2. Update the component to use createResource
export default () => {
  // products() will contain the array of Product[] upon success
  const [products] = createResource(fetchProducts);

  return (
    <div class="p-8 w-screen flex justify-center">
      <div class="grid grid-cols-3 gap-8">

        {/* Handle Loading State */}
        {products.loading && (
          <span class="col-span-3 text-center">
            Loading products...
          </span>
        )}

        {/* Handle Error State */}
        {products.error && (
          <span class="col-span-3 text-center text-red-600">
            Error fetching data: {products.error.message}
          </span>
        )}

        {/* Success State */}
        {/* products() only returns a value when loading is false and there is no error */}
        <For each={products()}>
          {(product) =>
            <ItemCard
              // Map API fields to ItemCard props
              // This mapping remains the same because the base Product interface didn't change
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
