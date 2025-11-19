// --- Base Data Models (Matching SQLAlchemy/Pydantic Schemas) ---

/**
 * Base type for product information, matching the ProductDB schema.
 * This is the core 'data' object returned by the API routes.
 */
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  image_url: string;
  owner_id: number;
}

/**
 * Base type for a single product review.
 */
export interface Review {
  id: number;
  item_id: number;
  user_id: number;
  rating: number; // Constrained 1-5
  review_text: string;
  // Dates are transmitted as ISO 8601 strings
  created_at: string;
  updated_at: string;
}

/**
 * Base type for a User, usually nested inside other responses (e.g., in a Review).
 */
export interface User {
  id: number;
  name: string;
  email: string;
}

/**
 * Interface matching the request body for creating a new product.
 */
export interface ProductRequest {
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  image_url: string;
}

// --- General API Response Structures ---

/**
 * Standard Error Response used for all 4xx and 5xx errors.
 * The server returns this structure in the response body.
 */
export interface APIErrorResponse {
  success: false;
  message: string;
  error_code?: string; // e.g., "PRODUCT_NOT_FOUND", "DB_CREATE_ERROR"
}

/**
 * Wrapper for the GET /api/product (list of products) route.
 */
export interface ProductListResponse {
  success: true;
  message: string;
  data: Product[];
}

/**
 * Wrapper for responses that return a single product object 
 * (e.g., POST /api/product).
 */
export interface SingleProductResponse {
  success: true;
  message: string;
  data: Product;
}

/**
 * Wrapper for the GET /api/product/{id} route, including reviews.
 */
export interface ProductDetailsResponse {
  success: true;
  message: string;
  product: Product;
  reviews: Review[];
}

// --- Previous Item Interface (Keep if still used elsewhere) ---

/**
 * NOTE: This interface appears to be for a simple view model. 
 * If you still use it, keep it. Otherwise, you can remove it.
 */
export interface Item {
  imgSrc: string,
  title: string,
  price: number,
  description: string
}
