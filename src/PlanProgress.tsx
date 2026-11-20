import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "./DashboardIcon";
import { itineraryDays, sampleIdea } from "./itineraryModel";
import type { TripDetails } from "./tripDraft";

const phases = [
	["Understanding your idea", "Your request summary appears alongside."],
	[
		"Finding experiences that fit",
		"Looking for coast, food and time outdoors.",
	],
	["Putting your route together", "Allowing room between stops."],
	["Preparing your estimate", "Separating estimates from confirmed prices."],
];
const primary =
	"inline-flex min-h-12 items-center justify-center rounded-xl bg-ocean px-5 py-2 text-sm font-semibold text-white hover:bg-[#0018c9]";
const outline =
	"inline-flex min-h-12 items-center justify-center rounded-xl border border-[#dbeaff] bg-white px-5 py-2 text-sm font-semibold text-ocean hover:bg-[#e9f3ff]";

export default function PlanProgress({
	ready,
	idea,
	details,
}: {
	ready: boolean;
	idea: string;
	details: TripDetails;
}) {
	const navigate = useNavigate();
	const [phase, setPhase] = useState(1);
	const [previewState, setPreviewState] = useState<"generating" | null>(null);
	const generating = !ready || previewState === "generating";

	useEffect(() => {
		if (ready) return;
		const progress = window.setInterval(
			() => setPhase((step) => Math.min(step + 1, phases.length - 1)),
			1300,
		);
		const completion = window.setTimeout(() => {
			void navigate({ to: "/trips/ready", replace: true });
		}, 5200);
		return () => {
			window.clearInterval(progress);
			window.clearTimeout(completion);
		};
	}, [navigate, ready]);

	const days = itineraryDays(details);
	const dateLabel =
		days[0]?.key === "flexible" || !days.length
			? "Flexible dates"
			: days.length === 1
				? days[0].label
				: `${days[0].label} – ${days.at(-1)?.label}`;
	const request: { icon: IconName; text: string }[] = [
		{
			icon: "people",
			text: `${details.adults} ${details.adults === 1 ? "adult" : "adults"}${details.children ? `, ${details.children} ${details.children === 1 ? "child" : "children"}` : ""}`,
		},
		{ icon: "calendar", text: dateLabel },
		{
			icon: "car",
			text: `Transport: ${details.transport === "yes" ? "Requested" : details.transport === "no" ? "Self-arranged" : "Not sure yet"}`,
		},
	];

	return (
		<main className="mx-auto max-w-[100rem] px-4 pt-6 pb-16 tablet:px-[clamp(2rem,4.05vw,4.25rem)] tablet:pt-9">
			<nav aria-label="Breadcrumb" className="text-sm text-[#506582]">
				<Link to="/trips" className="text-ocean underline underline-offset-2">
					Plan a trip
				</Link>{" "}
				<span aria-hidden="true">/</span>{" "}
				<span aria-current="page">Your itinerary</span>
			</nav>
			<div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-[#dbeaff] bg-white px-4 py-3 text-sm">
				<p className="font-bold">
					Design preview — no generation service connected
				</p>
				<label className="flex flex-wrap items-center gap-2">
					View state
					<select
						value={generating ? "generating" : "ready"}
						onChange={(event) => {
							if (event.target.value === "ready") {
								setPreviewState(null);
								if (!ready) void navigate({ to: "/trips/ready" });
							} else {
								setPreviewState("generating");
							}
						}}
						className="min-h-10 max-w-full rounded border border-[#92a5c1] bg-white px-2.5"
					>
						<option value="generating">A good day is taking shape.</option>
						<option value="ready">Your preview is ready.</option>
					</select>
				</label>
			</div>
			<div className="mt-7 grid items-start gap-7 desktop:grid-cols-[2.04fr_1fr]">
				<section className="min-w-0 pt-3">
					<h1 className="text-[clamp(2.4rem,4vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.05em]">
						{generating
							? "A good day is taking shape."
							: "Your preview is ready."}
					</h1>
					<p className="mt-4 leading-relaxed text-[#506582]">
						{generating
							? "We’re shaping your idea into a suggested itinerary."
							: "Review the sample itinerary and estimated cost."}
					</p>
					{generating && (
						<ol className="mt-12 grid gap-8">
							{phases.map(([title, description], index) => (
								<li
									key={title}
									className="flex items-start gap-5"
									aria-current={index === phase ? "step" : undefined}
								>
									<Icon
										name={
											index < phase
												? "check"
												: index === phase
													? "sun"
													: "clock"
										}
										className="mt-0.5 size-8 shrink-0 text-ocean"
									/>
									<div>
										<h2 className="text-xl font-semibold tracking-tight">
											{title}
										</h2>
										<p className="mt-2 text-sm text-[#506582]">{description}</p>
									</div>
								</li>
							))}
						</ol>
					)}
					<div
						className={`flex flex-wrap gap-3.5 ${generating ? "mt-12" : "mt-8"}`}
					>
						<Link
							to={days.length === 1 ? "/trips/single-day" : "/trips/itinerary"}
							className={primary}
						>
							{generating ? "View sample itinerary" : "View itinerary"}
						</Link>
						<Link to="/trips" className={outline}>
							Edit request
						</Link>
					</div>
					<p className="mt-6 text-xs leading-relaxed text-[#506582]">
						This preview uses sample activities and prices. No availability
						checks or notifications are sent.
					</p>
				</section>

				<aside
					className="rounded-2xl border border-[#dbeaff] bg-[#e9f3ff] p-6 tablet:p-7"
					aria-labelledby="request-title"
				>
					<img
						src="/dashboard/west-coast.webp"
						alt=""
						className="aspect-[3] w-full rounded-xl object-cover object-center"
					/>
					<h2
						id="request-title"
						className="mt-7 text-[1.7rem] font-semibold tracking-tight"
					>
						Your idea
					</h2>
					<p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap wrap-anywhere">
						{idea || sampleIdea}
					</p>
					<ul className="mt-4 grid gap-4 text-sm">
						{request.map(({ icon, text }) => (
							<li key={icon} className="flex items-center gap-2">
								<Icon name={icon} className="size-5" />
								{text}
							</li>
						))}
					</ul>
					<p className="mt-5 text-xs text-[#506582]">
						Sample request · A suggested plan, not a booking.
					</p>
				</aside>
			</div>
		</main>
	);
}
