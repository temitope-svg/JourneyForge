import { Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
	blueButton,
	box,
	field,
	lightButton,
	muted,
	section,
	textLink,
} from "./BookingLayout";
import { Icon, type IconName } from "./DashboardIcon";
import {
	type ReviewDraft,
	type ReviewStep,
	readReviewDraft,
	saveReviewDraft,
} from "./tripReviewModel";

const tripTitle = "An afternoon by the sea.";
const details: { label: string; text: string; icon: IconName }[] = [
	{ label: "Destination", text: "Mauritius · West coast", icon: "pin" },
	{ label: "Your experience", text: "Sunset sailing", icon: "waves" },
	{ label: "Trip reference", text: "JF-0914", icon: "bookmark" },
];
const ratings = [1, 2, 3, 4, 5];
const steps = ["Your review", "Partner ratings", "Review & submit"];

function Stars({
	name,
	label,
	rating,
	onChange,
	optional = false,
}: {
	name: string;
	label: string;
	rating: number;
	onChange: (value: number) => void;
	optional?: boolean;
}) {
	return (
		<fieldset aria-describedby={`${name}-help`}>
			<legend className="text-sm font-semibold">
				{label}
				{optional && (
					<span className={`${muted} ml-1 font-normal`}>(optional)</span>
				)}
			</legend>
			<div className="mt-3 flex flex-wrap gap-2.5">
				{ratings.map((value) => (
					<label
						key={value}
						className={`grid size-12 cursor-pointer place-items-center rounded-lg border hover:border-ocean hover:text-ocean has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ocean ${value <= rating ? "border-ocean bg-[#e9f3ff] text-ocean" : "border-[#c7d7ef] bg-white text-[#506582]"}`}
					>
						<input
							type="radio"
							name={name}
							value={value}
							checked={rating === value}
							onChange={() => onChange(value)}
							aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
							className="sr-only"
						/>
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="currentColor"
							className="size-6"
						>
							<path d="m12 2.5 2.7 5.9 6.5.8-4.8 4.5 1.3 6.5-5.7-3.2-5.7 3.2 1.3-6.5-4.8-4.5 6.5-.8L12 2.5Z" />
						</svg>
					</label>
				))}
			</div>
			<p id={`${name}-help`} className={`${muted} mt-3 text-xs`}>
				{rating ? `${rating} out of 5` : "Choose a rating"}
			</p>
		</fieldset>
	);
}

