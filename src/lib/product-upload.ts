import {
  upload,
  UploadOptions,
  UploadResponse,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError
} from '@imagekit/javascript';
import { ProductRequest, SingleProductResponse, APIErrorResponse } from '../types';

const PUBLIC_KEY = import.meta.env.VITE_IMAGE_KIT_PUBLIC_KEY;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

interface ImageKitAuthResponse {
  token: string;
  signature: string;
  expire: number;
}

async function getSignature(authToken: string): Promise<ImageKitAuthResponse> {
  const res = await fetch(`${BACKEND_URL}/api/cdn-auth`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${authToken}` // Header added here
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to get ImageKit signature. Status: ${res.status}`);
  }

  const data: ImageKitAuthResponse = await res.json();
  return data;
}

async function uploadProductImage(file: File, authToken: string): Promise<string> {
  // Pass token to get signature
  const { token, signature, expire } = await getSignature(authToken);
  const uploadOptions: UploadOptions = {
    file,
    fileName: file.name,
    token,
    signature,
    expire,
    publicKey: PUBLIC_KEY,
  };

  try {
    const uploadResponse: UploadResponse = await upload(uploadOptions);
    if (uploadResponse.url) {
      return uploadResponse.url;
    } else {
      throw new Error("ImageKit upload succeeded, but did not return a valid URL.");
    }
  } catch (error) {
    if (error instanceof ImageKitAbortError) {
      throw new Error(`Upload aborted: ${error.reason}`);
    } else if (error instanceof ImageKitInvalidRequestError) {
      throw new Error(`Invalid ImageKit request: ${error.message}`);
    } else if (error instanceof ImageKitUploadNetworkError) {
      throw new Error(`ImageKit network issue: ${error.message}`);
    } else if (error instanceof ImageKitServerError) {
      throw new Error(`ImageKit server error: ${error.message}`);
    } else if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown error occurred during image upload.");
  }
}

/**
 * Main service function to handle the entire product creation workflow.
 * UPDATED: payload no longer requires owner_id
 */
export async function createProduct(
  file: File,
  payload: Omit<ProductRequest, 'image_url'>,
  authToken: string
): Promise<SingleProductResponse> {

  // 1. Upload Image (needs auth for signature)
  const imageUrl = await uploadProductImage(file, authToken);

  const finalPayload: ProductRequest = {
    ...payload,
    image_url: imageUrl,
  };

  // 2. Post to Backend (needs auth for protection)
  const res = await fetch(`${BACKEND_URL}/api/product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}` // Header added here
    },
    body: JSON.stringify(finalPayload)
  });

  const data: SingleProductResponse | APIErrorResponse = await res.json().catch(() => ({}));

  if (!res.ok || !data.success) {
    const errorData = data as APIErrorResponse;
    throw new Error(errorData.message || `Failed to create product. Status: ${res.status}`);
  }

  return data as SingleProductResponse;
}
