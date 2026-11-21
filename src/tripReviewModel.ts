import { z } from "zod";

export const reviewSteps = [
	"invitation",
	"write",
	"partner",
	"submit",
	"thank-you",
] as const;
export type ReviewStep = (typeof reviewSteps)[number];

const reviewDraftSchema = z.object({
	rating: z.number().int().min(0).max(5),
	partnerRating: z.number().int().min(0).max(5),
	highlights: z.string().max(1200),
	improvements: z.string().max(1200),
	sharePublicly: z.boolean(),
	submitted: z.boolean(),
});
export type ReviewDraft = z.infer<typeof reviewDraftSchema>;

const blankReview: ReviewDraft = {
	rating: 0,
	partnerRating: 0,
	highlights: "",
	improvements: "",
	sharePublicly: false,
	submitted: false,
};

function key(email: string) {
	return `journey-forge:sample-review:${email}:JF-0914`;
}

export function readReviewDraft(email: string): ReviewDraft {
	try {
		const result = reviewDraftSchema.safeParse(
			JSON.parse(sessionStorage.getItem(key(email)) ?? "null"),
		);
		if (result.success) return result.data;
	} catch {
		// Start with an empty draft when tab storage is unavailable.
	}
	return blankReview;
}

export function saveReviewDraft(email: string, draft: ReviewDraft) {
	if (
		!reviewDraftSchema.safeParse(draft).success ||
		(draft.submitted && !draft.rating)
	)
		return false;
	try {
		sessionStorage.setItem(key(email), JSON.stringify(draft));
		return true;
	} catch {
		return false;
	}
}
