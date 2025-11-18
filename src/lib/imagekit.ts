// src/lib/imagekit.ts

// 1. Import the utility functions and types directly as named exports.
import {
  buildSrc,
  Transformation,
} from '@imagekit/javascript';

export type ImageKitTransformation = Transformation;

/**
 * Generates an ImageKit URL using the buildSrc function.
 * @param fileName - The file name (path) in your ImageKit account.
 * @param transformations - Array of ImageKit transformation objects.
 * @returns The complete, optimized ImageKit URL.
 */
export const getOptimizedImageUrl = (
  fileName: string,
  transformations: ImageKitTransformation[] = []
): string => {
  // Use the imported buildSrc function directly
  return buildSrc({
    urlEndpoint: import.meta.env.IMAGE_KIT_URL,
    src: fileName, // The docs call this 'src', which is your fileName/path
    transformation: transformations
  });
};
