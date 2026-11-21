import type { BookingPreview } from "./bookingPreview";

export type SampleRequest = "sunset" | "market";

export function sampleBookingAccount(email: string, request: SampleRequest) {
	return `${email}:sample:${request}`;
}

export function sampleBooking(request: SampleRequest): BookingPreview {
	const sunset = request === "sunset";
	return {
		plan: {
			title: sunset ? "A sunset for two" : "A taste of the island",
			dayKey: sunset ? "2026-10-25" : "2026-10-28",
			date: sunset ? "25 October 2026" : "28 October 2026",
			travellers: "2 adults",
			guestCount: 2,
			start: sunset ? "Flic en Flac" : "Port Louis",
			activities: [
				{
					id: "breakfast",
					activity: "breakfast",
					title: "Start with something good",
					time: "09:00",
					minute: 540,
					duration: 45,
					cost: 800,
				},
				{
					id: "lunch",
					activity: "lunch",
					title: "A table with a view",
					time: "12:30",
					minute: 750,
					duration: 90,
					cost: 2400,
				},
				sunset
					? {
							id: "sunset",
							activity: "sunset",
							title: "Sunset sailing",
							time: "16:00",
							minute: 960,
							duration: 120,
							cost: 3600,
						}
					: {
							id: "market",
							activity: "market",
							title: "A taste of the island",
							time: "14:30",
							minute: 870,
							duration: 180,
							cost: 2400,
						},
			],
			transport: 2400,
			coordination: 800,
		},
		reviewed: true,
		authorised: true,
		decision: "pending",
	};
}
