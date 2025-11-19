import { createSignal, createMemo, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { createProduct } from "../lib/product-upload";
import { ProductRequest } from "../types";
import { useUser, useSession } from "clerk-solidjs"; // Added useSession
import { RiSystemLoaderLine, RiSystemErrorWarningLine } from 'solid-icons/ri'

const MAX_NAME_LENGTH = 50;
const MAX_DESC_LENGTH = 500;
const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const CURRENCY_SYMBOL = "₹";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
}

const initialFormState: ProductForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
};

interface ValidationErrors {
  name?: string;
  description?: string;
  price?: string;
  stock?: string;
  category?: string;
  imageFile?: string;
}

export default () => {
  const { user } = useUser();
  const { session } = useSession(); // Hook to get session methods

  const [form, setForm] = createStore<ProductForm>(initialFormState);
  const [imageFile, setImageFile] = createSignal<File | null>(null);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [message, setMessage] = createSignal<{ type: 'success' | 'error', text: string } | null>(null);
  const [errors, setErrors] = createStore<ValidationErrors>({});

  const hasErrors = createMemo(() => Object.values(errors).some(e => e !== undefined));

  const validateForm = (currentForm: ProductForm, file: File | null): boolean => {
    const newErrors: ValidationErrors = {};

    if (!currentForm.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (currentForm.name.length > MAX_NAME_LENGTH) {
      newErrors.name = `Name must be under ${MAX_NAME_LENGTH} characters.`;
    }

    if (!currentForm.description.trim()) {
      newErrors.description = "Description is required.";
    } else if (currentForm.description.length > MAX_DESC_LENGTH) {
      newErrors.description = `Description must be under ${MAX_DESC_LENGTH} characters.`;
    }

    const priceNum = Number(currentForm.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = "Price must be a valid positive number.";
    }

    const stockNum = Number(currentForm.stock);
    if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      newErrors.stock = "Stock must be a non-negative whole number.";
    }

    if (!currentForm.category) {
      newErrors.category = "Category is required.";
    }

    if (!file) {
      newErrors.imageFile = "At least one image must be selected.";
    } else if (file.size > MAX_IMAGE_SIZE_BYTES) {
      newErrors.imageFile = `Image size must be less than ${MAX_IMAGE_SIZE_MB}MB.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInput = (key: keyof ProductForm) => (e: Event) => {
    const value = (e.currentTarget as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
    setForm(key, value);
    if (errors[key]) {
      setErrors(key, undefined);
    }
  };

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0] ?? null;
    setImageFile(file);
    setMessage(null);
    setErrors("imageFile", undefined);

    if (file && file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrors("imageFile", `File is too large (>${MAX_IMAGE_SIZE_MB}MB). Please select a smaller file.`);
      setImageFile(null);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setMessage(null);

    const currentUser = user();
    const currentSession = session(); // Get session object
    const file = imageFile();

    if (!validateForm(form, file)) {
      setMessage({ type: 'error', text: 'Please correct the errors highlighted in the form.' });
      return;
    }

    if (!currentUser || !currentUser.id || !currentSession) {
      setMessage({ type: 'error', text: 'Authentication error: Please ensure you are signed in.' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get fresh token for the request
      const token = await currentSession.getToken();

      if (!token) {
        throw new Error("Failed to retrieve session token.");
      }

      const payload: Omit<ProductRequest, 'image_url'> = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        stock: Number(form.stock),
      };

      // Pass token to service
      const response = await createProduct(file!, payload, token);

      setMessage({ type: 'success', text: `Product '${response.data.name}' added successfully!` });
      setForm(initialFormState);
      setImageFile(null);

      // Reset file input visually (hacky but effective for simple forms)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";

    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = (error instanceof Error) ? error.message : "An unexpected error occurred during submission.";
      setMessage({ type: 'error', text: errorMessage });

    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = createMemo(() =>
    form.name && form.description && form.price && form.category && form.stock && imageFile()
  );
  const filePreviewText = createMemo(() =>
    imageFile() ? `Selected: ${imageFile()!.name} (${(imageFile()!.size / 1024 / 1024).toFixed(2)} MB)` : "No file selected"
  );

  // Updated FormInput to accept 'step' prop
  const FormInput = ({ label, type = "text", name, value, onInput, min, step, error }: {
    label: string,
    type?: string,
    name: keyof ProductForm,
    value: string,
    onInput: (e: Event) => void,
    min?: string,
    step?: string, // Added step
    error?: string
  }) => (
    <div>
      <label class="label">
        <span class="label-text font-medium text-gray-700">{label}</span>
      </label>
      <input
        type={type}
        class={`input input-bordered w-full bg-white text-gray-800 ${error ? 'input-error border-error' : 'focus:border-blue-500'}`}
        placeholder={`Enter ${label.toLowerCase()}`}
        value={value}
        onInput={onInput}
        min={min}
        step={step} // Applied step
        required
      />
      <Show when={error}>
        <p class="text-xs text-error mt-1">{error}</p>
      </Show>
    </div>
  );

  return (
    <div class="flex justify-center items-center py-12 min-h-screen bg-gray-100">
      <div class="w-full max-w-lg p-8 bg-white shadow-2xl rounded-xl border border-gray-200">
        <h1 class="text-4xl font-extrabold mb-8 text-center text-gray-800">
          Add Product to Store
        </h1>

        {message() && (
          <div role="alert" class={`alert mb-6 shadow-lg border-2 ${message()!.type === 'success' ? 'alert-success border-green-500 text-green-800 bg-green-50' : 'alert-error border-red-500 text-red-800 bg-red-50'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={message()!.type === 'success' ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"} /></svg>
            <span>{message()!.text}</span>
          </div>
        )}

        {user() === undefined && <div class="text-center text-sm mb-4 text-gray-500">Checking authentication...</div>}
        {user() === null && <div class="text-center text-red-600 text-lg mb-4">Please sign in to add a product.</div>}


        <form onSubmit={handleSubmit} class="space-y-6" disabled={user() === null || user() === undefined}>
          <FormInput
            label="Product Name"
            name="name"
            value={form.name}
            onInput={handleInput('name')}
            error={errors.name}
          />
          <div>
            <label class="label">
              <span class="label-text font-medium text-gray-700">Description</span>
              <span class="label-text-alt text-gray-500">{`${form.description.length}/${MAX_DESC_LENGTH} chars`}</span>
            </label>
            <textarea
              class={`textarea textarea-bordered w-full bg-white text-gray-800 h-24 ${errors.description ? 'textarea-error border-error' : 'focus:border-blue-500'}`}
              placeholder="Enter detailed product description"
              value={form.description}
              onInput={handleInput('description')}
              required
            />
            <Show when={errors.description}>
              <p class="text-xs text-error mt-1">{errors.description}</p>
            </Show>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <FormInput
              label={`Price (${CURRENCY_SYMBOL})`}
              type="number"
              name="price"
              value={form.price}
              onInput={handleInput('price')}
              min="0.01"
              step="0.01" // Fix: Allow decimals (cents/paise)
              error={errors.price}
            />
            <FormInput
              label="Stock Quantity"
              type="number"
              name="stock"
              value={form.stock}
              onInput={handleInput('stock')}
              min="0"
              error={errors.stock}
            />
          </div>
          <div>
            <label class="label">
              <span class="label-text font-medium text-gray-700">Category</span>
            </label>
            <select
              class={`select select-bordered w-full bg-white text-gray-800 ${errors.category ? 'select-error border-error' : 'focus:border-blue-500'}`}
              value={form.category}
              onInput={handleInput('category')}
              required
            >
              <option value="" disabled selected>Select a category</option>
              <option value="clothing">Clothing</option>
              <option value="electronics">Electronics</option>
              <option value="home">Home & Kitchen</option>
              <option value="sports">Sports & Outdoors</option>
              <option value="books">Books & Media</option>
            </select>
            <Show when={errors.category}>
              <p class="text-xs text-error mt-1">{errors.category}</p>
            </Show>
          </div>
          <div class="pt-2">
            <label class="label">
              <span class="label-text font-medium text-gray-700">Product Image Upload</span>
            </label>
            <input
              type="file"
              accept="image/*"
              class={`file-input file-input-bordered w-full file-input-primary bg-white ${errors.imageFile ? 'file-input-error border-error' : ''}`}
              onChange={handleFileChange}
              required
            />
            <div class="label">
              <span class="label-text-alt text-gray-500">
                {filePreviewText()}
              </span>
            </div>
            <Show when={errors.imageFile}>
              <p class="text-xs text-error mt-1 flex items-center">
                <RiSystemErrorWarningLine class="inline mr-1" />
                {errors.imageFile}
              </p>
            </Show>
          </div>
          <button
            class="btn btn-primary btn-lg w-full mt-8 shadow-xl bg-blue-600 hover:bg-blue-700 text-white border-blue-600 disabled:bg-gray-300 disabled:text-gray-500"
            type="submit"
            disabled={isSubmitting() || hasErrors() || !isFormValid()}
          >
            {isSubmitting() ? (
              <>
                <RiSystemLoaderLine class="animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Add Product"
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
