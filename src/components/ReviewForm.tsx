import { createSignal, Show, For } from "solid-js";
import { useSession } from "clerk-solidjs";
import { NewReviewRequest, NewReviewResponse, APIErrorResponse, Review } from "../types";
import { X, Star } from "lucide-solid";
import { fetchWithTimeout, parseJsonResponse, BACKEND_URL } from '../lib/api';

interface ReviewFormProps {
    productId: number;
    isOpen: boolean;
    onClose: () => void;
    onReviewAdded: (review: Review) => void;
}

export default function ReviewForm(props: ReviewFormProps) {
    const { session } = useSession();

    const [title, setTitle] = createSignal("");
    const [rating, setRating] = createSignal(0);
    const [content, setContent] = createSignal("");
    const [isSubmitting, setIsSubmitting] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);
    const [successMessage, setSuccessMessage] = createSignal<string | null>(null);

    // Validation errors
    const [titleError, setTitleError] = createSignal<string | null>(null);
    const [ratingError, setRatingError] = createSignal<string | null>(null);
    const [contentError, setContentError] = createSignal<string | null>(null);

    const validateForm = (): boolean => {
        let isValid = true;

        // Reset errors
        setTitleError(null);
        setRatingError(null);
        setContentError(null);
        setError(null);

        // Validate title
        if (!title().trim()) {
            setTitleError("Title is required");
            isValid = false;
        } else if (title().length > 200) {
            setTitleError("Title must be 200 characters or less");
            isValid = false;
        }

        // Validate rating
        if (rating() < 1 || rating() > 5) {
            setRatingError("Please select a rating between 1 and 5");
            isValid = false;
        }

        // Validate content
        if (!content().trim()) {
            setContentError("Review content is required");
            isValid = false;
        } else if (content().length > 1000) {
            setContentError("Review must be 1000 characters or less");
            isValid = false;
        }

        return isValid;
    };

    const resetForm = () => {
        setTitle("");
        setRating(0);
        setContent("");
        setError(null);
        setSuccessMessage(null);
        setTitleError(null);
        setRatingError(null);
        setContentError(null);
    };

    const handleClose = () => {
        resetForm();
        props.onClose();
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const currentSession = session();
        if (!currentSession) {
            setError("Please log in to submit a review.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const authToken = await currentSession.getToken();
            if (!authToken) {
                setError("Authentication failed. Please try logging in again.");
                setIsSubmitting(false);
                return;
            }

            const reviewData: NewReviewRequest = {
                product_id: props.productId,
                title: title().trim(),
                rating: rating(),
                content: content().trim(),
            };

            const response = await fetchWithTimeout(`${BACKEND_URL}/api/review`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                },
                body: JSON.stringify(reviewData),
            });

            const data: NewReviewResponse | APIErrorResponse = await parseJsonResponse(response);

            if (!response.ok || data.success === false) {
                const errorData = data as APIErrorResponse;
                setError(errorData.message || "Failed to submit review. Please try again.");
                setIsSubmitting(false);
                return;
            }

            // Success!
            setSuccessMessage("Your review has been added successfully!");

            // Create a new review object for the UI
            const newReview: Review = {
                id: Date.now(), // Temporary ID
                item_id: props.productId,
                user_id: 0, // We don't have user info readily available
                rating: rating(),
                title: title().trim(),
                content: content().trim(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            // Notify parent component
            props.onReviewAdded(newReview);

            // Close the modal after a brief delay to show success message
            setTimeout(() => {
                handleClose();
            }, 1500);

        } catch (err) {
            console.error("Error submitting review:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Show when={props.isOpen}>
            {/* Modal Backdrop */}
            <div
                class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={(e) => {
                    if (e.target === e.currentTarget) handleClose();
                }}
            >
                {/* Modal Content */}
                <div class="bg-base-100 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div class="flex items-center justify-between p-6 border-b border-base-200">
                        <h2 class="text-xl font-bold">Write a Review</h2>
                        <button
                            class="btn btn-ghost btn-sm btn-circle"
                            onClick={handleClose}
                            disabled={isSubmitting()}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} class="p-6 space-y-5">
                        {/* Success Message */}
                        <Show when={successMessage()}>
                            <div class="alert alert-success">
                                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{successMessage()}</span>
                            </div>
                        </Show>

                        {/* Error Message */}
                        <Show when={error()}>
                            <div class="alert alert-error">
                                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error()}</span>
                            </div>
                        </Show>

                        {/* Rating */}
                        <div class="form-control">
                            <label class="label">
                                <span class="label-text font-semibold">Your Rating *</span>
                            </label>
                            <div class="flex items-center gap-1">
                                <For each={[1, 2, 3, 4, 5]}>
                                    {(star) => (
                                        <button
                                            type="button"
                                            class={`btn btn-ghost btn-sm p-1 ${rating() >= star ? 'text-warning' : 'text-base-300'}`}
                                            onClick={() => setRating(star)}
                                            disabled={isSubmitting()}
                                        >
                                            <Star
                                                size={28}
                                                fill={rating() >= star ? "currentColor" : "none"}
                                                class="transition-colors"
                                            />
                                        </button>
                                    )}
                                </For>
                                <span class="ml-2 text-sm text-base-content/60">
                                    {rating() > 0 ? `${rating()} star${rating() > 1 ? 's' : ''}` : 'Select rating'}
                                </span>
                            </div>
                            <Show when={ratingError()}>
                                <label class="label">
                                    <span class="label-text-alt text-error">{ratingError()}</span>
                                </label>
                            </Show>
                        </div>

                        {/* Title */}
                        <div class="form-control">
                            <label class="label">
                                <span class="label-text font-semibold">Review Title *</span>
                                <span class="label-text-alt text-base-content/50">{title().length}/200</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Summarize your experience"
                                class={`input input-bordered w-full ${titleError() ? 'input-error' : ''}`}
                                value={title()}
                                onInput={(e) => setTitle(e.currentTarget.value)}
                                maxLength={200}
                                disabled={isSubmitting()}
                            />
                            <Show when={titleError()}>
                                <label class="label">
                                    <span class="label-text-alt text-error">{titleError()}</span>
                                </label>
                            </Show>
                        </div>

                        {/* Content */}
                        <div class="form-control">
                            <label class="label">
                                <span class="label-text font-semibold">Your Review *</span>
                                <span class="label-text-alt text-base-content/50">{content().length}/1000</span>
                            </label>
                            <textarea
                                placeholder="Tell others about your experience with this product..."
                                class={`textarea textarea-bordered w-full h-32 resize-none ${contentError() ? 'textarea-error' : ''}`}
                                value={content()}
                                onInput={(e) => setContent(e.currentTarget.value)}
                                maxLength={1000}
                                disabled={isSubmitting()}
                            />
                            <Show when={contentError()}>
                                <label class="label">
                                    <span class="label-text-alt text-error">{contentError()}</span>
                                </label>
                            </Show>
                        </div>

                        {/* Actions */}
                        <div class="flex gap-3 pt-4 border-t border-base-200">
                            <button
                                type="button"
                                class="btn btn-ghost flex-1"
                                onClick={handleClose}
                                disabled={isSubmitting()}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                class="btn btn-primary flex-1"
                                disabled={isSubmitting()}
                            >
                                {isSubmitting() ? (
                                    <>
                                        <span class="loading loading-spinner loading-sm"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Review'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Show>
    );
}
