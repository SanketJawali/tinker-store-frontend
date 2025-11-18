import { createSignal } from "solid-js";
import {
  upload,
  UploadOptions,
  UploadResponse,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError
} from '@imagekit/javascript';


interface ImageKitAuthResponse {
  token: string;
  signature: string;
  expire: number;
}

export default () => {
  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [price, setPrice] = createSignal("");
  const [category, setCategory] = createSignal("");
  const [stock, setStock] = createSignal("");
  const [imageFile, setImageFile] = createSignal<File | null>(null);

  // const publicKey = import.meta.env.IMAGE_KIT_PUBLIC_KEY;
  const publicKey = 'public_a1P1imlofZQ7XfFB/agre3Ye+uo='
  const backendUrl = 'http://localhost:8000';
  const urlEndpoint = import.meta.env.IMAGE_KIT_URL;

  const abortController = new AbortController(); // You can abort the upload using abortController.abort();

  async function getSignature(): Promise<ImageKitAuthResponse> {
    const res = await fetch(`${backendUrl}/api/cdn-auth`, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Failed to get ImageKit signature");
    }

    const data: ImageKitAuthResponse = await res.json();
    return data;
  }

  async function handleImageUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0] ?? null;

    if (!file) return;
    setImageFile(file);

    try {
      const { token, signature, expire } = await getSignature();

      const uploadOptions: UploadOptions = {
        file,
        fileName: file.name,
        token,
        signature,
        expire,
        publicKey,
        onProgress: (event: ProgressEvent) => {
          console.log(`Progress: ${event.loaded}/${event.total}`);
        },
        abortSignal: abortController.signal,
      };

      const response: UploadResponse = await upload(uploadOptions);
      console.log("Upload successful:", response);

      // If needed: store uploaded image URL
      // response.url
    }
    catch (error) {
      if (error instanceof ImageKitAbortError) {
        console.error("Upload aborted:", error.reason);
      } else if (error instanceof ImageKitInvalidRequestError) {
        console.error("Invalid request:", error.message);
      } else if (error instanceof ImageKitUploadNetworkError) {
        console.error("Network issue:", error.message);
      } else if (error instanceof ImageKitServerError) {
        console.error("Server error:", error.message);
      } else {
        console.error("Upload error:", error);
      }
    }
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!imageFile()) {
      alert("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name());
    formData.append("description", description());
    formData.append("price", price());
    formData.append("category", category());
    formData.append("stock", stock());
    formData.append("image", imageFile()!);

    console.log("Submitted:", Object.fromEntries(formData));

    // Example:
    // await fetch(`${backendUrl}/product`, { method: "POST", body: formData });
  };

  return (
    <div class="flex justify-center items-center min-h-screen bg-base-200">
      <div class="w-full max-w-xl p-6 bg-base-100 shadow-xl rounded-xl">
        <h1 class="text-3xl font-bold mb-6 text-center">Add New Product</h1>

        <form onSubmit={handleSubmit} class="space-y-5">

          {/* Product Name */}
          <div>
            <label class="label">
              <span class="label-text">Product Name</span>
            </label>
            <input
              type="text"
              class="input input-bordered w-full px-4"
              placeholder="Enter product name"
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label class="label">
              <span class="label-text">Description</span>
            </label>
            <textarea
              class="textarea textarea-bordered w-full px-4 py-2"
              rows={3}
              placeholder="Enter product description"
              value={description()}
              onInput={(e) => setDescription(e.currentTarget.value)}
              required
            />
          </div>

          {/* Price */}
          <div>
            <label class="label">
              <span class="label-text">Price</span>
            </label>
            <input
              type="number"
              class="input input-bordered w-full px-4 py-2"
              placeholder="Enter price"
              value={price()}
              onInput={(e) => setPrice(e.currentTarget.value)}
              min="0"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label class="label">
              <span class="label-text">Category</span>
            </label>
            <select
              class="select select-bordered w-full"
              value={category()}
              onInput={(e) => setCategory(e.currentTarget.value)}
              required
            >
              <option value="">Select category</option>
              <option value="clothing">Clothing</option>
              <option value="electronics">Electronics</option>
              <option value="home">Home</option>
              <option value="sports">Sports</option>
              <option value="books">Books</option>
            </select>
          </div>

          {/* Stock */}
          <div>
            <label class="label">
              <span class="label-text">Stock</span>
            </label>
            <input
              type="number"
              class="input input-bordered w-full"
              placeholder="Enter available stock"
              value={stock()}
              onInput={(e) => setStock(e.currentTarget.value)}
              min="0"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label class="label">
              <span class="label-text">Product Image</span>
            </label>

            <input
              type="file"
              accept="image/*"
              class="file-input file-input-bordered w-full"
              onChange={(e) => handleImageUpload(e)}
              required
            />
          </div>

          {/* Submit */}
          <button class="btn btn-primary w-full" type="submit">
            Add Product
          </button>

        </form>
      </div>
    </div>
  );
}
