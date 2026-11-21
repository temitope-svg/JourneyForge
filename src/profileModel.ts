import { z } from "zod";

export const profileTabs = [
	"personal",
	"travel",
	"notifications",
	"language",
	"privacy",
] as const;
export type ProfileTab = (typeof profileTabs)[number];
export const interests = [
	"Food",
	"Beaches",
	"Nature",
	"Adventure",
	"Culture",
	"Wellness",
	"Romance",
	"Family time",
	"Nightlife",
	"Luxury",
] as const;
export const travelStyles = [
	"Solo",
	"With my partner",
	"With family",
	"With friends",
] as const;
export const languages = [
	"English",
	"French",
	"Portuguese",
	"Japanese",
	"Spanish",
	"Other",
] as const;
export const currencies = ["MUR", "USD", "EUR", "GBP", "ZAR", "NGN"] as const;

const profileSchema = z.object({
	name: z.string().trim().min(1).max(120),
	email: z.email().max(254),
	phone: z.string().trim().max(40),
	interests: z.array(z.enum(interests)),
	travelStyle: z.union([z.literal(""), z.enum(travelStyles)]),
	diet: z.string().max(1200),
	accessibility: z.string().max(1200),
	marketing: z.boolean(),
	language: z.enum(languages),
	currency: z.enum(currencies),
});

export type DemoProfile = z.infer<typeof profileSchema>;

function profileKey(email: string) {
	return `journey-forge:profile:${email}`;
}

export function readDemoProfile(email: string): DemoProfile {
	try {
		const result = profileSchema.safeParse(
			JSON.parse(localStorage.getItem(profileKey(email)) ?? "null"),
		);
		if (result.success) return result.data;
	} catch {
		// Default display values keep the preview usable without browser storage.
	}
	const first = email.split("@")[0].split(/[._+-]/)[0];
	return {
		name: first ? first[0].toUpperCase() + first.slice(1) : "Traveler",
		email,
		phone: "",
		interests: [],
		travelStyle: "",
		diet: "",
		accessibility: "",
		marketing: false,
		language: "English",
		currency: "MUR",
	};
}

export function saveDemoProfile(email: string, profile: DemoProfile) {
	const result = profileSchema.safeParse(profile);
	if (!result.success) return false;
	try {
		localStorage.setItem(profileKey(email), JSON.stringify(result.data));
		return true;
	} catch {
		return false;
	}
}
