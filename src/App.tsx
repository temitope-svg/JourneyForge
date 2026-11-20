import { Link } from "@tanstack/react-router";
import { type FormEvent, useRef, useState } from "react";
import { z } from "zod";
import { Arrow } from "./Arrow";
import { getDemoSession, signOutOfDemo } from "./demoAuth";
import {
	destinations,
	estimate,
	experiences,
	itinerary,
	moods,
	questions,
	steps,
} from "./homeContent";

const sectionTitle =
	"text-[clamp(2.6rem,9vw,4rem)] leading-[1.09] font-[750] tracking-[-0.065em] tablet:text-[clamp(3.2rem,5.64vw,5.75rem)]";
const splitTitleSpacing = "my-[1.2rem] tablet:mt-[2.05rem] tablet:mb-[1.75rem]";
const primaryButton =
	"group inline-flex min-h-[3.7rem] w-full items-center justify-between gap-[1.1rem] px-[1.35rem] py-[0.85rem] text-left font-[650] transition-colors duration-[140ms]";
const textLink =
	"group inline-flex items-center justify-between gap-[1.1rem] border-b border-current bg-transparent pt-2 pb-[0.65rem] text-left font-semibold hover:border-b-2 hover:pb-[calc(0.65rem-1px)]";
const photoZoom =
	"motion-safe:transition-[scale] motion-safe:duration-[430ms] motion-safe:ease-arrival motion-safe:group-hover:scale-[1.045]";
const cardLabel = "mt-[1.45rem] mb-[0.83rem] block text-label text-ocean";
const activityTitle =
	"text-[clamp(1.3rem,1.78vw,1.9rem)] leading-[1.1] font-[735] tracking-[-0.04em]";
const activityTab =
	"min-h-[3.05rem] border-b-[3px] border-transparent pt-[0.3rem] pb-[1.1rem] text-[0.95rem] text-white transition-colors duration-[140ms] aria-pressed:border-sun aria-pressed:font-bold aria-pressed:text-sun";
const activityCount =
	"ml-[0.35rem] inline-grid size-[1.4rem] place-items-center rounded-full bg-sun text-[0.73rem] text-ink";
const disclosure =
	"flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden";

const navigationItem =
	"flex min-h-10 items-center border-r border-white/17 px-[0.55rem] text-[0.78rem] font-[650] tablet:min-h-[3.375rem] tablet:px-[clamp(0.65rem,1.4vw,1.35rem)] tablet:text-[0.81rem]";

const asset = (name: string) => `/home/${name}`;
const tripSchema = z
	.string()
	.trim()
	.min(1, "Tell us a little about the trip you have in mind.")
	.max(1200);
const storageKey = "journey-forge-home";
const collectionSchema = z.object({
	saved: z.array(z.string()),
	recent: z.array(z.string()),
	draft: z.string(),
});
type Collection = z.infer<typeof collectionSchema>;
type Experience = (typeof experiences)[number];

function readCollection(): Collection {
	const empty = { saved: [], recent: [], draft: "" };
	try {
		const parsed = collectionSchema.safeParse(
			JSON.parse(localStorage.getItem(storageKey) ?? "null"),
		);
		return parsed.success ? parsed.data : empty;
	} catch {
		return empty;
	}
}

function SectionHeading({
	label,
	lines,
	children,
}: {
	label: string;
	lines: [string, string];
	children: React.ReactNode;
}) {
	return (
		<>
			<p className="mb-[clamp(1.85rem,2.96vw,3rem)] border-b border-ink/25 pb-[1.43rem] text-label [.bg-ocean_&]:border-white/35">
				{label}
			</p>
			<div className="mb-[clamp(2.1rem,3.5vw,3.6rem)] grid gap-[0.95rem] tablet:flex tablet:items-end tablet:justify-between tablet:gap-6">
				<h2 className={sectionTitle}>
					{lines[0]}
					<br />
					{lines[1]}
				</h2>
				<div className="shrink-0 leading-[1.55] max-[680px]:[&_br]:hidden">
					{children}
				</div>
			</div>
		</>
	);
}

