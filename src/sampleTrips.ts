import type { BookingPreview } from "./bookingPreview";

export const paymentSamples = [
	{
		id: "payment-approved",
		response: "approved",
		title: "A slow day on the west coast",
		image: "/dashboard/west-coast.webp",
		status: "Payment authorised",
	},
	{
		id: "payment-failed",
		response: "declined",
		title: "A taste of the island",
		image: "/dashboard/market.webp",
		status: "Payment failed",
	},
	{
		id: "payment-verification",
		response: "verification",
		title: "A sunset for two",
		image: "/dashboard/sunset.webp",
		status: "Verification required",
	},
	{
		id: "payment-price-changed",
		response: "price-changed",
		title: "A little closer to nature",
		image: "/dashboard/waterfall.webp",
		status: "Price changed",
	},
] as const;

export type SampleRequest =
	| "sunset"
	| "market"
	| "checkout"
	| (typeof paymentSamples)[number]["id"];

export function findPaymentSample(request: unknown) {
	return paymentSamples.find(({ id }) => id === request);
}

export function sampleBookingAccount(email: string, request: SampleRequest) {
	return `${email}:sample:${request}`;
}

export function sampleBooking(request: SampleRequest): BookingPreview {
	const paymentSample = findPaymentSample(request);
	const checkout = request === "checkout" || Boolean(paymentSample);
	const sunset = request !== "market" && request !== "payment-failed";
	return {
		plan: {
			title:
				paymentSample?.title ??
				(request === "checkout"
					? "A slow day on the west coast."
					: sunset
						? "A sunset for two"
						: "A taste of the island"),
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
		traveller: checkout
			? {
					name: "Demo Traveller",
					dialCode: "+230",
					phone: "5550 1000",
					pickup: "Sample Hotel, Flic en Flac",
					meeting: "Main entrance",
					needs: "",
					otherNames: "",
					emergencyName: "",
					emergencyPhone: "",
				}
			: undefined,
		reviewed: true,
		authorised: !checkout,
		decision: "pending",
	};
}
