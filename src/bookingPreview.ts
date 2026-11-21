import { z } from "zod";

export const bookingSteps = [
	"traveller-details",
	"review-request",
	"payment",
	"request-received",
	"confirmation-progress",
	"change-approval",
	"confirmed-trip",
	"change-trip",
	"cancel-trip",
	"today",
	"trip-update",
	"trip-help",
] as const;
export type BookingStep = (typeof bookingSteps)[number];

const optionalText = z.string().trim().max(600);
export const travellerSchema = z.object({
	name: z.string().trim().min(1, "Enter a sample full name.").max(120),
	dialCode: z
		.string()
		.trim()
		.regex(/^\+\d{1,4}$/, "Enter a country code, such as +230."),
	phone: z
		.string()
		.trim()
		.regex(/^[0-9 ()+-]{6,24}$/, "Enter a sample phone number.")
		.refine(
			(value) => /^\d{6,15}$/.test(value.replace(/\D/g, "")),
			"Enter a sample phone number with 6 to 15 digits.",
		),
	pickup: z
		.string()
		.trim()
		.min(1, "Enter a sample pickup address or hotel.")
		.max(160),
	meeting: optionalText,
	needs: optionalText,
	otherNames: optionalText,
	emergencyName: optionalText,
	emergencyPhone: optionalText,
});

const planSchema = z.object({
	title: z.string(),
	dayKey: z.string(),
	date: z.string(),
	travellers: z.string(),
	guestCount: z.number().int().positive(),
	start: z.string(),
	activities: z.array(
		z.object({
			id: z.string(),
			title: z.string(),
			time: z.string(),
			minute: z.number(),
			duration: z.number(),
			cost: z.number(),
			activity: z.string(),
		}),
	),
	transport: z.number(),
	coordination: z.number(),
});
export type BookingPlan = z.infer<typeof planSchema>;
export type TravellerDetails = z.infer<typeof travellerSchema>;

const previewSchema = z.object({
	plan: planSchema,
	traveller: travellerSchema.optional(),
	reviewed: z.boolean(),
	authorised: z.boolean(),
	decision: z.enum(["pending", "approved", "declined"]),
});
export type BookingPreview = z.infer<typeof previewSchema>;

function key(email: string) {
	return `journey-forge:booking-preview:${email}`;
}

export function readBookingPreview(email: string): BookingPreview | undefined {
	try {
		const result = previewSchema.safeParse(
			JSON.parse(sessionStorage.getItem(key(email)) ?? "null"),
		);
		return result.success ? result.data : undefined;
	} catch {
		return undefined;
	}
}

export function writeBookingPreview(email: string, preview: BookingPreview) {
	try {
		sessionStorage.setItem(key(email), JSON.stringify(preview));
		return true;
	} catch {
		return false;
	}
}

export function startBookingPreview(email: string, plan: BookingPlan) {
	const result = planSchema.safeParse(plan);
	if (!result.success) return false;
	const previous = readBookingPreview(email);
	if (previous && JSON.stringify(previous.plan) === JSON.stringify(result.data))
		return true;
	return writeBookingPreview(email, {
		plan: result.data,
		traveller:
			previous?.plan.dayKey === plan.dayKey ? previous.traveller : undefined,
		reviewed: false,
		authorised: false,
		decision: "pending",
	});
}

export function bookingAmounts(plan: BookingPlan) {
	const activities = plan.activities.reduce(
		(total, item) => total + item.cost,
		0,
	);
	return { activities, total: activities + plan.transport + plan.coordination };
}

export function bookingChange(plan: BookingPlan) {
	const sunset = plan.activities.find((item) => item.activity === "sunset");
	if (!sunset) return undefined;
	const later = sunset.minute + 30;
	const rest = plan.activities.filter((item) => item.id !== sunset.id);
	if (
		rest.some(
			(item) =>
				later < item.minute + item.duration + 15 &&
				later + sunset.duration + 15 > item.minute,
		)
	)
		return undefined;
	const oldEnd = Math.max(
		sunset.minute + sunset.duration,
		...rest.map((item) => item.minute + item.duration),
	);
	const newEnd = Math.max(
		later + sunset.duration,
		...rest.map((item) => item.minute + item.duration),
	);
	const returnTravel = plan.transport ? 45 : 0;
	if (newEnd + returnTravel >= 1440) return undefined;
	return {
		sunset,
		increase: 200 * plan.guestCount,
		later,
		oldReturn: oldEnd + returnTravel,
		newReturn: newEnd + returnTravel,
	};
}
