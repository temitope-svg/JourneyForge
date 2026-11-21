import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Arrow } from "./Arrow";
import { steps } from "./homeContent";
import { PublicFooter, PublicHeader } from "./PublicChrome";

const lineLink =
	"group mt-5 inline-flex items-center justify-between gap-7 border-b border-current pb-2 text-sm font-semibold hover:text-ocean";
const heading =
	"text-[clamp(2.3rem,5.25vw,5rem)] leading-[1.02] font-[750] tracking-[-0.065em]";
const panels = [
	{
		label: "Estimated plan",
		text: "Your suggested itinerary brings places, timing and estimated costs together. Review it and adjust what doesn’t fit.",
		callout: "A generated plan is not a booking.",
	},
	{
		label: "Confirmed trip",
		text: "Partner availability and final details are checked after your request. Material changes need your approval before proceeding.",
		callout: "Check your trip status before making arrangements.",
	},
];

export default function HowItWorks() {
	const [info, setInfo] = useState("");
	const dialog = useRef<HTMLDialogElement>(null);

	function openInfo(title: string) {
		setInfo(title);
		dialog.current?.showModal();
	}

	const description =
		info === "Service fee"
			? "The service fee covers planning and coordination. Your estimate shows it alongside activities and transport so you can review the separate costs before making a request."
			: info === "Browser data"
				? "Your saved experiences, recently viewed experiences and trip draft are stored in this browser. Clearing site data removes them."
				: "This page is part of a later step in the Journey Forge walkthrough.";

	return (
		<>
			<a
				href="#main"
				className="fixed top-3 left-3 z-5 -translate-y-[180%] bg-sun px-4 py-[0.8rem] focus:translate-y-0"
			>
				Skip to content
			</a>
			<PublicHeader />
			<main id="main">
				<section className="relative isolate flex min-h-[33rem] items-end overflow-hidden bg-[#0a2229] pt-36 pb-12 text-white tablet:min-h-[min(56.1vw,58rem)] tablet:pb-[4.6vw]">
					<img
						src="/home/romance.webp"
						alt=""
						className="absolute inset-0 -z-20 size-full object-cover object-center"
						fetchPriority="high"
					/>
					<div className="absolute inset-0 -z-10 bg-linear-to-b from-[#071c25]/44 via-[#071c25]/30 to-[#071c25]/88" />
					<div className="mx-auto w-page">
						<p className="mb-5 text-label">How it works</p>
						<h1 className="text-[clamp(3rem,6.6vw,6.7rem)] leading-[1.015] font-[750] tracking-[-0.065em] motion-safe:animate-headline-arrival">
							Your idea.
							<br />A day worth remembering.
						</h1>
					</div>
				</section>

				<section
					className="bg-paper py-[clamp(3rem,5.5vw,5.5rem)]"
					aria-label="Planning steps"
				>
					<ol className="mx-auto w-page">
						{steps.map(([title, copy], index) => (
							<li
								key={title}
								className="grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-5 border-b border-ink/15 py-[clamp(1.35rem,1.95vw,2.15rem)] first:pt-0 tablet:grid-cols-[minmax(4rem,8vw)_minmax(0,1fr)_40%] tablet:gap-x-[2.5vw]"
							>
								<span
									aria-hidden="true"
									className="text-[clamp(2.6rem,4.7vw,4.75rem)] leading-none font-[750] tracking-[-0.065em] text-ocean"
								>
									{String(index + 1).padStart(2, "0")}
								</span>
								<div>
									<h2 className="text-[clamp(1.55rem,2.8vw,2.75rem)] leading-tight font-[750] tracking-[-0.06em]">
										{title}
									</h2>
									<p className="mt-2 max-w-[47ch] text-sm leading-relaxed tablet:text-base">
										{copy}
									</p>
								</div>
								<img
									src={`/home/how-step-${index + 1}.webp`}
									width="521"
									height="173"
									alt=""
									loading="lazy"
									className="col-span-2 aspect-[3] w-full object-cover tablet:col-span-1"
								/>
							</li>
						))}
					</ol>
				</section>

				<section className="bg-ocean py-[clamp(3rem,5vw,5rem)] text-white">
					<div className="mx-auto w-page">
						<h2 className={heading}>
							A plan is a starting point.
							<br />
							Confirmation makes it yours.
						</h2>
						<div className="mt-[clamp(2rem,3.1vw,3.5rem)] grid gap-7 tablet:grid-cols-2 tablet:gap-[4.8vw]">
							{panels.map(({ label, text, callout }, index) => (
								<div
									key={label}
									className={
										index === 1
											? "border-t border-white/35 pt-6 tablet:border-t-0 tablet:border-l tablet:pt-0 tablet:pl-[4.8vw]"
											: ""
									}
								>
									<h3 className="text-label">{label}</h3>
									<p className="mt-4 max-w-[53ch] text-sm leading-relaxed tablet:text-base">
										{text}
									</p>
									<p className="mt-5 max-w-[33rem] border border-white/45 px-4 py-3 text-sm font-medium">
										{callout}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section id="people" className="bg-paper py-[clamp(3rem,5vw,5rem)]">
					<div className="mx-auto grid w-page gap-8 tablet:grid-cols-2 tablet:gap-[4.8vw]">
						<div>
							<h2 className="text-[clamp(2rem,3.55vw,3.5rem)] leading-[1.06] font-[750] tracking-[-0.06em]">
								People behind
								<br />
								the plan.
							</h2>
							<p className="mt-4 max-w-[51ch] text-sm leading-relaxed tablet:text-base">
								Planning tools help shape the idea. Human coordination checks
								the arrangements and gives you a route to help when things
								change.
							</p>
							<Link to="/about" className={lineLink}>
								More about Journey Forge <Arrow />
							</Link>
						</div>
						<div className="border-t border-ink/15 pt-7 tablet:border-t-0 tablet:border-l tablet:pt-0 tablet:pl-[4.8vw]">
							<h2 className="text-[clamp(2rem,3.55vw,3.5rem)] leading-[1.06] font-[750] tracking-[-0.06em]">
								What about
								<br />
								the service fee?
							</h2>
							<p className="mt-4 max-w-[51ch] text-sm leading-relaxed tablet:text-base">
								The fee relates to planning and coordination. Review it
								alongside the activity and transport costs before committing to
								a trip.
							</p>
							<button
								type="button"
								className={lineLink}
								onClick={() => openInfo("Service fee")}
							>
								See fee details <Arrow />
							</button>
						</div>
					</div>
				</section>

				<section className="bg-sun py-[clamp(2rem,3.1vw,3.5rem)]">
					<div className="mx-auto flex w-page flex-wrap items-center justify-between gap-5">
						<h2 className={heading}>Start with an idea.</h2>
						<Link
							to="/"
							hash="plan"
							className="group inline-flex min-h-12 w-[clamp(10rem,15.5vw,15rem)] items-center justify-between gap-4 bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-[#29443a]"
						>
							Plan a trip <Arrow />
						</Link>
					</div>
				</section>
			</main>
			<PublicFooter onInfo={openInfo} />
			<dialog
				ref={dialog}
				aria-labelledby="how-info-title"
				className="m-auto w-[min(34rem,calc(100%-2rem))] bg-paper p-8 text-ink backdrop:bg-[#071b18]/68 motion-safe:open:animate-response-arrival"
			>
				<form
					method="dialog"
					className="mb-4 flex items-center justify-between gap-4"
				>
					<h2
						id="how-info-title"
						className="text-2xl font-semibold tracking-tight"
					>
						{info}
					</h2>
					<button
						type="submit"
						aria-label="Close"
						className="grid size-9 place-items-center text-2xl"
					>
						×
					</button>
				</form>
				<p className="leading-relaxed">{description}</p>
			</dialog>
		</>
	);
}