function Progress({ current }: { current: number }) {
	return (
		<ol
			aria-label="Review progress"
			className="grid grid-cols-3 gap-2 text-xs tablet:gap-3"
		>
			{steps.map((label, index) => (
				<li
					key={label}
					aria-current={index === current ? "step" : undefined}
					className={`border-t-2 pt-3 ${index === current ? "border-ocean font-semibold text-ocean" : `border-[#dbeaff] ${muted}`}`}
				>
					<span
						className={`mb-2 grid size-7 place-items-center rounded-full ${index === current ? "bg-ocean text-white" : "bg-[#e9f3ff]"}`}
					>
						{index < current ? (
							<Icon name="check" className="size-4" />
						) : (
							index + 1
						)}
					</span>
					{label}
				</li>
			))}
		</ol>
	);
}

function ReviewHeading({
	title,
	subtitle,
}: {
	title: string;
	subtitle: string;
}) {
	return (
		<div className="mt-8 tablet:mt-9">
			<h1 className="text-[clamp(2.2rem,4vw,3.15rem)] leading-tight font-semibold tracking-[-0.05em]">
				{title}
			</h1>
			<p className={`${muted} mt-3 leading-relaxed`}>{subtitle}</p>
		</div>
	);
}

export default function TripReview({
	email,
	step,
}: {
	email: string;
	step: ReviewStep;
}) {
	const navigate = useNavigate();
	const [draft, setDraft] = useState(() => readReviewDraft(email));
	const [notice, setNotice] = useState("");
	const [error, setError] = useState("");
	const itinerary = useRef<HTMLDialogElement>(null);

	function move(next: ReviewStep) {
		setNotice("");
		setError("");
		void navigate({ to: "/trips/review/$step", params: { step: next } });
	}

	function change(changes: Partial<ReviewDraft>) {
		setDraft((current) => ({ ...current, ...changes }));
		setNotice("");
		setError("");
	}

	function save(submitted = false) {
		const next = {
			...draft,
			highlights: draft.highlights.trim(),
			improvements: draft.improvements.trim(),
			submitted,
		};
		if (!saveReviewDraft(email, next)) {
			setError("Browser storage is unavailable. Your review is still here.");
			return;
		}
		setDraft(next);
		if (submitted) move("thank-you");
		else {
			setError("");
			setNotice("Review draft saved in this tab.");
		}
	}

	if (step === "thank-you" && !draft.submitted)
		return (
			<Navigate
				to="/trips/review/$step"
				params={{ step: "invitation" }}
				replace
			/>
		);
	if ((step === "partner" || step === "submit") && !draft.rating)
		return (
			<Navigate to="/trips/review/$step" params={{ step: "write" }} replace />
		);
	if (draft.submitted && step !== "invitation" && step !== "thank-you")
		return (
			<Navigate
				to="/trips/review/$step"
				params={{ step: "thank-you" }}
				replace
			/>
		);

	const editing = step === "write" || step === "partner" || step === "submit";

	return (
		<main className="mx-auto max-w-[100rem] px-4 pt-6 pb-14 tablet:px-8">
			<div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#dbeaff] bg-[#f3f8ff] px-4 py-3 text-xs">
				<p className="flex items-center gap-2">
					<span
						aria-hidden="true"
						className="grid size-4 place-items-center rounded-full border border-ocean text-ocean"
					>
						i
					</span>
					Sample preview
				</p>
				<p className={muted}>No live account changes</p>
			</div>
			<Link
				to="/trips"
				search={{ view: "sample" }}
				className={`${textLink} mt-7 inline-flex items-center gap-2`}
			>
				<Icon name="next" className="size-4 rotate-180" />
				Back to trips
			</Link>

			<div className="mt-6 grid items-start gap-5 desktop:grid-cols-[1.65fr_1fr]">
				<div className={`${box} min-w-0 p-5 tablet:p-[clamp(2rem,3.2vw,3rem)]`}>
					{step === "invitation" && (
						<div className="py-3">
							<p className="text-xs font-bold tracking-wider text-ocean uppercase">
								A good day, remembered
							</p>
							<h1 className="mt-5 max-w-[14ch] text-[clamp(2.55rem,4.8vw,4.5rem)] leading-[1.06] font-semibold tracking-[-0.055em]">
								A day worth remembering.
							</h1>
							<p className={`${muted} mt-4 text-lg`}>What stayed with you?</p>
							<p
								className={`${muted} mt-8 max-w-[44ch] text-sm leading-relaxed tablet:mt-11`}
							>
								Tell us about your afternoon on the water. Your feedback helps
								shape the next journey.
							</p>
							<Link
								to="/trips/review/$step"
								params={{ step: draft.submitted ? "thank-you" : "write" }}
								className={`${blueButton} mt-6`}
							>
								{draft.submitted
									? "View review confirmation"
									: "Review your trip"}
								<Icon name="next" className="size-4" />
							</Link>
						</div>
					)}

					{editing && (
						<Progress
							current={step === "write" ? 0 : step === "partner" ? 1 : 2}
						/>
					)}
					{step === "write" && (
						<form
							onSubmit={(event) => {
								event.preventDefault();
								if (!draft.rating) {
									setError("Choose an overall rating to continue.");
									const first =
										event.currentTarget.querySelector<HTMLInputElement>(
											'input[name="overall-rating"]',
										);
									first?.focus();
									return;
								}
								move("partner");
							}}
						>
							<ReviewHeading
								title="How was your day?"
								subtitle="The little things. The lasting memories."
							/>
							<div className="mt-7">
								<Stars
									name="overall-rating"
									label="Your overall experience"
									rating={draft.rating}
									onChange={(rating) => change({ rating })}
								/>
							</div>
							<div className="mt-7 grid gap-5">
								{(
									[
										{ key: "highlights", label: "What went well?" },
										{ key: "improvements", label: "What could be better?" },
									] as const
								).map(({ key, label }) => (
									<label key={key} className="block text-sm font-semibold">
										{label}
										<span className={`${muted} ml-1 font-normal`}>
											(optional)
										</span>
										<textarea
											value={draft[key]}
											onChange={(event) =>
												change({ [key]: event.target.value })
											}
											maxLength={1200}
											className={`${field} mt-2 min-h-28 py-3 font-normal leading-relaxed`}
										/>
									</label>
								))}
							</div>
							<div className="mt-6 flex flex-wrap gap-3">
								<Link
									to="/trips/review/$step"
									params={{ step: "invitation" }}
									className={lightButton}
								>
									Back
								</Link>
								<button type="submit" className={blueButton}>
									Continue <Icon name="next" className="size-4" />
								</button>
							</div>
						</form>
					)}
					{step === "partner" && (
						<>
							<ReviewHeading
								title="The people behind your day."
								subtitle="A little feedback for your sailing crew."
							/>
							<div className="mt-6 flex items-center gap-4 rounded-xl bg-[#e9f3ff] p-5">
								<Icon name="waves" className="size-7 text-ocean" />
								<div>
									<p className="font-semibold">Sailing crew</p>
									<p className={`${muted} mt-2 text-sm`}>
										Sunset sailing · West coast
									</p>
								</div>
							</div>
							<div className="mt-6">
								<Stars
									name="partner-rating"
									label="Your partner rating"
									rating={draft.partnerRating}
									onChange={(partnerRating) => change({ partnerRating })}
									optional
								/>
							</div>
							<div className="mt-7 flex flex-wrap gap-3">
								<Link
									to="/trips/review/$step"
									params={{ step: "write" }}
									className={lightButton}
								>
									Back
								</Link>
								<button
									type="button"
									className={lightButton}
									onClick={() => {
										change({ partnerRating: 0 });
										move("submit");
									}}
								>
									Skip
								</button>
								<button
									type="button"
									className={blueButton}
									onClick={() => move("submit")}
								>
									Continue <Icon name="next" className="size-4" />
								</button>
							</div>
						</>
					)}
					{step === "submit" && (
						<>
							<ReviewHeading
								title="Review & submit."
								subtitle="One last look before you finish."
							/>
							<div className="mt-6 space-y-5 rounded-xl bg-[#e9f3ff] p-5 tablet:p-6">
								<div>
									<p className="text-sm font-semibold">Overall experience</p>
									<p className="mt-2 text-lg font-semibold text-[#506582]">
										<span className="mr-1 text-4xl text-ocean">
											{draft.rating}
										</span>{" "}
										/ 5
									</p>
								</div>
								{[
									["What went well?", draft.highlights],
									["What could be better?", draft.improvements],
									[
										"Sailing crew",
										draft.partnerRating
											? `${draft.partnerRating} / 5`
											: "Not rated",
									],
								].map(([label, value]) => (
									<div key={label}>
										<p className="text-sm font-semibold">{label}</p>
										<p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap wrap-anywhere">
											{value.trim() || "No written feedback added."}
										</p>
									</div>
								))}
								<Link
									to="/trips/review/$step"
									params={{ step: "write" }}
									className={lightButton}
								>
									Edit feedback
								</Link>
							</div>
							<label className="mt-6 flex items-start gap-3 text-sm">
								<input
									type="checkbox"
									checked={draft.sharePublicly}
									onChange={(event) =>
										change({ sharePublicly: event.target.checked })
									}
									className="mt-0.5 size-5 shrink-0 accent-ocean"
								/>
								<span>
									You may share my written feedback publicly.
									<span className={`${muted} mt-2 block text-xs`}>
										Optional. Leave this unchecked to keep your words private.
									</span>
								</span>
							</label>
							<div className="mt-6 flex flex-wrap gap-3">
								<Link
									to="/trips/review/$step"
									params={{ step: "partner" }}
									className={lightButton}
								>
									Back
								</Link>
								<button
									type="button"
									className={blueButton}
									onClick={() => save(true)}
								>
									Submit sample review
								</button>
							</div>
						</>
					)}
					{editing && (
						<div className={`${section} mt-6`}>
							{error && (
								<p className="mb-4 text-sm text-red-800" role="alert">
									{error}
								</p>
							)}
							<button
								type="button"
								className={lightButton}
								onClick={() => save()}
							>
								Save draft
							</button>
							{notice && (
								<p className="mt-3 text-sm text-ocean" role="status">
									{notice}
								</p>
							)}
						</div>
					)}
					{step === "thank-you" && (
						<div className="px-3 py-3 text-center tablet:py-5">
							<span className="mx-auto grid size-16 place-items-center rounded-full bg-[#e9f3ff] text-ocean">
								<Icon name="check" className="size-7" />
							</span>
							<h1 className="mt-6 text-[clamp(1.65rem,3vw,2.4rem)] leading-tight font-semibold tracking-tight">
								Thanks for sharing your day.
							</h1>
							<p
								className={`${muted} mx-auto mt-4 max-w-[48ch] text-sm leading-relaxed`}
							>
								Your sample review is saved in this tab. No feedback has been
								sent or published.
							</p>
							<Link
								to="/trips"
								search={{ view: "sample" }}
								className={`${blueButton} mt-6`}
							>
								Return to Trips
							</Link>
						</div>
					)}
				</div>

				<aside className={`${box} p-3`} aria-label="Completed sample trip">
					<img
						src="/home/family.webp"
						alt="A family walking along a beach in Mauritius"
						className="aspect-[1.5] w-full rounded-xl object-cover"
					/>
					<div className="px-3 py-5">
						<p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#e5f7ed] px-3 py-1.5 text-xs font-medium text-[#175743]">
							<Icon name="check" className="size-4" />
							Completed · sample
						</p>
						<h2 className="mt-4 text-2xl font-semibold tracking-tight">
							{tripTitle}
						</h2>
						<p className={`${muted} mt-3 text-sm`}>
							14 September 2026 · 2 adults
						</p>
						<dl className="mt-6 divide-y divide-[#dbeaff] border-t border-[#dbeaff]">
							{details.map(({ label, text, icon }) => (
								<div key={label} className="flex items-start gap-3 py-4">
									<Icon name={icon} className="size-5 shrink-0 text-ocean" />
									<div>
										<dt className={`${muted} text-xs`}>{label}</dt>
										<dd className="mt-2 text-sm font-semibold">{text}</dd>
									</div>
								</div>
							))}
						</dl>
						<button
							type="button"
							onClick={() => itinerary.current?.showModal()}
							aria-haspopup="dialog"
							className={`${textLink} mt-6 flex w-full items-center justify-between gap-3 py-2 text-left`}
						>
							View past itinerary <Icon name="next" className="size-5" />
						</button>
					</div>
				</aside>
			</div>

			<dialog
				ref={itinerary}
				aria-labelledby="past-itinerary-title"
				className="m-auto max-h-[90svh] w-[min(34rem,calc(100%-2rem))] overflow-auto rounded-2xl border border-[#dbeaff] bg-white p-6 text-[#102040] shadow-xl backdrop:bg-[#172345]/40"
			>
				<form
					method="dialog"
					className="flex items-center justify-between gap-4"
				>
					<h2
						id="past-itinerary-title"
						className="text-2xl font-semibold tracking-tight"
					>
						{tripTitle}
					</h2>
					<button
						type="submit"
						aria-label="Close"
						className="grid size-9 place-items-center rounded-lg text-2xl hover:bg-[#e9f3ff]"
					>
						×
					</button>
				</form>
				<p className={`${muted} mt-3 text-sm`}>
					14 September 2026 · Completed sample trip
				</p>
				<ol className="mt-5 divide-y divide-[#dbeaff] border-y border-[#dbeaff] text-sm">
					<li className="py-3">
						14:00 · Meet at the west coast beach entrance
					</li>
					<li className="py-3">16:00 · Sunset sailing with the crew</li>
					<li className="py-3">18:00 · Return to shore</li>
				</ol>
			</dialog>
		</main>
	);
}
