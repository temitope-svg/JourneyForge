import { Link } from "@tanstack/react-router";
import { type ReactNode, useRef, useState } from "react";
import { Arrow } from "./Arrow";
import { getDemoSession } from "./demoAuth";
import PolicyLayout from "./layout/PolicyLayout";
import { PublicFooter, PublicHeader } from "./PublicChrome";

type SupportPage = "contact" | "safety" | "cancellations";
type PolicyPage = "terms" | "privacy" | "accessibility";
type Page = SupportPage | PolicyPage | "help" | "about";
type PublicPath =
	| "/help"
	| "/contact"
	| "/safety"
	| "/cancellations"
	| "/about"
	| "/how-it-works";
type Info = { title: string; body: string; to?: PublicPath; link?: string };

const support = [
	{
		page: "contact",
		title: "Contact us",
		path: "/contact",
		lines: ["Let’s talk about", "your next day."],
	},
	{
		page: "safety",
		title: "Safety & trust",
		path: "/safety",
		lines: ["Good days start", "with care."],
	},
	{
		page: "cancellations",
		title: "Cancellations & refunds",
		path: "/cancellations",
		lines: ["When plans", "change."],
	},
] as const;
const categories: {
	title: string;
	summary: string;
	body: string;
	to: PublicPath;
	link: string;
}[] = [
	{
		title: "Planning",
		summary: "From your first idea to a plan that fits.",
		body: "Start with an idea, then adjust the dates, activities and budget in your suggested itinerary.",
		to: "/how-it-works",
		link: "See how it works",
	},
	{
		title: "Prices & payment",
		summary: "Estimates, final prices and the service fee.",
		body: "Your initial estimate separates activities, travel and coordination. Final prices and availability would be checked before a live booking.",
		to: "/how-it-works",
		link: "See how estimates work",
	},
	{
		title: "Confirmation & availability",
		summary: "What gets checked before you go.",
		body: "A coordinator would check availability with partners after your request. You review material changes before proceeding.",
		to: "/how-it-works",
		link: "See how confirmation works",
	},
	{
		title: "Changes & cancellations",
		summary: "Changes, approvals and cancellation terms.",
		body: "Check the booking-specific terms before requesting a change or cancellation.",
		to: "/cancellations",
		link: "Cancellations & refunds",
	},
	{
		title: "During your trip",
		summary: "Your itinerary, pickup and getting help.",
		body: "Review the itinerary and pickup instructions before leaving. Trip help is available from the Today screen in the sample trip.",
		to: "/safety",
		link: "Read safety information",
	},
	{
		title: "Account & privacy",
		summary: "Preferences, notifications and your information.",
		body: "Demo preferences are saved in your browser. Open Profile after signing in to review them.",
		to: "/contact",
		link: "Contact us",
	},
];
const helpQuestions = [
	[
		"Is my generated plan booked?",
		"A generated plan is a draft. A live request would need partner checks and confirmation before it becomes a booking.",
	],
	[
		"When is my trip confirmed?",
		"For a live request, your trip is confirmed after availability and final details are agreed and you have approved any material changes.",
	],
	[
		"Can the price change?",
		"Estimates can change with availability and your choices. Review the final price before committing to a trip.",
	],
	[
		"How do I get help during my trip?",
		"Open your trip and choose I need help. The demo lets you preview a message from that screen.",
	],
];
const safetyQuestions = [
	[
		"Before you go",
		"Review your itinerary, meeting points and any information from your activity provider. Raise questions about suitability or accessibility before committing.",
	],
	[
		"Know your activity",
		"Check what is included, what to bring and any participant requirements. Follow instructions from your activity provider.",
	],
	[
		"Help along the way",
		"Use the help option on your trip page for coordination questions. Contact local emergency services in an emergency.",
	],
];
const cancellationQuestions = [
	[
		"Where can I find cancellation terms?",
		"Verified terms would be attached to the specific live booking. The terms shown in this walkthrough are preview states.",
	],
	[
		"Do all activities have the same terms?",
		"Terms can depend on the booking and provider. Review each booking’s conditions before deciding.",
	],
	[
		"How do I request a change?",
		"Open the relevant trip and use Cancel or request a change. You can save a change draft in the walkthrough.",
	],
	[
		"Has this page cancelled my trip?",
		"This page explains the process. The walkthrough does not submit a cancellation or issue a refund.",
	],
];