const footerLinks = [
	{
		title: "Find your day",
		links: [
			["Explore destinations", "#destinations"],
			["Plan a trip", "#plan"],
			["How it works", "#how-it-works"],
			["About us", "#about"],
		],
	},
	{
		title: "Here to help",
		links: [
			["Help & FAQ", "#help"],
			["Contact", "Contact"],
			["Safety", "Safety"],
			["Accessibility", "Accessibility"],
		],
	},
	{
		title: "The details",
		links: [
			["Terms", "Terms"],
			["Privacy", "Privacy"],
			["Browser data", "Browser data"],
			["Cancellations & refunds", "Cancellations & refunds"],
		],
	},
];

export default function App() {
	const [demoSession, setDemoSession] = useState(getDemoSession);

	function signOut() {
		signOutOfDemo();
		setDemoSession(null);
	}
	const [collection, setCollection] = useState(readCollection);
	const [idea, setIdea] = useState(collection.draft);
	const [feedback, setFeedback] = useState<{ text: string; error: boolean }>();
	const [view, setView] = useState<"saved" | "recent">("saved");
	const [dialog, setDialog] = useState<{
		title: string;
		experience?: Experience;
	}>();
	const dialogRef = useRef<HTMLDialogElement>(null);
	const ideaRef = useRef<HTMLTextAreaElement>(null);

	function updateCollection(next: Collection) {
		setCollection(next);
		try {
			localStorage.setItem(storageKey, JSON.stringify(next));
			return true;
		} catch {
			return false;
		}
	}

	function startPlan(prompt?: string) {
		if (prompt) {
			setIdea(prompt);
			setFeedback(undefined);
		}
		ideaRef.current?.focus({ preventScroll: true });
		document.getElementById("plan")?.scrollIntoView({ block: "center" });
	}

	function saveDraft(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const result = tripSchema.safeParse(idea);
		if (!result.success) {
			setFeedback({ text: result.error.issues[0].message, error: true });
			ideaRef.current?.focus();
			return;
		}
		const stored = updateCollection({ ...collection, draft: result.data });
		setFeedback({
			text: stored
				? "Draft saved on this device."
				: "Draft kept for this visit. Browser storage is unavailable.",
			error: false,
		});
	}

	function toggleSaved(id: string) {
		const saved = collection.saved.includes(id)
			? collection.saved.filter((item) => item !== id)
			: [...collection.saved, id];
		updateCollection({ ...collection, saved });
	}

	function openDialog(title: string, experience?: Experience) {
		if (experience) {
			updateCollection({
				...collection,
				recent: [
					experience.id,
					...collection.recent.filter((id) => id !== experience.id),
				],
			});
		}
		setDialog({ title, experience });
		dialogRef.current?.showModal();
	}

	const listedExperiences = collection[view].flatMap((id) =>
		experiences.filter((experience) => experience.id === id),
	);

	return (
		<>
			<a
				href="#main"
				className="fixed top-3 left-3 z-5 -translate-y-[180%] bg-sun px-4 py-[0.8rem] focus:translate-y-0"
			>
				Skip to content
			</a>
			<header
				className="absolute top-4 left-1/2 z-1 flex w-page -translate-x-1/2 items-center justify-between gap-[0.65rem] text-white tablet:top-[1.7rem] tablet:items-start tablet:gap-4"
				id="top"
			>
				<a href="#top" aria-label="Journey Forge home">
					<img
						className="h-auto w-[clamp(4.8rem,18vw,6rem)] tablet:w-[clamp(6.3rem,10.6vw,9.45rem)]"
						src={asset("brand-light.png")}
						width="151"
						height="73"
						alt=""
					/>
				</a>
				<nav
					className="flex flex-wrap justify-end bg-ink [&>:not(:last-child):hover]:bg-[#29443a]"
					aria-label="Main navigation"
				>
					<a className={navigationItem} href="#destinations">
						Explore
					</a>
					<a className={navigationItem} href="#how-it-works">
						How it works
					</a>
					<a className={navigationItem} href="#saved">
						Saved &amp; Recents
					</a>
					<a className={navigationItem} href="#help">
						Help
					</a>
					{demoSession ? (
						<>
							<Link className={navigationItem} to="/dashboard">
								Dashboard
							</Link>
							<button
								type="button"
								className={navigationItem}
								onClick={signOut}
							>
								Sign out
							</button>
						</>
					) : (
						<Link className={navigationItem} to="/sign-in">
							Sign in
						</Link>
					)}
					<a
						className={`${navigationItem} group justify-between gap-[0.45rem] bg-sun text-ink hover:bg-[#faf450] desktop:min-w-[10.75rem] tablet:gap-[1.1rem]`}
						href="#plan"
					>
						Plan a trip <Arrow className="text-xs tablet:text-base" />
					</a>
				</nav>
			</header>
			<main id="main">
				<div className="bg-[#0a2229] bg-hero bg-cover bg-no-repeat bg-position-[55%_top] text-white tablet:bg-center">
					<div className="mx-auto grid w-page items-end gap-6 pt-[clamp(13rem,55vw,19rem)] pb-[2.55rem] tablet:min-h-[clamp(48rem,70.175vw,68rem)] tablet:grid-cols-[minmax(0,1fr)_minmax(17rem,40%)] tablet:gap-[1.35rem] tablet:pt-36 tablet:pb-[clamp(3.3rem,4.9vw,5.25rem)] desktop:grid-cols-[minmax(0,1fr)_minmax(21rem,39%)] desktop:gap-[3.5%]">
						<div className="tablet:pb-[1.55rem]">
							<p className="mb-4 text-label tablet:mb-[1.8rem]">
								Your next adventure, made yours.
							</p>
							<h1 className="mb-4 text-[clamp(2.63rem,9.7vw,4.6rem)] leading-[0.985] font-[750] tracking-[-0.065em] motion-safe:animate-headline-arrival tablet:mb-[1.9rem] tablet:text-[clamp(2.65rem,7vw,5rem)] desktop:text-[clamp(3.5rem,6.3vw,6.5rem)]">
								Go somewhere.
								<br />
								Feel something.
							</h1>
							<p className="max-w-[29rem] text-[clamp(1rem,1.18vw,1.15rem)] leading-[1.55] tablet:max-w-lg">
								Big ideas. Little detours. Days that feel like you. Tell us what
								you have in mind—we’ll help shape the journey.
							</p>
						</div>
						<form
							className="w-full max-w-[30rem] bg-sun p-[clamp(1.5rem,2.38vw,2.65rem)] text-ink motion-safe:animate-planner-arrival tablet:max-w-none"
							id="plan"
							onSubmit={saveDraft}
						>
							<div className="mb-[1.65rem] flex items-center justify-between text-[0.91rem] font-[650] desktop:mb-[2.4rem]">
								Plan a trip <Arrow />
							</div>
							<label
								className="mb-[1.55rem] block text-[clamp(2.15rem,3.05vw,3.25rem)] leading-none font-[760] tracking-[-0.055em]"
								htmlFor="trip-idea"
							>
								What are you
								<br className="max-[680px]:hidden" /> dreaming of?
							</label>
							<textarea
								id="trip-idea"
								className="block h-[5.5rem] w-full border-b border-ink/43 bg-transparent pt-[0.2rem] pb-[0.55rem] leading-[1.55] placeholder:text-[#4c4d21] tablet:h-[6.25rem]"
								ref={ideaRef}
								value={idea}
								maxLength={1200}
								aria-invalid={feedback?.error || undefined}
								aria-describedby={feedback ? "plan-feedback" : undefined}
								placeholder="A slow day in Lisbon with local food and a great view. Two people, around EUR 200…"
								onChange={(event) => {
									setIdea(event.target.value);
									setFeedback(undefined);
								}}
							/>
							<button
								type="submit"
								className={`${primaryButton} mt-[1.45rem] bg-ink text-white hover:bg-[#254238]`}
							>
								Plan my trip <Arrow />
							</button>
							{feedback && (
								<p
									id="plan-feedback"
									role="status"
									className="mt-[0.8rem] text-[0.83rem] leading-[1.4] font-bold motion-safe:animate-response-arrival"
								>
									{feedback.text}
								</p>
							)}
							<p className="mt-[1.6rem] text-[0.83rem]">Start with a mood</p>
							<div className="mt-[0.8rem] flex flex-wrap gap-[0.8rem] text-[0.88rem] desktop:gap-[1.55rem]">
								<button
									type="button"
									className={textLink}
									onClick={() =>
										startPlan(
											"A slow, sunny day with time for lunch and a walk by the water.",
										)
									}
								>
									Slow &amp; sunny <Arrow />
								</button>
								<button
									type="button"
									className={textLink}
									onClick={() => startPlan(moods[2].prompt)}
								>
									Adventure <Arrow />
								</button>
							</div>
						</form>
					</div>
				</div>

				<section className="bg-ocean py-section text-white" id="destinations">
					<div className="mx-auto w-page">
						<SectionHeading
							label="Explore destinations"
							lines={["A change of place.", "A change of pace."]}
						>
							<p>
								Find a place that speaks to you.
								<br />
								Then imagine your own way through it.
							</p>
						</SectionHeading>
						<div className="grid grid-cols-1 gap-8 tablet:grid-cols-3 tablet:gap-[clamp(1rem,1.65vw,1.65rem)]">
							{destinations.map((place) => (
								<button
									type="button"
									key={place.name}
									className="group relative block aspect-[1.18] w-full overflow-hidden bg-[#102a23] text-left text-white after:absolute after:inset-0 after:bg-destination-shade tablet:aspect-[420/524]"
									onClick={() => startPlan(place.prompt)}
								>
									<img
										className={`${photoZoom} h-full w-full object-cover object-top`}
										src={asset(`${place.image}.webp`)}
										alt=""
										loading="lazy"
									/>
									<span className="absolute inset-x-[6%] bottom-[5%] z-1 grid gap-[0.55rem] text-[0.9rem]">
										<span className="text-label">{place.region}</span>
										<span className="flex items-center justify-between gap-[0.8rem] text-[2.4rem] leading-[1.06] font-[750] tracking-[-0.055em] group-hover:underline group-hover:underline-offset-[0.13em] tablet:text-[clamp(1.75rem,3.1vw,3.2rem)]">
											{place.name} <Arrow className="desktop:text-[1.45rem]" />
										</span>
										<span>{place.description}</span>
									</span>
								</button>
							))}
						</div>
					</div>
				</section>

				<section className="py-section">
					<div className="mx-auto w-page">
						<SectionHeading
							label="Find your kind of day"
							lines={["Go where", "you feel."]}
						>
							<p>
								A sunset for two. A day for everyone.
								<br />
								Or a path you haven’t taken yet.
							</p>
						</SectionHeading>
						<div className="grid grid-cols-1 gap-8 tablet:grid-cols-3 tablet:gap-[clamp(1rem,1.65vw,1.65rem)]">
							{moods.map((mood) => (
								<button
									type="button"
									className="group relative block w-full text-left"
									key={mood.label}
									onClick={() => startPlan(mood.prompt)}
								>
									<img
										className="aspect-[1.5] w-full object-cover tablet:aspect-[420/323]"
										src={asset(`${mood.image}.webp`)}
										alt={mood.alt}
										loading="lazy"
									/>
									<span className={cardLabel}>{mood.label}</span>
									<span className="mb-[0.68rem] flex items-center justify-between gap-[0.8rem] text-[clamp(1.4rem,2.35vw,2.4rem)] leading-[1.06] font-[750] tracking-[-0.055em] group-hover:underline group-hover:underline-offset-[0.13em]">
										{mood.title} <Arrow />
									</span>
									<span className="block text-[0.96rem] leading-normal">
										{mood.description}
									</span>
								</button>
							))}
						</div>
					</div>
				</section>

				<section className="bg-paper py-section" id="how-it-works">
					<div className="mx-auto w-page">
						<SectionHeading
							label="How it works"
							lines={["You bring the idea.", "We join the dots."]}
						>
							<p>
								Personal planning, local experiences
								<br />
								and a human in your corner.
							</p>
						</SectionHeading>
						<ol className="grid grid-cols-2 gap-x-4 gap-y-7 tablet:grid-cols-4 tablet:gap-[clamp(1rem,2.1vw,2rem)]">
							{steps.map(([title, copy], index) => (
								<li key={title} className="border-t-2 border-ocean pt-[1.4rem]">
									<span
										className="text-[clamp(2rem,3.14vw,3.1rem)] font-[760] tracking-[-0.065em] text-ocean"
										aria-hidden="true"
									>
										{String(index + 1).padStart(2, "0")}
									</span>
									<h3
										className={`${activityTitle} mt-3 mb-2 tablet:mt-[1.65rem] tablet:mb-4`}
									>
										{title}
									</h3>
									<p className="max-w-72 text-[0.96rem] leading-[1.55]">
										{copy}
									</p>
								</li>
							))}
						</ol>
					</div>
				</section>

				<section
					className="grid grid-cols-1 bg-ocean text-white tablet:grid-cols-[50.5%_minmax(0,1fr)]"
					aria-labelledby="sample-title"
				>
					<div className="min-h-[26rem] bg-[#14332e] bg-sample bg-cover bg-center bg-no-repeat p-[clamp(2.5rem,4.65vw,4.75rem)] tablet:min-h-0">
						<p className="text-label">A day, imagined</p>
						<h2
							id="sample-title"
							className="mt-[clamp(1rem,2.7vw,2.85rem)] text-[clamp(2.7rem,5.2vw,5.4rem)] leading-[1.09] font-[750] tracking-[-0.065em]"
						>
							Less rushing.
							<br />
							More remembering.
						</h2>
						<p className="mt-6 inline-block bg-ink px-[0.95rem] py-[0.7rem] text-[0.84rem] leading-[1.55] text-white">
							Lisbon, Portugal · destination concept
						</p>
					</div>
					<div className="min-w-0 px-inset py-section tablet:pl-[clamp(2.5rem,4.7vw,5rem)]">
						<p className="text-label">A little structure. Plenty of freedom.</p>
						<ol className="mt-[0.65rem]">
							{itinerary.map(([time, title, description]) => (
								<li
									key={time}
									className="grid grid-cols-[clamp(3rem,5.55vw,6rem)_1fr] border-b border-white/35 pt-[1.22rem] pb-[1.45rem] last:border-b-0"
								>
									<time className="pt-[0.45em] text-[0.82rem]" dateTime={time}>
										{time}
									</time>
									<div>
										<h3 className={activityTitle}>{title}</h3>
										<p className="mt-[0.6rem] text-[0.94rem] leading-[1.55]">
											{description}
										</p>
									</div>
								</li>
							))}
						</ol>
						<div className="mt-[1.6rem] flex items-center justify-between gap-4 border-y border-white/35 py-[1.1rem] text-[0.82rem]">
							<span>{estimate.label}</span>
							<strong className="text-[clamp(1.65rem,2.45vw,2.5rem)] tracking-[-0.055em] text-sun">
								{estimate.price}
							</strong>
						</div>
						<details className="group py-[1.6rem] text-[0.86rem]">
							<summary
								className={`${disclosure} after:mr-[0.4rem] after:size-[0.7rem] after:rotate-45 after:border-r after:border-b group-open:after:rotate-[225deg]`}
							>
								What’s in this estimate?
							</summary>
							<p className="mt-4 leading-[1.55]">{estimate.description}</p>
						</details>
						<button
							type="button"
							className={`${primaryButton} bg-sun text-ink hover:bg-[#faf450]`}
							onClick={() => startPlan(destinations[1].prompt)}
						>
							Make a day like this <Arrow />
						</button>
					</div>
				</section>

				<section className="py-section" id="experiences">
					<div className="mx-auto w-page">
						<SectionHeading
							label="Recommended experiences"
							lines={["Make a", "day of it."]}
						>
							<p>A few ideas worth building a day around.</p>
							<a href="#experience-list" className={`${textLink} mt-[1.35rem]`}>
								Explore all experiences <Arrow />
							</a>
						</SectionHeading>
						<div
							className="grid grid-cols-1 gap-8 tablet:grid-cols-3 tablet:gap-[clamp(1rem,1.65vw,1.65rem)]"
							id="experience-list"
						>
							{experiences.map((experience) => {
								const saved = collection.saved.includes(experience.id);
								return (
									<article className="flex flex-col" key={experience.id}>
										<button
											type="button"
											className="group relative block w-full flex-1 text-left"
											onClick={() => openDialog(experience.title, experience)}
										>
											<span className="relative block overflow-hidden">
												<img
													className={`${photoZoom} aspect-[1.5] w-full object-cover tablet:aspect-[420/335]`}
													src={asset(`${experience.image}.webp`)}
													alt={experience.alt}
													loading="lazy"
												/>
												<span className="absolute right-[0.9rem] bottom-[0.85rem] grid size-[2.7rem] place-items-center bg-sun">
													<Arrow />
												</span>
											</span>
											<span className={cardLabel}>{experience.location}</span>
											<span className="block text-[clamp(1.5rem,2.02vw,2.1rem)] leading-[1.13] font-[740] tracking-[-0.038em] group-hover:underline group-hover:underline-offset-[0.13em]">
												{experience.title}
											</span>
											<span className="block pt-[0.66rem] pb-[1.35rem] text-[0.96rem] leading-normal tablet:pb-[2.65rem]">
												{experience.description}
											</span>
										</button>
										<div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/25 py-[0.95rem] text-[0.86rem] desktop:flex-nowrap">
											<span>{experience.duration}</span>
											<span>
												From{" "}
												<strong className="ml-[0.3rem] text-[clamp(1.25rem,2vw,1.85rem)] tracking-[-0.045em] text-ocean">
													{experience.price}
												</strong>
											</span>
										</div>
										<button
											type="button"
											className="flex items-center justify-between gap-2 border-b border-ink/25 py-[0.95rem] text-left text-[0.86rem] text-ocean transition-colors duration-[140ms] hover:font-bold aria-pressed:bg-paper"
											aria-pressed={saved}
											onClick={() => toggleSaved(experience.id)}
										>
											{saved ? "Saved" : "Save for later"}{" "}
											<span
												className="text-2xl leading-[0.8]"
												aria-hidden="true"
											>
												{saved ? "−" : "+"}
											</span>
										</button>
									</article>
								);
							})}
						</div>
					</div>
				</section>

				<section className="bg-ocean py-section text-white" id="saved">
					<div className="mx-auto grid w-page grid-cols-1 gap-[2.4rem] tablet:grid-cols-2 tablet:gap-[clamp(1.5rem,3.2vw,3.25rem)]">
						<div>
							<p className="text-label">Saved &amp; Recents</p>
							<h2 className={`${sectionTitle} ${splitTitleSpacing}`}>
								Not today?
								<br />
								Keep it.
							</h2>
							<p className="leading-[1.55]">
								Good ideas don’t need a departure date.
								<br />
								Pick up where you left off.
							</p>
							<a
								href="#experiences"
								className={`${textLink} mt-4 tablet:mt-[1.65rem]`}
							>
								Find something to save <Arrow />
							</a>
						</div>
						<div>
							<fieldset
								className="flex min-w-0 gap-[1.4rem] border-b border-white/35"
								aria-label="Activity view"
							>
								<button
									type="button"
									className={activityTab}
									aria-pressed={view === "saved"}
									onClick={() => setView("saved")}
								>
									Saved{" "}
									<span className={activityCount}>
										{collection.saved.length +
											Number(Boolean(collection.draft))}
									</span>
								</button>
								<button
									type="button"
									className={activityTab}
									aria-pressed={view === "recent"}
									onClick={() => setView("recent")}
								>
									Recently viewed{" "}
									<span className={activityCount}>
										{collection.recent.length}
									</span>
								</button>
							</fieldset>
							{listedExperiences.length === 0 &&
							(view === "recent" || !collection.draft) ? (
								<div className="mt-[1.45rem] tablet:mt-[2.8rem]">
									<h3 className={`${sectionTitle} mb-[1.45rem] text-sun`}>
										{view === "saved" ? "Someday." : "Nothing yet."}
									</h3>
									<h4 className="mb-[0.8rem] text-[1.55rem] font-bold tracking-[-0.035em]">
										{view === "saved"
											? "Keep a good idea close."
											: "Find your next good day."}
									</h4>
									<p>
										{view === "saved"
											? "Save an experience or keep a planning draft. It’ll be here when you’re ready."
											: "Experiences you open will show up here."}
									</p>
									<a
										href="#experiences"
										className={`${textLink} mt-4 tablet:mt-[1.65rem]`}
									>
										Explore experiences <Arrow />
									</a>
								</div>
							) : (
								<ul className="[&_button]:flex [&_button]:w-full [&_button]:items-center [&_button]:justify-between [&_button]:gap-4 [&_button]:border-b [&_button]:border-white/35 [&_button]:py-5 [&_button]:text-left [&_button]:[overflow-wrap:anywhere]">
									{view === "saved" && collection.draft && (
										<li>
											<button
												type="button"
												onClick={() => startPlan(collection.draft)}
											>
												<span>
													<strong>Trip draft</strong>
													<small className="mt-2 block">
														{collection.draft}
													</small>
												</span>
												<Arrow />
											</button>
										</li>
									)}
									{listedExperiences.map((experience) => (
										<li key={experience.id}>
											<button
												type="button"
												onClick={() => openDialog(experience.title, experience)}
											>
												<span>{experience.title}</span>
												<Arrow />
											</button>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				</section>

				<section className="bg-paper py-section" id="help">
					<div className="mx-auto grid w-page grid-cols-1 gap-[2.4rem] tablet:grid-cols-2 tablet:gap-[clamp(2rem,5vw,5rem)]">
						<div id="about">
							<p className="text-label">Questions before you go</p>
							<h2
								className={`${splitTitleSpacing} text-[clamp(2.8rem,4.25vw,4.5rem)] leading-[1.09] font-[750] tracking-[-0.065em]`}
							>
								A little clarity.
								<br />A lot more ease.
							</h2>
							<p className="leading-[1.55]">
								Good adventures start with knowing
								<br />
								what to expect.
							</p>
							<a
								href="#how-it-works"
								className={`${textLink} mt-4 tablet:mt-[1.65rem]`}
							>
								About Journey Forge <Arrow />
							</a>
						</div>
						<div className="border-t border-ink/25">
							{questions.map(([question, answer]) => (
								<details
									className="group border-b border-ink/25 py-[clamp(1.05rem,1.9vw,1.9rem)]"
									key={question}
								>
									<summary
										className={`${disclosure} font-semibold after:text-[1.6rem] after:leading-none after:font-[380] after:content-['+'] group-open:after:content-['−']`}
									>
										{question}
									</summary>
									<p className="mt-4 leading-[1.55]">{answer}</p>
								</details>
							))}
						</div>
					</div>
				</section>
				<a
					href="#plan"
					className="group block bg-sun pt-[clamp(2rem,3.5vw,4rem)] pb-[clamp(2.4rem,4.2vw,4.7rem)] text-ink"
				>
					<span className="mx-auto block w-page">
						<span className="text-label">Good stories start somewhere.</span>
						<span className="mt-[1.4rem] flex items-center justify-between gap-4 text-[clamp(2.7rem,8.7vw,4.5rem)] leading-[0.985] font-[750] tracking-[-0.065em] text-ocean group-hover:underline group-hover:decoration-[0.04em] group-hover:underline-offset-[0.12em] tablet:mt-[2.15rem] tablet:text-[clamp(3.25rem,7.65vw,8rem)]">
							What’s your story?{" "}
							<Arrow className="mr-[0.32em] text-[clamp(2rem,5vw,5rem)] [--arrow-stroke:clamp(2px,0.45vw,7px)]" />
						</span>
					</span>
				</a>
			</main>
			<footer className="bg-footer">
				<div className="mx-auto w-page pt-[clamp(2.5rem,4.7vw,5rem)]">
					<div className="grid grid-cols-2 gap-4 gap-y-[1.45rem] text-[0.9rem] tablet:grid-cols-[2.4fr_repeat(3,1fr)] tablet:gap-y-4">
						<div>
							<a href="#top" aria-label="Journey Forge home">
								<img
									className="h-auto w-32 tablet:w-[11.4rem]"
									src={asset("brand-dark.png")}
									width="184"
									height="92"
									alt=""
									loading="lazy"
								/>
							</a>
							<p className="mt-[1.4rem]">
								For the days you’ll talk about for years.
							</p>
						</div>
						{footerLinks.map(({ title, links }) => (
							<div key={title}>
								<h2 className="mb-3 leading-[1.09] font-[750]">{title}</h2>
								<ul>
									{links.map(([label, target]) => (
										<li
											className="my-[0.95rem] [&_a]:hover:underline [&_button]:hover:underline [&_a]:underline-offset-[0.15em] [&_button]:underline-offset-[0.15em]"
											key={label}
										>
											{target.startsWith("#") ? (
												<a href={target}>{label}</a>
											) : (
												<button
													type="button"
													className="text-left"
													onClick={() => openDialog(target)}
												>
													{label}
												</button>
											)}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
					<div className="flex items-center justify-between gap-4 pt-[clamp(1.65rem,3.75vw,4rem)] pb-4 text-[0.78rem]">
						<span>© 2026 Journey Forge</span>
						<a
							className="inline-flex items-center gap-3 hover:underline hover:underline-offset-[0.15em]"
							href="#top"
						>
							Back to top <Arrow up />
						</a>
					</div>
				</div>
				<img
					className="h-auto w-full"
					src={asset("footer-landscape.webp")}
					alt=""
					width="1425"
					height="404"
					loading="lazy"
				/>
			</footer>

			<dialog
				ref={dialogRef}
				className="m-auto w-[min(34rem,calc(100%-2rem))] bg-paper p-10 text-ink backdrop:bg-[#071b18]/68 motion-safe:open:animate-response-arrival [&_p]:my-[0.85rem] [&_p]:leading-[1.55]"
				aria-labelledby="dialog-title"
			>
				<form method="dialog">
					<button
						type="submit"
						className="absolute top-[0.7rem] right-3 size-[2.6rem] text-[1.8rem]"
						aria-label="Close"
					>
						×
					</button>
				</form>
				<h2
					id="dialog-title"
					className="mb-4 pr-4 text-[clamp(2rem,5vw,3.4rem)] leading-[1.09] font-[750] tracking-[-0.065em]"
				>
					{dialog?.title}
				</h2>
				{dialog?.experience ? (
					<>
						<img
							className="max-h-64 w-full object-cover"
							src={asset(`${dialog.experience.image}.webp`)}
							alt={dialog.experience.alt}
						/>
						<p>{dialog.experience.description}</p>
						<p>
							{dialog.experience.duration} · From {dialog.experience.price}
						</p>
						<button
							type="button"
							className={`${primaryButton} mt-3 bg-ink text-white hover:bg-[#254238]`}
							onClick={() => {
								dialogRef.current?.close();
								startPlan(
									`Plan a day around ${dialog.experience?.title} in ${dialog.experience?.location}.`,
								);
							}}
						>
							Plan around this <Arrow />
						</button>
					</>
				) : (
					<p>
						{dialog?.title === "Browser data"
							? "Your saved experiences, recently viewed experiences and trip draft are stored in this browser. Clearing site data removes them."
							: "This page is part of a later step in the Journey Forge walkthrough."}
					</p>
				)}
			</dialog>
		</>
	);
}
