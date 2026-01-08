import { createSignal, createMemo, Show, onCleanup, For } from "solid-js";
import { createStore } from "solid-js/store";
import { createProduct } from "../lib/product-upload";
import { ProductRequest } from "../types";
import { useUser, useSession } from "clerk-solidjs";
import { RiSystemErrorWarningLine, RiMediaImageAddLine } from 'solid-icons/ri'

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
    const { session } = useSession();

    const [form, setForm] = createStore<ProductForm>(initialFormState);
    const [imageFile, setImageFile] = createSignal<File | null>(null);
    const [previewUrl, setPreviewUrl] = createSignal<string | null>(null);
    const [isSubmitting, setIsSubmitting] = createSignal(false);
    const [isDragging, setIsDragging] = createSignal(false);
    const [message, setMessage] = createSignal<{ type: 'success' | 'error', text: string } | null>(null);
    const [errors, setErrors] = createStore<ValidationErrors>({});

    const hasErrors = createMemo(() => Object.values(errors).some(e => e !== undefined));

    // Cleanup object URL to avoid memory leaks
    onCleanup(() => {
        const url = previewUrl();
        if (url) URL.revokeObjectURL(url);
    });

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

    const processFile = (file: File | null) => {
        // Revoke previous preview URL
        const oldUrl = previewUrl();
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        setPreviewUrl(null);

        setImageFile(file);
        setMessage(null);
        setErrors("imageFile", undefined);

        if (file) {
            if (file.size > MAX_IMAGE_SIZE_BYTES) {
                setErrors("imageFile", `File is too large (>${MAX_IMAGE_SIZE_MB}MB). Please select a smaller file.`);
                setImageFile(null);
            } else {
                // Generate new preview URL
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            }
        }
    };

    const handleFileChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0] ?? null;

        processFile(file);

        // If invalid via input, reset the input value so user can select same file again if they want (though it failed)
        if (file && file.size > MAX_IMAGE_SIZE_BYTES) {
            target.value = "";
        }
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                processFile(file);
            } else {
                setErrors("imageFile", "Please drop a valid image file.");
            }
        }
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setMessage(null);

        const currentUser = user();
        const currentSession = session();
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

            const response = await createProduct(file!, payload, token);

            setMessage({ type: 'success', text: `Product '${response.data.name}' added successfully!` });

            // Reset form
            setForm(initialFormState);
            setImageFile(null);
            const oldUrl = previewUrl();
            if (oldUrl) URL.revokeObjectURL(oldUrl);
            setPreviewUrl(null);

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
        form.name && form.description && form.price && form.category && form.stock && imageFile() && !hasErrors()
    );

    return (
        <div class="min-h-screen bg-base-200 flex justify-center items-start lg:items-center py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
            <div class="card lg:card-side bg-base-100 shadow-xl max-w-5xl w-full overflow-hidden rounded-2xl">

                {/* Left Panel: Image Upload & Preview */}
                <div class="w-full lg:w-5/12 bg-base-200/50 p-4 lg:p-8 flex flex-col border-b lg:border-b-0 lg:border-r border-base-300">
                    <div class="mb-4 lg:mb-6">
                        <h2 class="text-xl lg:text-2xl font-bold text-base-content">Product Image</h2>
                        <p class="text-sm text-base-content/60 mt-1">Upload a high-quality image to showcase your product.</p>
                    </div>

                    <div class="flex-1 flex flex-col justify-center">
                        <div
                            class={`relative w-full aspect-square rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center overflow-hidden bg-base-100 ${isDragging() ? 'border-secondary bg-secondary/5 scale-[1.02]' :
                                errors.imageFile
                                    ? 'border-error bg-error/5'
                                    : previewUrl()
                                        ? 'border-secondary/50'
                                        : 'border-base-300 hover:border-secondary hover:bg-base-200'
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                id="image-upload"
                                class="hidden"
                                onChange={handleFileChange}
                            />

                            <Show when={!previewUrl()}>
                                <label for="image-upload" class="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
                                    <div class={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isDragging() ? 'bg-secondary/20' : 'bg-base-200'}`}>
                                        <RiMediaImageAddLine class={`text-3xl ${isDragging() ? 'text-secondary' : 'text-base-content/50'}`} />
                                    </div>
                                    <div>
                                        <span class="font-semibold text-secondary hover:underline">Click to upload</span>
                                        <span class="text-base-content/60"> or drag and drop</span>
                                    </div>
                                    <span class="text-xs text-base-content/40">SVG, PNG, JPG or GIF (MAX. {MAX_IMAGE_SIZE_MB}MB)</span>
                                </label>
                            </Show>

                            <Show when={previewUrl()}>
                                <img
                                    src={previewUrl()!}
                                    alt="Preview"
                                    class="w-full h-full object-contain p-2"
                                />
                                <div class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <label for="image-upload" class="btn btn-white btn-sm gap-2">
                                        <RiMediaImageAddLine /> Change Image
                                    </label>
                                </div>
                            </Show>
                        </div>

                        <Show when={errors.imageFile}>
                            <div class="alert alert-error text-xs mt-4 py-2 shadow-sm">
                                <RiSystemErrorWarningLine class="text-lg" />
                                <span>{errors.imageFile}</span>
                            </div>
                        </Show>
                    </div>
                </div>

                {/* Right Panel: Form Details */}
                <div class="w-full lg:w-7/12 p-8 lg:p-10 bg-base-100">
                    <div class="mb-8">
                        <h1 class="text-3xl font-bold text-base-content">Product Details</h1>
                        <p class="text-base-content/60 mt-1">Fill in the information below to list your item.</p>
                    </div>

                    {/* Alerts */}
                    <Show when={message()}>
                        <div role="alert" class={`alert mb-6 shadow-sm ${message()!.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                            <Show when={message()!.type === 'success'} fallback={<RiSystemErrorWarningLine class="text-xl" />}>
                                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </Show>
                            <span>{message()!.text}</span>
                        </div>
                    </Show>

                    {/* Auth Checks */}
                    <Show when={user() === undefined}>
                        <div class="skeleton h-12 w-full mb-6"></div>
                    </Show>
                    <Show when={user() === null}>
                        <div class="alert alert-warning mb-6">
                            <RiSystemErrorWarningLine />
                            <span>Please sign in to add a product.</span>
                        </div>
                    </Show>

                    <form onSubmit={handleSubmit} class="space-y-5">
                        {/* Name */}
                        <div class="form-control w-full">
                            <label class="label">
                                <span class="label-text font-semibold">Product Name</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Vintage Camera Lens"
                                class={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                                value={form.name}
                                onInput={handleInput('name')}
                            />
                            <Show when={errors.name}>
                                <label class="label">
                                    <span class="label-text-alt text-error">{errors.name}</span>
                                </label>
                            </Show>
                        </div>

                        {/* Description */}
                        <div class="form-control w-full">
                            <label class="label">
                                <span class="label-text font-semibold">Description</span>
                                <span class="label-text-alt text-base-content/50">{form.description.length}/{MAX_DESC_LENGTH}</span>
                            </label>
                            <textarea
                                class={`textarea textarea-bordered h-32 resize-none ${errors.description ? 'textarea-error' : ''}`}
                                placeholder="Describe the condition, features, and history of your item..."
                                value={form.description}
                                onInput={handleInput('description')}
                            ></textarea>
                            <Show when={errors.description}>
                                <label class="label">
                                    <span class="label-text-alt text-error">{errors.description}</span>
                                </label>
                            </Show>
                        </div>

                        {/* Row: Category & Stock */}
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div class="form-control w-full">
                                <label class="label">
                                    <span class="label-text font-semibold">Category</span>
                                </label>
                                <select
                                    class={`select select-bordered w-full ${errors.category ? 'select-error' : ''}`}
                                    value={form.category}
                                    onInput={handleInput('category')}
                                >
                                    <option value="" disabled selected>Select Category</option>
                                    <option value="clothing">Clothing</option>
                                    <option value="electronics">Electronics</option>
                                    <option value="home">Home</option>
                                    <option value="sports">Sports</option>
                                    <option value="books">Books</option>
                                    <option value="kitchen">Kitchen</option>
                                    <option value="outdoors">Outdoors</option>
                                    <option value="media">Media</option>
                                </select>
                                <Show when={errors.category}>
                                    <label class="label">
                                        <span class="label-text-alt text-error">{errors.category}</span>
                                    </label>
                                </Show>
                            </div>

                            <div class="form-control w-full">
                                <label class="label">
                                    <span class="label-text font-semibold">Stock</span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    min="0"
                                    class={`input input-bordered w-full ${errors.stock ? 'input-error' : ''}`}
                                    value={form.stock}
                                    onInput={handleInput('stock')}
                                />
                                <Show when={errors.stock}>
                                    <label class="label">
                                        <span class="label-text-alt text-error">{errors.stock}</span>
                                    </label>
                                </Show>
                            </div>
                        </div>

                        {/* Price */}
                        <div class="form-control w-full">
                            <label class="label">
                                <span class="label-text font-semibold">Price</span>
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span class="text-base-content/50 font-bold">{CURRENCY_SYMBOL}</span>
                                </div>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    min="0.01"
                                    step="0.01"
                                    class={`input input-bordered w-full pl-8 ${errors.price ? 'input-error' : ''}`}
                                    value={form.price}
                                    onInput={handleInput('price')}
                                />
                            </div>
                            <Show when={errors.price}>
                                <label class="label">
                                    <span class="label-text-alt text-error">{errors.price}</span>
                                </label>
                            </Show>
                        </div>

                        {/* Submit Button */}
                        <div class="pt-4">
                            <button
                                type="submit"
                                class="btn btn-primary w-full btn-lg shadow-lg"
                                disabled={isSubmitting() || !isFormValid() || user() === null}
                            >
                                {isSubmitting() ? (
                                    <>
                                        <span class="loading loading-spinner"></span>
                                        Publishing...
                                    </>
                                ) : (
                                    "Publish Product"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
