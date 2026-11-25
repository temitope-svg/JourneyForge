import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
const progressViews = {
	generating: {
		title: "A good day is taking shape.",
		description: "We’re shaping your idea into a suggested itinerary.",
	},
	ready: {
		title: "Your preview is ready.",
		description: "Review the sample itinerary and estimated cost.",
	},
	slow: {
		title: "Still working on your day.",
		description:
			"In a connected service, you could leave and check progress from Trips.",
	},
	few: {
		title: "Let’s give your day more room.",
		description: "Try a wider area or a different budget.",
	},
	conflict: {
		title: "A few details need a rethink.",
		description: "Review the time available and your activity preferences.",
	},
	error: {
		title: "We couldn’t finish your plan.",
		description:
			"Your saved details are unchanged. Retry the preview or edit your request.",
	},
};
type ProgressView = keyof typeof progressViews;

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
	const [previewState, setPreviewState] = useState<ProgressView | null>(null);
	const view = previewState ?? (ready ? "ready" : "generating");
	const generating = view === "generating";
	const running = generating && !ready;
	const { title, description } = progressViews[view];
	const headingRef = useRef<HTMLHeadingElement>(null);

	useEffect(() => {
		if (!running) return;
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
	}, [navigate, running]);

	function selectView(next: ProgressView) {
		if (next === "ready" && !ready) {
			void navigate({ to: "/trips/ready" });
			return;
		}
		setPreviewState(next);
		if (next === "generating") setPhase(1);
	}

	function retryPreview() {
		headingRef.current?.focus();
		if (ready) {
			void navigate({ to: "/trips/generating" });
		} else {
			selectView("generating");
		}
	}

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
				<Link
					to="/trips/plan"
					className="text-ocean underline underline-offset-2"
				>
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
						value={view}
						onChange={(event) => selectView(event.target.value as ProgressView)}
						className="min-h-10 max-w-full rounded border border-[#92a5c1] bg-white px-2.5"
					>
						{Object.entries(progressViews).map(([value, { title }]) => (
							<option key={value} value={value}>
								{title}
							</option>
						))}
					</select>
				</label>
			</div>
			<div className="mt-7 grid items-start gap-7 desktop:grid-cols-[2.04fr_1fr]">
				<section className="min-w-0 pt-3">
					<div aria-live="polite">
						<h1
							ref={headingRef}
							tabIndex={-1}
							className="text-[clamp(2.4rem,3.6vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.04em]"
						>
							{title}
						</h1>
						<p className="mt-4 leading-relaxed text-[#506582]">{description}</p>
					</div>
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
						{view === "error" && (
							<button type="button" onClick={retryPreview} className={primary}>
								Retry preview
							</button>
						)}
						<Link
							to={days.length === 1 ? "/trips/single-day" : "/trips/itinerary"}
							className={primary}
						>
							{view === "ready" ? "View itinerary" : "View sample itinerary"}
						</Link>
						<Link to="/trips/plan" className={outline}>
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
