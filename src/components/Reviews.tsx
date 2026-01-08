import { For, Show } from "solid-js";

export interface Review {
    id: number;
    user: string;
    rating: number;
    comment: string;
    date: string;
}

interface ReviewSectionProps {
    reviews: Review[] | undefined;
    loading: boolean;
}

export default function ReviewSection(props: ReviewSectionProps) {
    return (
        <div id="section-reviews" class="pt-8 lg:pt-10 border-t border-base-200 w-full">
            <h2 class="text-xl lg:text-2xl font-bold mb-6 lg:mb-8">Customer Reviews</h2>

            <div class="flex flex-col lg:flex-row gap-6 lg:gap-12">

                <div class="w-full lg:w-80 shrink-0">
                    <div class="card bg-base-100 border border-base-200 shadow-sm lg:sticky lg:top-24">
                        <div class="card-body p-4 lg:p-6">

                            {/* Average Rating Block */}
                            <div class="flex flex-col items-center lg:items-start gap-2 mb-6">
                                <span class="text-4xl font-extrabold text-base-content">4.0</span>
                                <div class="rating rating-md">
                                    {/* Using read-only styling instead of disabled inputs for better visibility */}
                                    <For each={Array(5).fill(0)}>
                                        {(_, i) => (
                                            <div class={`mask mask-star-2 w-5 h-5 ${i < 4 ? 'bg-orange-400' : 'bg-base-300'}`}></div>
                                        )}
                                    </For>
                                </div>
                                <p class="text-sm text-base-content/60">Based on 1,234 reviews</p>
                            </div>

                            {/* Histogram Bars */}
                            <div class="space-y-3">
                                {[
                                    { label: "5 star", pct: 70 },
                                    { label: "4 star", pct: 20 },
                                    { label: "3 star", pct: 5 },
                                    { label: "2 star", pct: 2 },
                                    { label: "1 star", pct: 3 }
                                ].map((row) => (
                                    <div class="grid grid-cols-[50px_1fr_40px] items-center gap-2 text-sm">
                                        <span class="text-base-content/70 whitespace-nowrap">{row.label}</span>
                                        <progress class="progress progress-warning w-full" value={row.pct} max="100"></progress>
                                        <span class="text-right text-base-content/60">{row.pct}%</span>
                                    </div>
                                ))}
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
                                                            <span class="text-lg font-bold">{review.user.charAt(0)}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 class="font-bold text-base">{review.user}</h4>
                                                        <span class="text-xs text-base-content/50 block">Verified Purchase</span>
                                                    </div>
                                                </div>
                                                <span class="text-xs text-base-content/50">{review.date}</span>
                                            </div>

                                            {/* Star Rating Display */}
                                            <div class="flex items-center gap-2 mb-3">
                                                <div class="rating rating-sm">
                                                    {/* Use unique names per review to prevent radio conflict */}
                                                    <For each={Array(5).fill(0)}>
                                                        {(_, i) => (
                                                            <input
                                                                type="radio"
                                                                name={`rating-${review.id}`}
                                                                class="mask mask-star-2 bg-warning cursor-default"
                                                                disabled
                                                                checked={i() < review.rating}
                                                                style={{ "opacity": "1" }}
                                                            />
                                                        )}
                                                    </For>
                                                </div>
                                                <span class="text-sm font-semibold">{review.rating}.0</span>
                                            </div>

                                            <p class="text-base text-base-content/80 leading-relaxed">
                                                {review.comment}
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