const headline =
	"text-[clamp(3rem,6.65vw,6.75rem)] leading-[1.01] font-[750] tracking-[-0.065em]";
const sectionTitle =
	"text-[clamp(2.5rem,5.1vw,5rem)] leading-[1.05] font-[750] tracking-[-0.065em]";
const smallTitle =
	"text-[clamp(1.65rem,2.85vw,2.7rem)] leading-[1.1] font-[750] tracking-[-0.055em]";
const solid =
	"group inline-flex min-h-12 min-w-[12rem] items-center justify-between gap-6 px-5 py-3.5 text-sm font-semibold text-white";
const darkButton = `${solid} bg-ink hover:bg-[#29443a]`;
const blueButton = `${solid} bg-ocean hover:bg-[#0018c9]`;
const textLink =
	"group inline-flex items-center gap-6 border-b border-current pb-2 text-sm font-semibold hover:text-ocean";
const field =
	"mt-2 block min-h-14 w-full rounded-none border border-ink/40 bg-white px-4 py-3 text-base font-normal text-ink";

function TripLink({
	children,
	className = blueButton,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<Link to={getDemoSession() ? "/trips" : "/sign-in"} className={className}>
			{children}
		</Link>
	);
}

function Cta({ lines, children }: { lines: string[]; children: ReactNode }) {
	return (
		<section className="bg-sun py-[clamp(2.5rem,4vw,4rem)]">
			<div className="mx-auto flex w-page flex-wrap items-center justify-between gap-6">
				<h2 className={sectionTitle}>
					{lines.map((line) => (
						<span key={line} className="block">
							{line}
						</span>
					))}
				</h2>
				{children}
			</div>
		</section>
	);
}

function BlueHero({
	lines,
	title,
	children,
}: {
	lines: readonly string[];
	title?: string;
	children?: ReactNode;
}) {
	return (
		<section className="bg-ocean pt-[clamp(9rem,12vw,13rem)] pb-[clamp(3.25rem,5.3vw,6rem)] text-white">
			<div className="mx-auto w-page">
				<nav
					aria-label="Breadcrumb"
					className="mb-8 flex flex-wrap gap-3 text-sm tablet:mb-10"
				>
					{title ? (
						<>
							<Link to="/help" className="underline underline-offset-3">
								Help centre
							</Link>
							<span aria-hidden="true">/</span>
							<span aria-current="page">{title}</span>
						</>
					) : (
						<span aria-current="page" className="underline underline-offset-3">
							Help centre
						</span>
					)}
				</nav>
				<h1 className={headline}>
					{lines.map((line) => (
						<span className="block" key={line}>
							{line}
						</span>
					))}
				</h1>
				{children}
			</div>
		</section>
	);
}

function Accordions({
	items,
	blue = false,
}: {
	items: string[][];
	blue?: boolean;
}) {
	return (
		<div>
			{items.map(([question, answer]) => (
				<details key={question} className="group border-b border-ink/20">
					<summary className="flex cursor-pointer list-none items-center gap-3 py-5 text-lg font-bold tracking-tight [&::-webkit-details-marker]:hidden">
						{!blue && (
							<span
								aria-hidden="true"
								className="size-0 border-y-[7px] border-l-[11px] border-y-transparent transition-transform group-open:rotate-90 motion-reduce:transition-none"
							/>
						)}
						<span className="flex-1">{question}</span>
						{blue && <Arrow className="text-ocean" />}
					</summary>
					<p className="max-w-[63ch] pb-5 text-sm leading-relaxed tablet:text-base">
						{answer}
					</p>
				</details>
			))}
		</div>
	);
}

