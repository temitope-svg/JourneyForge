import { type FormEvent, useRef, useState } from "react";
import { z } from "zod";
import {
	destinations,
	experiences,
	itinerary,
	moods,
	questions,
	steps,
} from "./homeContent";
import "./App.css";

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

function Arrow({ up = false }: { up?: boolean }) {
	return (
		<span className={up ? "arrow arrow-up" : "arrow"} aria-hidden="true" />
	);
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
			<p className="section-label ruled">{label}</p>
			<div className="section-heading">
				<h2>
					{lines[0]}
					<br />
					{lines[1]}
				</h2>
				<div className="section-aside">{children}</div>
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
			<a href="#main" className="skip-link">
				Skip to content
			</a>
			<header className="site-header wrap" id="top">
				<a href="#top" aria-label="Journey Forge home">
					<img
						className="header-logo"
						src={asset("brand-light.png")}
						width="151"
						height="73"
						alt=""
					/>
				</a>
				<nav aria-label="Main navigation">
					<a href="#destinations">Explore</a>
					<a href="#how-it-works">How it works</a>
					<a href="#saved">Saved &amp; Recents</a>
					<a href="#help">Help</a>
					<button type="button" onClick={() => openDialog("Sign in")}>
						Sign in
					</button>
					<a className="button yellow nav-plan" href="#plan">
						Plan a trip <Arrow />
					</a>
				</nav>
			</header>
			<main id="main">
				<div className="hero">
					<div className="hero-content wrap">
						<div className="hero-copy">
							<p className="section-label">Your next adventure, made yours.</p>
							<h1>
								Go somewhere.
								<br />
								Feel something.
							</h1>
							<p>
								Big ideas. Little detours. Days that feel like you. Tell us what
								you have in mind—we’ll help shape the journey.
							</p>
						</div>
						<form className="planner" id="plan" onSubmit={saveDraft}>
							<div className="planner-top">
								Plan a trip <Arrow />
							</div>
							<label htmlFor="trip-idea">
								What are you
								<br /> dreaming of?
							</label>
							<textarea
								id="trip-idea"
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
							<button type="submit" className="button dark">
								Plan my trip <Arrow />
							</button>
							{feedback && (
								<p
									id="plan-feedback"
									role="status"
									className="planner-feedback"
								>
									{feedback.text}
								</p>
							)}
							<p className="planner-caption">Start with a mood</p>
							<div className="mood-shortcuts">
								<button
									type="button"
									className="line-link"
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
									className="line-link"
									onClick={() => startPlan(moods[2].prompt)}
								>
									Adventure <Arrow />
								</button>
							</div>
						</form>
					</div>
				</div>

				<section className="section blue" id="destinations">
					<div className="wrap">
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
						<div className="three-grid">
							{destinations.map((place) => (
								<button
									type="button"
									key={place.name}
									className="destination-card"
									onClick={() => startPlan(place.prompt)}
								>
									<img
										src={asset(`${place.image}.webp`)}
										alt=""
										loading="lazy"
									/>
									<span className="destination-copy">
										<span className="section-label">{place.region}</span>
										<span className="destination-title">
											{place.name} <Arrow />
										</span>
										<span>{place.description}</span>
									</span>
								</button>
							))}
						</div>
					</div>
				</section>

				<section className="section">
					<div className="wrap">
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
						<div className="three-grid">
							{moods.map((mood) => (
								<button
									type="button"
									className="mood-card"
									key={mood.label}
									onClick={() => startPlan(mood.prompt)}
								>
									<img
										src={asset(`${mood.image}.webp`)}
										alt={mood.alt}
										loading="lazy"
									/>
									<span className="section-label">{mood.label}</span>
									<span className="mood-title">
										{mood.title} <Arrow />
									</span>
									<span>{mood.description}</span>
								</button>
							))}
						</div>
					</div>
				</section>

				<section className="section paper" id="how-it-works">
					<div className="wrap">
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
						<ol className="steps">
							{steps.map(([title, copy], index) => (
								<li key={title}>
									<span className="step-number" aria-hidden="true">
										{String(index + 1).padStart(2, "0")}
									</span>
									<h3>{title}</h3>
									<p>{copy}</p>
								</li>
							))}
						</ol>
					</div>
				</section>

				<section className="sample blue" aria-labelledby="sample-title">
					<div className="sample-photo">
						<p className="section-label">A day, imagined</p>
						<h2 id="sample-title">
							Less rushing.
							<br />
							More remembering.
						</h2>
						<p className="photo-caption">
							Lisbon, Portugal · destination concept
						</p>
					</div>
					<div className="sample-content">
						<p className="section-label">
							A little structure. Plenty of freedom.
						</p>
						<ol className="timeline">
							{itinerary.map(([time, title, description]) => (
								<li key={time}>
									<time dateTime={time}>{time}</time>
									<div>
										<h3>{title}</h3>
										<p>{description}</p>
									</div>
								</li>
							))}
						</ol>
						<div className="estimate">
							<span>Illustrative estimate / two adults</span>
							<strong>EUR 175</strong>
						</div>
						<details className="estimate-details">
							<summary>What’s in this estimate?</summary>
							<p>
								This sample estimate covers the guided walk, lunch for two and a
								transfer allowance. Final prices depend on your dates and
								choices.
							</p>
						</details>
						<button
							type="button"
							className="button yellow"
							onClick={() => startPlan(destinations[1].prompt)}
						>
							Make a day like this <Arrow />
						</button>
					</div>
				</section>

				<section className="section" id="experiences">
					<div className="wrap">
						<SectionHeading
							label="Recommended experiences"
							lines={["Make a", "day of it."]}
						>
							<p>A few ideas worth building a day around.</p>
							<a href="#experience-list" className="line-link">
								Explore all experiences <Arrow />
							</a>
						</SectionHeading>
						<div className="three-grid experience-list" id="experience-list">
							{experiences.map((experience) => {
								const saved = collection.saved.includes(experience.id);
								return (
									<article className="experience" key={experience.id}>
										<button
											type="button"
											className="experience-open"
											onClick={() => openDialog(experience.title, experience)}
										>
											<span className="experience-photo">
												<img
													src={asset(`${experience.image}.webp`)}
													alt={experience.alt}
													loading="lazy"
												/>
												<span className="photo-arrow">
													<Arrow />
												</span>
											</span>
											<span className="section-label">
												{experience.location}
											</span>
											<span className="experience-title">
												{experience.title}
											</span>
											<span className="experience-description">
												{experience.description}
											</span>
										</button>
										<div className="experience-meta">
											<span>{experience.duration}</span>
											<span>
												From <strong>{experience.price}</strong>
											</span>
										</div>
										<button
											type="button"
											className="save-button"
											aria-pressed={saved}
											onClick={() => toggleSaved(experience.id)}
										>
											{saved ? "Saved" : "Save for later"}{" "}
											<span aria-hidden="true">{saved ? "−" : "+"}</span>
										</button>
									</article>
								);
							})}
						</div>
					</div>
				</section>

				<section className="section blue" id="saved">
					<div className="wrap two-grid">
						<div>
							<p className="section-label">Saved &amp; Recents</p>
							<h2>
								Not today?
								<br />
								Keep it.
							</h2>
							<p>
								Good ideas don’t need a departure date.
								<br />
								Pick up where you left off.
							</p>
							<a href="#experiences" className="line-link">
								Find something to save <Arrow />
							</a>
						</div>
						<div>
							<fieldset
								className="collection-switch"
								aria-label="Activity view"
							>
								<button
									type="button"
									aria-pressed={view === "saved"}
									onClick={() => setView("saved")}
								>
									Saved{" "}
									<span>
										{collection.saved.length +
											Number(Boolean(collection.draft))}
									</span>
								</button>
								<button
									type="button"
									aria-pressed={view === "recent"}
									onClick={() => setView("recent")}
								>
									Recently viewed <span>{collection.recent.length}</span>
								</button>
							</fieldset>
							{listedExperiences.length === 0 &&
							(view === "recent" || !collection.draft) ? (
								<div className="empty-collection">
									<h3>{view === "saved" ? "Someday." : "Nothing yet."}</h3>
									<h4>
										{view === "saved"
											? "Keep a good idea close."
											: "Find your next good day."}
									</h4>
									<p>
										{view === "saved"
											? "Save an experience or keep a planning draft. It’ll be here when you’re ready."
											: "Experiences you open will show up here."}
									</p>
									<a href="#experiences" className="line-link">
										Explore experiences <Arrow />
									</a>
								</div>
							) : (
								<ul className="collection-list">
									{view === "saved" && collection.draft && (
										<li>
											<button
												type="button"
												onClick={() => startPlan(collection.draft)}
											>
												<span>
													<strong>Trip draft</strong>
													<small>{collection.draft}</small>
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

				<section className="section paper" id="help">
					<div className="wrap two-grid faq-grid">
						<div id="about">
							<p className="section-label">Questions before you go</p>
							<h2>
								A little clarity.
								<br />A lot more ease.
							</h2>
							<p>
								Good adventures start with knowing
								<br />
								what to expect.
							</p>
							<a href="#how-it-works" className="line-link">
								About Journey Forge <Arrow />
							</a>
						</div>
						<div className="faq">
							{questions.map(([question, answer]) => (
								<details key={question}>
									<summary>{question}</summary>
									<p>{answer}</p>
								</details>
							))}
						</div>
					</div>
				</section>
				<a href="#plan" className="closing yellow">
					<span className="wrap">
						<span className="section-label">Good stories start somewhere.</span>
						<span className="closing-title">
							What’s your story? <Arrow />
						</span>
					</span>
				</a>
			</main>
			<footer className="site-footer">
				<div className="wrap footer-content">
					<div className="footer-grid">
						<div>
							<a href="#top" aria-label="Journey Forge home">
								<img
									src={asset("brand-dark.png")}
									width="184"
									height="92"
									alt=""
									loading="lazy"
								/>
							</a>
							<p>For the days you’ll talk about for years.</p>
						</div>
						{footerLinks.map(({ title, links }) => (
							<div key={title}>
								<h2>{title}</h2>
								<ul>
									{links.map(([label, target]) => (
										<li key={label}>
											{target.startsWith("#") ? (
												<a href={target}>{label}</a>
											) : (
												<button
													type="button"
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
					<div className="footer-bottom">
						<span>© 2026 Journey Forge</span>
						<a href="#top">
							Back to top <Arrow up />
						</a>
					</div>
				</div>
				<img
					className="footer-landscape"
					src={asset("footer-landscape.webp")}
					alt=""
					width="1425"
					height="404"
					loading="lazy"
				/>
			</footer>

			<dialog
				ref={dialogRef}
				className="info-dialog"
				aria-labelledby="dialog-title"
			>
				<form method="dialog">
					<button type="submit" className="dialog-close" aria-label="Close">
						×
					</button>
				</form>
				<h2 id="dialog-title">{dialog?.title}</h2>
				{dialog?.experience ? (
					<>
						<img
							src={asset(`${dialog.experience.image}.webp`)}
							alt={dialog.experience.alt}
						/>
						<p>{dialog.experience.description}</p>
						<p>
							{dialog.experience.duration} · From {dialog.experience.price}
						</p>
						<button
							type="button"
							className="button dark"
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
