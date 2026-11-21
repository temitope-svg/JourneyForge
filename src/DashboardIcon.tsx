const icons = {
	info: "M12 11v6m0-10h.01m9 5a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
	switch: "M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4",
	message: "M4 5h16v12H9l-5 4V5Zm4 6h.01m4 0h.01m4 0h.01",
	lock: "M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5V10Zm7 4v3",
	wallet:
		"M3 7V5a2 2 0 0 1 2-2h13v4m-13 0h15v13H5a2 2 0 0 1-2-2V7Zm15 4h2m-4 0h4v5h-4a2.5 2.5 0 0 1 0-5Z",
	calendar:
		"M7 2v4m10-4v4M3 9h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 9h.01m4 0h.01m4 0h.01M8 17h.01m4 0h.01",
	clock: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
	pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
	car: "m4 10 2-5h11l3 5M2 10h18l2 3v5h-3m-13 0H2v-8m7 8h6m-6 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm10 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
	bookmark: "M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-4-7 4V5Zm0 2h14",
	sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5m-2 7a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z",
	mountain: "M2 21 10 4l4 8 2-4 6 13H2Zm6-6 3-4",
	waves:
		"M2 7c2-4 4 4 7 0s4 4 7 0 4 4 6 0M2 12c2-4 4 4 7 0s4 4 7 0 4 4 6 0M2 17c2-4 4 4 7 0s4 4 7 0 4 4 6 0",
	heart: "M12 21 4 13a5 5 0 0 1 8-6 5 5 0 0 1 8 6l-8 8Z",
	people:
		"M2 21a6 6 0 0 1 12 0m-6-9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 2a6 6 0 0 1 6 6M15 4a4 4 0 0 1 0 8",
	moon: "M21 15A9 9 0 1 1 9 3a8 8 0 0 0 12 12Z",
	check: "m8 12 3 3 5-6m5 3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
	next: "M4 12h15m-6-6 6 6-6 6",
};
export type IconName = keyof typeof icons;

export function Icon({
	name,
	className = "size-6",
}: {
	name: IconName;
	className?: string;
}) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.65"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d={icons[name]} />
		</svg>
	);
}