function HelpCentre({ onInfo }: { onInfo: (value: Info) => void }) {
	return (
		<>
			<BlueHero lines={["A little clarity.", "A lot more ease."]}>
				<p className="mt-6 text-base tablet:text-lg">
					Find answers about planning, confirmation and your trip.
				</p>
			</BlueHero>
			<section className="bg-paper py-section">
				<div className="mx-auto w-page">
					<div className="grid gap-x-[4vw] tablet:grid-cols-2">
						{categories.map((topic, index) => (
							<button
								type="button"
								key={topic.title}
								onClick={() => onInfo(topic)}
								className="group flex items-start gap-5 border-b border-ink/20 py-7 text-left tablet:gap-8 tablet:py-9"
							>
								<span
									aria-hidden="true"
									className="w-[1.35em] shrink-0 text-[clamp(2.15rem,4vw,4rem)] leading-none font-[750] tracking-[-0.07em] text-ocean"
								>
									{String(index + 1).padStart(2, "0")}
								</span>
								<span className="flex-1">
									<span className="block text-[clamp(1.4rem,2.6vw,2.7rem)] leading-none font-[750] tracking-[-0.055em] group-hover:text-ocean">
										{topic.title}
									</span>
									<span className="mt-3 block text-sm leading-relaxed">
										{topic.summary}
									</span>
								</span>
								<Arrow className="text-ocean" />
							</button>
						))}
					</div>
					<div className="mt-[clamp(3.5rem,6vw,7rem)] grid gap-7 tablet:grid-cols-[0.85fr_1fr] tablet:gap-12">
						<h2 className={sectionTitle}>
							Good
							<br />
							questions.
						</h2>
						<Accordions items={helpQuestions} blue />
					</div>
				</div>
			</section>
			<Cta lines={["Still need a hand?"]}>
				<Link to="/contact" className={darkButton}>
					Contact us <Arrow />
				</Link>
			</Cta>
		</>
	);
}

function ContactForm() {
	const [kind, setKind] = useState("General question");
	const [status, setStatus] = useState<{ text: string; error: boolean }>();
	return (
		<>
			<h2 id="contact-form" className={smallTitle}>
				Send us a message.
			</h2>
			<p className="mt-5 text-base leading-relaxed">
				Choose what you need a hand with.
			</p>
			<form
				method="post"
				className="mt-8 grid gap-5"
				onChange={() => setStatus(undefined)}
				onSubmit={(event) => {
					event.preventDefault();
					const form = event.currentTarget;
					const data = new FormData(form);
					const missing = ["name", "message"].find(
						(key) => !String(data.get(key) ?? "").trim(),
					);
					if (missing) {
						setStatus({
							text:
								missing === "name" ? "Enter your name." : "Enter a message.",
							error: true,
						});
						const input = form.elements.namedItem(missing);
						if (input instanceof HTMLElement) input.focus();
						return;
					}
					setStatus({
						text: "Message preview complete. Nothing was sent.",
						error: false,
					});
				}}
			>
				<label className="text-sm font-semibold">
					What’s your question about?
					<select
						value={kind}
						onChange={(event) => setKind(event.target.value)}
						className={field}
					>
						<option>General question</option>
						<option>A trip I’m planning</option>
						<option>An existing trip</option>
					</select>
				</label>
				<label className="text-sm font-semibold">
					Name
					<input
						name="name"
						autoComplete="name"
						maxLength={120}
						required
						className={field}
					/>
				</label>
				<label className="text-sm font-semibold">
					Email
					<input
						name="email"
						type="email"
						autoComplete="email"
						required
						maxLength={254}
						className={field}
					/>
				</label>
				{kind === "An existing trip" && (
					<label className="text-sm font-semibold">
						Trip reference <span className="font-normal">(optional)</span>
						<input name="trip" maxLength={32} className={field} />
					</label>
				)}
				<label className="text-sm font-semibold">
					Topic
					<select name="topic" defaultValue="" required className={field}>
						<option value="">Select a topic</option>
						<option>Planning</option>
						<option>Prices & payment</option>
						<option>Changes or cancellations</option>
						<option>Safety & accessibility</option>
						<option>Account & privacy</option>
						<option>Something else</option>
					</select>
				</label>
				<label className="text-sm font-semibold">
					Message
					<textarea
						name="message"
						required
						maxLength={1200}
						className={`${field} min-h-44`}
					/>
				</label>
				<p className="text-xs leading-relaxed">
					Preview only. Messages are not sent. Please don’t include payment
					details or sensitive information.
				</p>
				<button type="submit" className={`${blueButton} justify-self-start`}>
					Send message <Arrow />
				</button>
				{status && (
					<p
						role={status.error ? "alert" : "status"}
						className={`text-sm font-semibold ${status.error ? "text-red-800" : "text-ocean"}`}
					>
						{status.text}
					</p>
				)}
			</form>
		</>
	);
}

