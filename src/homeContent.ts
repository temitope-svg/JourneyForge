export const destinations = [
	{
		name: "Mauritius",
		region: "Indian Ocean",
		description: "Salt in the air. Nothing on the clock.",
		image: "mauritius",
		prompt: "A slow day in Mauritius by the water, with time for a long lunch.",
	},
	{
		name: "Portugal",
		region: "Southern Europe",
		description: "Take the long way to lunch.",
		image: "portugal",
		prompt:
			"A day in Portugal with neighbourhood walks, local food and a great view.",
	},
	{
		name: "Japan",
		region: "East Asia",
		description: "A little wonder around every corner.",
		image: "japan",
		prompt:
			"A quiet day in Japan exploring garden paths, old lanes and a place for tea.",
	},
];

export const moods = [
	{
		label: "Romantic escapes",
		title: "Just the two of you.",
		description: "A good view. A long lunch. No rush.",
		image: "romance",
		alt: "Two travellers watching the sunset from a sailboat",
		prompt:
			"A day for two with a beautiful view, a long lunch and a sunset by the water.",
	},
	{
		label: "Family days",
		title: "Big little adventures.",
		description: "Space to explore, and time to stop.",
		image: "family",
		alt: "A family walking along a beach",
		prompt:
			"A family day with an easy activity, room to explore and time for breaks.",
	},
	{
		label: "Outdoor adventures",
		title: "Follow your curiosity.",
		description: "Fresh air and a different point of view.",
		image: "outdoors",
		alt: "Hikers on a trail through an alpine valley",
		prompt:
			"An outdoor adventure with a scenic trail and a new view to discover.",
	},
];

export const steps = [
	[
		"Tell us your idea.",
		"The mood, the people, the dates. A sentence is a good place to start.",
	],
	[
		"Make the plan yours.",
		"Review the proposed day, the timing and the estimated cost. Adjust what doesn’t fit.",
	],
	[
		"We confirm the details.",
		"After you request a plan, a human coordinator checks partners and final prices. Changes need your approval.",
	],
	[
		"Go enjoy your day.",
		"Follow the confirmed itinerary, with a clear route to human support when you need it.",
	],
];

export const itinerary = [
	[
		"09:30",
		"Start with something good",
		"Coffee and a slow breakfast in the neighbourhood.",
	],
	[
		"10:30",
		"Let the streets lead",
		"A guided-walk idea with time for your own detours.",
	],
	[
		"12:30",
		"A table for two",
		"An unhurried lunch built around your food preferences.",
	],
	[
		"14:30",
		"Leave some room",
		"Free time, a rest and a flexible transfer window.",
	],
	[
		"16:00",
		"Take the afternoon outside",
		"A riverside stroll, then choose when to call it a day.",
	],
];

export const experiences = [
	{
		id: "lisbon",
		title: "Wander. Taste. Repeat.",
		location: "Lisbon-inspired / Portugal",
		description: "Neighbourhood stories, coffee and a long lunch.",
		image: "lisbon",
		alt: "A cobbled street overlooking the water in Lisbon",
		duration: "About 3 hours",
		price: "EUR 55",
	},
	{
		id: "sunset",
		title: "Stay for the sunset",
		location: "West coast / Mauritius",
		description: "A slow sail and a sky worth waiting for.",
		image: "romance",
		alt: "A sailboat on the water at sunset",
		duration: "About 2 hours",
		price: "USD 65",
	},
	{
		id: "kyoto",
		title: "A quieter kind of discovery",
		location: "Kyoto-inspired / Japan",
		description: "Garden paths, old lanes and time for tea.",
		image: "kyoto",
		alt: "A tree-lined lane with traditional buildings in Kyoto",
		duration: "About 2 hours",
		price: "USD 50",
	},
];

export const questions = [
	[
		"Is my generated plan already booked?",
		"A generated plan is a draft. A coordinator checks availability and final prices after you submit a booking request. You’ll see what’s confirmed before you commit.",
	],
	[
		"Can the price change?",
		"Estimates can change with dates, availability and the activities you choose. Your coordinator will share the final price for approval.",
	],
	[
		"What does human coordination mean?",
		"A person checks details with local partners and helps you work through changes before the trip is confirmed.",
	],
	[
		"Can I plan more than one day?",
		"You can draft ideas for multiple days. The booking preview covers a single day.",
	],
	[
		"What if something changes?",
		"A coordinator can help you review your options. You’ll be asked to approve changes to the plan or price.",
	],
];
