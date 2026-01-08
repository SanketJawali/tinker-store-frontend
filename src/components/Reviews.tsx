import { For, Show, createMemo } from "solid-js";
import { PenLine } from "lucide-solid";
import { Review } from "../types";

interface ReviewSectionProps {
    reviews: Review[] | undefined;
    loading: boolean;
    onWriteReviewClick?: () => void;
}

export default function ReviewSection(props: ReviewSectionProps) {
    // Calculate rating distribution and average
    const ratingStats = createMemo(() => {
        const reviews = props.reviews || [];
        
        if (reviews.length === 0) {
            return {
                average: 0,
                count: 0,
                distribution: [
                    { label: "5 star", count: 0, pct: 0 },
                    { label: "4 star", count: 0, pct: 0 },
                    { label: "3 star", count: 0, pct: 0 },
                    { label: "2 star", count: 0, pct: 0 },
                    { label: "1 star", count: 0, pct: 0 }
                ]
            };
        }

        // Count reviews by rating (ignore invalid ratings)
        const counts = [0, 0, 0, 0, 0]; // indices 0-4 for ratings 1-5
        let totalRating = 0;
        let validCount = 0;

        reviews.forEach((review) => {
            const rating = Number(review.rating);
            if (!Number.isFinite(rating) || rating < 1 || rating > 5) return;

            const ratingIndex = rating - 1;
            counts[ratingIndex]++;
            totalRating += rating;
            validCount++;
        });

        if (validCount === 0) {
            return {
                average: 0,
                count: reviews.length,
                distribution: [
                    { label: "5 star", count: 0, pct: 0 },
                    { label: "4 star", count: 0, pct: 0 },
                    { label: "3 star", count: 0, pct: 0 },
                    { label: "2 star", count: 0, pct: 0 },
                    { label: "1 star", count: 0, pct: 0 }
                ]
            };
        }

        const average = totalRating / validCount;
        
        // Calculate percentages
        const distribution = [
            { label: "5 star", count: counts[4], pct: Math.round((counts[4] / validCount) * 100) },
            { label: "4 star", count: counts[3], pct: Math.round((counts[3] / validCount) * 100) },
            { label: "3 star", count: counts[2], pct: Math.round((counts[2] / validCount) * 100) },
            { label: "2 star", count: counts[1], pct: Math.round((counts[1] / validCount) * 100) },
            { label: "1 star", count: counts[0], pct: Math.round((counts[0] / validCount) * 100) }
        ];

        return {
            average: parseFloat(average.toFixed(1)),
            count: reviews.length,
            distribution
        };
    });

    return (
        <div id="section-reviews" class="pt-8 lg:pt-10 border-t border-base-200 w-full">
            <div class="flex items-center justify-between mb-6 lg:mb-8">
                <h2 class="text-xl lg:text-2xl font-bold">Customer Reviews</h2>
                <Show when={props.onWriteReviewClick}>
                    <button
                        class="btn btn-primary btn-sm lg:btn-md gap-2"
                        onClick={props.onWriteReviewClick}
                    >
                        <PenLine size={16} />
                        Write a Review
                    </button>
                </Show>
            </div>

            <div class="flex flex-col lg:flex-row gap-6 lg:gap-12">

                <div class="w-full lg:w-80 shrink-0">
                    <div class="card bg-base-100 border border-base-200 shadow-sm lg:sticky lg:top-24">
                        <div class="card-body p-4 lg:p-6">

                            {/* Average Rating Block */}
                            <div class="flex flex-col items-center lg:items-start gap-2 mb-6">
                                <span class="text-4xl font-extrabold text-base-content">{ratingStats().average.toFixed(1)}</span>
                                <div class="rating rating-md pointer-events-none">
                                    {(() => {
                                        const avgRounded = Math.max(0, Math.min(5, Math.round(ratingStats().average)));
                                        const groupName = "rating-avg";
                                        return (
                                            <>
                                                <input
                                                    type="radio"
                                                    name={groupName}
                                                    class="rating-hidden"
                                                    checked={avgRounded === 0}
                                                    disabled
                                                    tabIndex={-1}
                                                />
                                                <input
                                                    type="radio"
                                                    name={groupName}
                                                    class="mask mask-star-2 bg-warning"
                                                    checked={avgRounded === 1}
                                                    disabled
                                                    tabIndex={-1}
                                                />
                                                <input
                                                    type="radio"
                                                    name={groupName}
                                                    class="mask mask-star-2 bg-warning"
                                                    checked={avgRounded === 2}
                                                    disabled
                                                    tabIndex={-1}
                                                />
                                                <input
                                                    type="radio"
                                                    name={groupName}
                                                    class="mask mask-star-2 bg-warning"
                                                    checked={avgRounded === 3}
                                                    disabled
                                                    tabIndex={-1}
                                                />
                                                <input
                                                    type="radio"
                                                    name={groupName}
                                                    class="mask mask-star-2 bg-warning"
                                                    checked={avgRounded === 4}
                                                    disabled
                                                    tabIndex={-1}
                                                />
                                                <input
                                                    type="radio"
                                                    name={groupName}
                                                    class="mask mask-star-2 bg-warning"
                                                    checked={avgRounded === 5}
                                                    disabled
                                                    tabIndex={-1}
                                                />
                                            </>
                                        );
                                    })()}
                                </div>
                                <p class="text-sm text-base-content/60">Based on {ratingStats().count} reviews</p>
                            </div>

                            {/* Histogram Bars */}
                            <div class="space-y-3">
                                <For each={ratingStats().distribution}>
                                    {(row) => (
                                        <div class="grid grid-cols-[50px_1fr_40px] items-center gap-2 text-sm">
                                            <span class="text-base-content/70 whitespace-nowrap">{row.label}</span>
                                            <progress class="progress progress-warning w-full" value={row.pct} max="100"></progress>
                                            <span class="text-right text-base-content/60">{row.pct}%</span>
                                        </div>
                                    )}
                                </For>
                            </div>

                        </div>
                    </div>
                </div>

                {/* --- RIGHT: Review List (Main Content) --- */}
                <div class="flex-1 flex flex-col gap-4">
                    <Show when={!props.loading} fallback={<div class="skeleton h-32 w-full"></div>}>
                        <Show
                            when={props.reviews && props.reviews.length > 0}
                            fallback={
                                <div class="p-8 text-center border rounded-xl border-dashed">
                                    No reviews yet. Be the first to review!
                                </div>
                            }
                        >
                            <For each={props.reviews}>
                                {(review) => (
                                    <div class="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow">
                                        <div class="card-body p-6">

                                            {/* User Header */}
                                            <div class="flex items-center justify-between mb-3">
                                                <div class="flex items-center gap-3">
                                                    <div class="avatar placeholder">
                                                        <div class="bg-neutral text-neutral-content rounded-full w-10">
                                                            <span class="text-lg font-bold">U</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 class="font-bold text-base">User #{review.user_id}</h4>
                                                        <span class="text-xs text-base-content/50 block">Verified Purchase</span>
                                                    </div>
                                                </div>
                                                <span class="text-xs text-base-content/50">{new Date(review.created_at).toLocaleDateString()}</span>
                                            </div>

                                            {/* Review Title */}
                                            <h5 class="font-semibold text-base text-base-content mb-2">{review.title}</h5>

                                            {/* Star Rating Display */}
                                            <div class="flex items-center gap-2 mb-3">
                                                <div class="rating rating-sm pointer-events-none">
                                                    <For each={Array(5).fill(0)}>
                                                        {(_, i) => {
                                                            const rating = Math.max(0, Math.min(5, Number(review.rating) || 0));
                                                            const selectedIndex = rating > 0 ? rating - 1 : -1;
                                                            return (
                                                                <input
                                                                    type="radio"
                                                                    name={`rating-${review.id}`}
                                                                    class="mask mask-star-2 bg-warning"
                                                                    checked={selectedIndex >= 0 && i() === selectedIndex}
                                                                    tabindex={-1}
                                                                />
                                                            );
                                                        }}
                                                    </For>
                                                </div>
                                                <span class="text-sm font-semibold">{review.rating}.0</span>
                                            </div>

                                            <p class="text-base text-base-content/80 leading-relaxed">
                                                {review.content}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </For>
                        </Show>
                    </Show>
                </div>

            </div>
        </div>
    );
}