function Support({ page }: { page: SupportPage }) {
	const current = support.find((item) => item.page === page) ?? support[0];
	return (
		<>
			<BlueHero lines={current.lines} title={current.title} />
			<section className="bg-paper pt-[clamp(2.5rem,4vw,4.5rem)] pb-section">
				<div className="mx-auto w-page">
					{page === "safety" && (
						<img
							src="/home/safety-coast.webp"
							alt="Mauritius coastline and lagoon"
							className="mb-9 aspect-[3] w-full object-cover tablet:mb-12"
						/>
					)}
					<div className="grid items-start gap-8 tablet:grid-cols-[clamp(11rem,20vw,17.5rem)_minmax(0,44rem)] tablet:gap-[4.25vw]">
						<nav
							aria-label="Support pages"
							className="flex flex-wrap gap-1 tablet:grid tablet:border-r tablet:border-ink/15 tablet:pr-6"
						>
							{support.map((item) => (
								<Link
									key={item.page}
									to={item.path}
									className="group flex min-h-12 items-center justify-between gap-3 border-l-4 border-transparent px-3 py-2.5 text-sm font-semibold hover:text-ocean aria-[current=page]:border-sun aria-[current=page]:bg-ocean aria-[current=page]:text-white"
								>
									{item.title}
									<Arrow />
								</Link>
							))}
						</nav>
						<div className="min-w-0">
							{page === "contact" && <ContactForm />}
							{page === "safety" && (
								<>
									<h2 className={smallTitle}>Know the day ahead.</h2>
									<p className="mt-5 max-w-[65ch] leading-relaxed">
										Read the details of your chosen activities and raise any
										questions before committing to a trip.
									</p>
									<div className="mt-6">
										<Accordions items={safetyQuestions} />
									</div>
									<div className="mt-6 bg-sun/25 p-6">
										<h3 className="text-xl font-bold tracking-tight">
											In an emergency
										</h3>
										<p className="mt-3 text-sm leading-relaxed">
											Contact the relevant local emergency service. Journey
											Forge is not an emergency service.
										</p>
									</div>
								</>
							)}
							{page === "cancellations" && (
								<>
									<h2 className={smallTitle}>
										Check the terms
										<br />
										for your trip.
									</h2>
									<p className="mt-5 max-w-[65ch] leading-relaxed">
										Review the cancellation and refund terms attached to your
										booking before requesting a change. This preview does not
										provide a live cancellation or refund service.
									</p>
									<div className="mt-6">
										<TripLink>
											View my trips <Arrow />
										</TripLink>
									</div>
									<div className="mt-7 bg-sun/25 p-6">
										<h3 className="text-xl font-bold tracking-tight">
											Trip terms unavailable
										</h3>
										<p className="mt-3 text-sm leading-relaxed">
											Verified booking-specific cancellation and refund terms
											are unavailable in this preview. No cancellation has been
											requested and no refund has been issued.
										</p>
										<TripLink className={`${textLink} mt-4`}>
											Choose a trip <Arrow />
										</TripLink>
									</div>
									<h3 className="mt-9 border-t border-ink/20 pt-6 text-2xl font-bold tracking-tight">
										Common questions
									</h3>
									<Accordions items={cancellationQuestions} />
									<Link to="/contact" className={`${textLink} mt-4`}>
										Contact us <Arrow />
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			</section>
			{page === "safety" && (
				<Cta lines={["Need help with", "your trip?"]}>
					<TripLink className={darkButton}>
						View my trips <Arrow />
					</TripLink>
				</Cta>
			)}
		</>
	);
}

function About() {
	return (
		<>
			<section className="flex min-h-[35rem] items-end bg-[#0a2229] bg-hero bg-cover bg-center pt-36 pb-12 text-white tablet:min-h-[min(56.1vw,58rem)] tablet:pb-[4.6vw]">
				<div className="mx-auto w-page">
					<p className="mb-5 text-label">About Journey Forge</p>
					<h1 className={headline}>
						For the days you’ll
						<br />
						talk about for years.
					</h1>
				</div>
			</section>
			<section className="bg-ocean py-[clamp(3.5rem,5.5vw,6rem)] text-white">
				<div className="mx-auto grid w-page items-end gap-7 tablet:grid-cols-[1.15fr_0.85fr] tablet:gap-[5vw]">
					<h2 className={headline}>
						We start with
						<br />
						your idea of
						<br />a good day.
					</h2>
					<p className="max-w-[43ch] leading-relaxed">
						Travel means different things to different people. A quiet beach. A
						long lunch. A walk with a view. Journey Forge starts with what you
						have in mind, then helps shape the day around it.
					</p>
				</div>
			</section>
			<section className="bg-paper py-section">
				<div className="mx-auto w-page">
					<div className="grid items-center gap-7 tablet:grid-cols-[0.75fr_1.25fr] tablet:gap-[5vw]">
						<div>
							<p className="mb-4 text-label">Our starting point</p>
							<h2 className={sectionTitle}>
								Mauritius
								<br />
								first.
							</h2>
							<p className="mt-5 max-w-[44ch] text-sm leading-relaxed tablet:text-base">
								One island, with room for very different days. Coastal escapes,
								market stops and paths into the green interior.
							</p>
							<p className="mt-4 max-w-[44ch] text-sm leading-relaxed tablet:text-base">
								Mauritius is the starting point for Journey Forge: personal
								plans that bring local experiences and human coordination
								together.
							</p>
						</div>
						<div className="grid grid-cols-[0.75fr_1fr] gap-3 tablet:gap-5">
							<img
								src="/home/about-market.webp"
								alt="Market in Port Louis"
								loading="lazy"
								className="aspect-[0.71] h-full w-full object-cover"
							/>
							<img
								src="/home/about-coast.webp"
								alt="Le Morne and the lagoon"
								loading="lazy"
								className="h-full w-full object-cover"
							/>
						</div>
					</div>
					<ol className="mt-12 divide-y divide-ink/20 border-t border-ink/20 tablet:mt-[5vw]">
						{[
							[
								"Local knowledge.",
								"A plan is more than a list of places. Timing, travel between stops and the people behind an experience help make the day work.",
							],
							[
								"Thoughtful planning.",
								"Shape the itinerary around your interests, pace and budget, with time to enjoy what you came for.",
							],
							[
								"A human in your corner.",
								"The intended service pairs planning tools with a coordinator who checks arrangements and helps manage changes.",
							],
						].map(([title, copy], index) => (
							<li
								key={title}
								className="grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-3 py-6 tablet:grid-cols-[0.2fr_0.7fr_1.1fr] tablet:gap-8 tablet:py-8"
							>
								<span
									aria-hidden="true"
									className="text-[clamp(2rem,4.5vw,4.4rem)] leading-none font-[750] tracking-[-0.065em] text-ocean"
								>
									{String(index + 1).padStart(2, "0")}
								</span>
								<h3 className={smallTitle}>{title}</h3>
								<p className="col-start-2 max-w-[57ch] text-sm leading-relaxed tablet:col-start-3 tablet:text-base">
									{copy}
								</p>
							</li>
						))}
					</ol>
				</div>
			</section>
			<Cta lines={["Let’s talk about", "your next day."]}>
				<Link to="/contact" className={darkButton}>
					Contact us <Arrow />
				</Link>
			</Cta>
		</>
	);
}

const termsSections = [
	{ id: "at-a-glance", title: "At a glance" },
	{ id: "planning-and-confirmation", title: "Planning and confirmation" },
	{ id: "prices-and-payment", title: "Prices and payment" },
	{ id: "changes-and-cancellations", title: "Changes and cancellations" },
] as const;

const privacySections = [
	{ id: "your-information", title: "Your information" },
	{ id: "how-information-is-used", title: "How information is used" },
	{ id: "sharing-for-your-trip", title: "Sharing for your trip" },
	{ id: "your-choices", title: "Your choices" },
] as const;

const policyPages = {
	terms: {
		title: "Terms of service",
		lines: ["Terms of", "service."],
		to: "/terms",
		sections: termsSections,
	},
	privacy: {
		title: "Privacy policy",
		lines: ["Privacy", "policy."],
		to: "/privacy",
		sections: privacySections,
	},
	accessibility: {
		title: "Accessibility",
		lines: ["Access for", "everyone."],
		to: "/accessibility",
		sections: [
			{
				id: "accessibility-statement",
				title: "Accessibility statement",
				body: "The accessibility statement is awaiting review. No compliance certification is claimed in this preview.",
			},
			{ id: "using-the-website", title: "Using the website" },
			{
				id: "travel-accessibility",
				title: "Travel accessibility",
				body: "Website accessibility and activity access are different. Check the requirements for each activity before planning your day.",
			},
			{ id: "report-a-barrier", title: "Report a barrier" },
		],
	},
} as const satisfies Record<
	PolicyPage,
	{
		title: string;
		lines: readonly string[];
		to: `/${PolicyPage}`;
		sections: readonly { id: string; title: string; body?: string }[];
	}
>;

function Policy({ page }: { page: PolicyPage }) {
	const { title, lines, to, sections } = policyPages[page];
	return (
		<>
			<BlueHero lines={lines} title={title} />
			<PolicyLayout
				to={to}
				sections={sections}
				draftSubject={page === "accessibility" ? "statement" : "policy text"}
			>
				{sections.map((section) => (
					<section
						id={section.id}
						key={section.id}
						className="scroll-mt-6 py-7"
					>
						<h2 className={smallTitle}>{section.title}</h2>
						<p className="mt-4 leading-relaxed">
							{"body" in section
								? section.body
								: "Approved wording will appear here."}
						</p>
						{section.id === "report-a-barrier" && (
							<>
								<p className="leading-relaxed">
									Tell us which page or action caused difficulty. Avoid
									including sensitive information.
								</p>
								<Link
									to="/contact"
									hash="contact-form"
									className={`${blueButton} mt-5 w-full`}
								>
									Report a barrier <Arrow />
								</Link>
								<p className="mt-4 text-sm">
									The contact form is preview-only. Reports are not sent.
								</p>
							</>
						)}
						{section.id === "your-choices" && (
							<>
								<div className="mt-6 flex flex-wrap items-center gap-5">
									<Link
										to="/profile/$tab"
										params={{ tab: "privacy" }}
										className={blueButton}
									>
										Manage privacy settings <Arrow />
									</Link>
									<Link to="/contact" className={textLink}>
										Contact us <Arrow />
									</Link>
								</div>
								<p className="mt-4 text-sm">
									Account controls are separate from the public homepage’s
									browser data controls.
								</p>
							</>
						)}
						{section.id === "changes-and-cancellations" && (
							<Link to="/cancellations" className={`${textLink} mt-6`}>
								Read cancellation information <Arrow />
							</Link>
						)}
					</section>
				))}
			</PolicyLayout>
		</>
	);
}

export default function PublicPages({ page }: { page: Page }) {
	const [info, setInfo] = useState<Info>();
	const dialog = useRef<HTMLDialogElement>(null);
	function openInfo(value: Info) {
		setInfo(value);
		dialog.current?.showModal();
	}
	function footerInfo(title: string) {
		openInfo({
			title,
			body:
				title === "Browser data"
					? "This browser keeps your demo preferences, saved items and trip drafts. Clearing its site data removes those records."
					: "This information is unavailable in the current Journey Forge preview.",
		});
	}
	return (
		<>
			<a
				href="#main"
				className="fixed top-3 left-3 z-5 -translate-y-[180%] bg-sun px-4 py-[0.8rem] focus:translate-y-0"
			>
				Skip to content
			</a>
			<PublicHeader helpActive={page !== "about"} />
			<main id="main">
				{page === "about" ? (
					<About />
				) : page === "help" ? (
					<HelpCentre onInfo={openInfo} />
				) : page === "terms" ||
					page === "privacy" ||
					page === "accessibility" ? (
					<Policy page={page} />
				) : (
					<Support page={page} />
				)}
			</main>
			<PublicFooter onInfo={footerInfo} />
			<dialog
				ref={dialog}
				aria-labelledby="public-info-title"
				className="m-auto max-h-[90svh] w-[min(34rem,calc(100%-2rem))] overflow-auto bg-paper p-8 text-ink backdrop:bg-[#071b18]/68 motion-safe:open:animate-response-arrival"
			>
				<form
					method="dialog"
					className="mb-4 flex items-center justify-between gap-4"
				>
					<h2
						id="public-info-title"
						className="text-2xl font-semibold tracking-tight"
					>
						{info?.title}
					</h2>
					<button
						type="submit"
						aria-label="Close"
						className="grid size-9 shrink-0 place-items-center text-2xl"
					>
						×
					</button>
				</form>
				<p className="leading-relaxed">{info?.body}</p>
				{info?.to && (
					<Link to={info.to} className={`${textLink} mt-5`}>
						{info.link}
						<Arrow />
					</Link>
				)}
			</dialog>
		</>
	);
}
