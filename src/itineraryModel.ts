import { z } from "zod";
import { flexibleDay, type TripDetails, tripDayLabel } from "./tripDraft.ts";

export const activityNames = [
	"breakfast",
	"slow-breakfast",
	"lagoon",
	"forest-trail",
	"lunch",
	"sunset",
	"waterfall",
	"market",
] as const;
export const itineraryEditsSchema = z.record(
	z.string(),
	z.array(
		z.object({
			id: z.string(),
			activity: z.enum(activityNames),
			mustDo: z.boolean(),
			startMinute: z.number().int().min(0).optional(),
		}),
	),
);

export type ItineraryEdits = z.infer<typeof itineraryEditsSchema>;
export type DayActivity = ItineraryEdits[string][number];
export const activities: Record<
	DayActivity["activity"],
	{ title: string; duration: number; price: number; image: string }
> = {
	breakfast: {
		title: "Start with something good",
		duration: 45,
		price: 400,
		image: "/dashboard/itinerary-breakfast.webp",
	},
	"slow-breakfast": {
		title: "Take your time over breakfast",
		duration: 75,
		price: 600,
		image: "/dashboard/itinerary-breakfast.webp",
	},
	"forest-trail": {
		title: "Follow the greener path",
		duration: 180,
		price: 900,
		image: "/dashboard/itinerary-trail.webp",
	},
	lagoon: {
		title: "A little time by the lagoon",
		duration: 120,
		price: 0,
		image: "/home/family.webp",
	},
	lunch: {
		title: "A table with a view",
		duration: 90,
		price: 1200,
		image: "/dashboard/itinerary-lunch.webp",
	},
	sunset: {
		title: "Stay for the sunset",
		duration: 120,
		price: 1800,
		image: "/dashboard/sunset.webp",
	},
	waterfall: {
		title: "Take the scenic route",
		duration: 240,
		price: 1600,
		image: "/dashboard/waterfall.webp",
	},
	market: {
		title: "A taste of the island",
		duration: 180,
		price: 1200,
		image: "/dashboard/market.webp",
	},
};

export const currency = new Intl.NumberFormat("en", {
	maximumFractionDigits: 0,
});
export const sampleIdea =
	"A relaxed day on the west coast, with a good lunch and time by the sea.";

export function itineraryDays(details: TripDetails) {
	const setup = details.setup;
	if (
		!setup ||
		setup.arrival !== details.date ||
		setup.flexible !== details.flexible ||
		(!setup.selected.length && !setup.freeDays.length)
	) {
		const key = details.flexible || !details.date ? flexibleDay : details.date;
		return [
			{ key, label: tripDayLabel(key), start: details.start, free: false },
		];
	}
	return [...new Set([...setup.selected, ...setup.freeDays])]
		.sort()
		.map((key) => ({
			key,
			label: tripDayLabel(key),
			start: setup.sameStart
				? setup.sharedStart
				: (setup.starts[key] ?? details.start),
			free: setup.freeDays.includes(key),
		}));
}

export function sampleActivities(idea: string): DayActivity[] {
	const text = idea.toLowerCase();
	const main =
		text.includes("waterfall") || text.includes("chamarel")
			? "waterfall"
			: text.includes("market") || text.includes("port louis")
				? "market"
				: "lagoon";
	return (["breakfast", main, "lunch", "sunset"] as const).map((activity) => ({
		id: activity,
		activity,
		mustDo: false,
	}));
}
