import { z } from "zod";

export const tripSetupSteps = [
	"dates",
	"starting-points",
	"free-days",
] as const;
export type TripSetupStep = (typeof tripSetupSteps)[number];

export const flexibleDay = "flexible";
const formatDay = new Intl.DateTimeFormat("en-GB", {
	day: "numeric",
	month: "long",
	timeZone: "UTC",
});

export function tripDayLabel(day: string) {
	return day === flexibleDay
		? "Sample day"
		: formatDay.format(new Date(`${day}T00:00:00Z`));
}

export const tripSetupSchema = z.object({
	arrival: z.string(),
	departure: z.string(),
	flexible: z.boolean(),
	selection: z.enum(["all", "custom"]),
	selected: z.array(z.string()),
	sameStart: z.boolean(),
	sharedStart: z.string(),
	starts: z.record(z.string(), z.string()),
	freeDays: z.array(z.string()),
});
export type TripSetupDetails = z.infer<typeof tripSetupSchema>;

export const tripDetailsSchema = z.object({
	date: z.string(),
	flexible: z.boolean(),
	adults: z.number().int().min(1),
	children: z.number().int().min(0),
	budget: z.string(),
	transport: z.enum(["yes", "no", "unsure"]),
	start: z.string(),
	food: z.string(),
	interests: z.string(),
	accessibility: z.string(),
	setup: tripSetupSchema.optional(),
});
export type TripDetails = z.infer<typeof tripDetailsSchema>;

export const defaultTripDetails: TripDetails = {
	date: "",
	flexible: false,
	adults: 2,
	children: 0,
	budget: "",
	transport: "unsure",
	start: "",
	food: "",
	interests: "",
	accessibility: "",
};
