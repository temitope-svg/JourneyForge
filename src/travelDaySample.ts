import type { IconName } from "./DashboardIcon";

export const travelStops: {
	time: number;
	end: number;
	title: string;
	copy: string;
	meeting: string;
	icon: IconName;
}[] = [
	{
		time: 530,
		end: 540,
		title: "Hotel pickup",
		copy: "Meet your driver at the main hotel entrance.",
		meeting: "Main hotel entrance, Flic en Flac",
		icon: "car",
	},
	{
		time: 540,
		end: 585,
		title: "Coastal breakfast",
		copy: "A table for two by the water.",
		meeting: "Sample café, Flic en Flac",
		icon: "sun",
	},
	{
		time: 600,
		end: 720,
		title: "Time by the lagoon",
		copy: "Swim, wander, or simply take it in.",
		meeting: "Beach entrance, Le Morne",
		icon: "waves",
	},
	{
		time: 750,
		end: 840,
		title: "Lunch with a view",
		copy: "Local flavours, no rushing.",
		meeting: "Sample restaurant, Le Morne",
		icon: "sun",
	},
	{
		time: 990,
		end: 1110,
		title: "Sunset sailing",
		copy: "Your approved later departure.",
		meeting: "Sample boat meeting point, west coast",
		icon: "waves",
	},
	{
		time: 1155,
		end: 1160,
		title: "Back at your hotel",
		copy: "Relax after a day on the water.",
		meeting: "Main hotel entrance, Flic en Flac",
		icon: "car",
	},
];

export const tripUpdates = [
	{
		id: "delay",
		time: "08:15",
		label: "Pickup delayed",
		summary: "20 minutes later",
		heading: "Your pickup is 20 minutes later",
		happened: "Your transport partner has reported a delay.",
		action: "Please be at the hotel entrance at 08:50.",
		before: "08:30",
		after: "08:50",
		item: "Pickup",
	},
	{
		id: "pickup",
		time: "07:50",
		label: "Pickup details ready",
		summary: "Hotel entrance, Flic en Flac",
		heading: "Your pickup details are ready",
		happened: "Your meeting point is the main hotel entrance in this sample.",
		action: "Check the latest pickup time before leaving.",
		before: "To be confirmed",
		after: "Hotel entrance",
		item: "Meeting point",
	},
	{
		id: "sailing",
		time: "Yesterday",
		label: "Sailing time confirmed",
		summary: "16:30 departure",
		heading: "Your sailing time is confirmed",
		happened: "A later sailing was approved in this sample.",
		action: "Check the sample itinerary for your 16:30 departure.",
		before: "16:00",
		after: "16:30",
		item: "Sailing",
	},
] as const;

export function readTabValue<T>(
	key: string,
	isValid: (value: unknown) => value is T,
): T | undefined {
	try {
		const value: unknown = JSON.parse(sessionStorage.getItem(key) ?? "null");
		if (isValid(value)) return value;
	} catch {
		// The preview remains usable without storage.
	}
}

export function writeTabValue(key: string, value: unknown) {
	try {
		sessionStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch {
		return false;
	}
}

export function updateReadIds(email: string) {
	return (
		readTabValue(
			updateKey(email),
			(value): value is string[] =>
				Array.isArray(value) && value.every((item) => typeof item === "string"),
		) ?? []
	);
}

export function updateKey(email: string) {
	return `journey-forge:travel-updates:${email}:JF-1023`;
}
