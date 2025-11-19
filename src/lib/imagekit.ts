// src/lib/imagekit.ts

// 1. Import the utility functions and types directly as named exports.
import {
  buildSrc,
  Transformation,
} from '@imagekit/javascript';

export type ImageKitTransformation = Transformation;

// Get the URL endpoint from environment variables
const IMAGE_KIT_URL_ENDPOINT = import.meta.env.VITE_IMAGE_KIT_URL;

/**
 * Generates an ImageKit URL using the buildSrc function.
 * @param fileName - The file name (path) in your ImageKit account.
 * @param transformations - Array of ImageKit transformation objects.
 * @returns The complete, optimized ImageKit URL, or an empty string on error.
 */
export const getOptimizedImageUrl = (
  fileName: string,
  transformations: ImageKitTransformation[] = []
): string => {
  // --- Runtime check for missing URL endpoint ---
  if (!IMAGE_KIT_URL_ENDPOINT) {
    console.error("ERROR: IMAGE_KIT_URL environment variable is missing or empty.");
    return ""; // Return empty string to prevent URL constructor error
  }

  // Use the imported buildSrc function directly
  return buildSrc({
    urlEndpoint: IMAGE_KIT_URL_ENDPOINT,
    src: fileName, // The docs call this 'src', which is your fileName/path
    transformation: transformations
  });
};
