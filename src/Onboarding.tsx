import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Arrow } from "./Arrow";
import { inputStyle, textButton } from "./accountStyles";
import { getDemoSession } from "./demoAuth";
import {
	travelStyles as companions,
	interests,
	languages,
	readDemoProfile,
	saveDemoProfile,
} from "./profileModel";

export const steps = ["interests", "travel", "preferences"] as const;
type Step = (typeof steps)[number];
const titles = [
	"What pulls you outside?",
	"Who’s coming along?",
	"The little things that matter.",
];
const descriptions = [
	"Pick the things you love. As many as you like.",
	"How do you usually travel? There’s no wrong company.",
	"A few preferences to make each day feel more like you.",
];
const icons = [
	"M4 3v5a3 3 0 0 0 6 0V3M7 3v18M17 3c-2 3-3 5-3 10h5M19 3v18",
	"M2 13a10 10 0 0 1 20 0H2Zm10 0v6a2 2 0 0 0 4 0M8 13c0-4 2-9 4-10m4 10c0-4-2-9-4-10",
	"M4 20C2 10 8 4 20 4c0 12-6 18-14 15m-3 2L15 9",
	"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm4 5-2 6-6 2 2-6 6-2Z",
	"M2 8l10-5 10 5H2Zm2 12h16M3 17h18M6 8v9m6-9v9m6-9v9",
	"M12 20c-6 0-9-3-10-7 4 0 7 2 10 7Zm0 0c6 0 9-3 10-7-4 0-7 2-10 7Zm0 0c-5-6-5-11 0-16 5 5 5 10 0 16Z",
	"M12 20 4 12a5 5 0 0 1 8-6 5 5 0 0 1 8 6l-8 8Z",
	"M3 11 12 3l9 8v10h-6v-6H9v6H3V11Z",
	"M20 15A9 9 0 1 1 9 4a8 8 0 0 0 11 11Zm-3-12v6m-3-3h6",
	"M12 2 22 12 12 22 2 12 12 2Z",
	"M5 21a7 7 0 0 1 14 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
	"M2 21a7 7 0 0 1 14 0M9 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 1a6 6 0 0 1 5 6M16 5a4 4 0 0 1 0 8",
	"M7 21a5 5 0 0 1 10 0m-5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 15a5 5 0 0 1 4-5m0 0a3 3 0 1 1 2-5m14 10a5 5 0 0 0-4-5m0 0a3 3 0 1 0-2-5",
	"M2 20a5 5 0 0 1 10 0m0 0a5 5 0 0 1 10 0M7 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 6a3 3 0 1 1 6 0m6 0a3 3 0 1 1 6 0",
];

function ChoiceIcon({ index }: { index: number }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-7 text-ocean"
		>
			<path d={icons[index]} />
		</svg>
	);
}

const optionCard =
	"flex cursor-pointer flex-col justify-between gap-5 border border-transparent bg-white p-3.5 text-sm font-medium hover:border-ocean/50 has-checked:border-ocean has-checked:bg-ocean/5 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ocean";
const primary =
	"group inline-flex min-h-14 items-center justify-between gap-8 bg-ocean px-5 py-3 text-sm font-bold text-white hover:bg-[#0018c9]";
const textareaStyle = `${inputStyle} min-h-[6.75rem] py-3.5 placeholder:text-ink/60`;

export default function Onboarding({ step }: { step: Step }) {
	const navigate = useNavigate();
	const index = steps.indexOf(step);
	const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
	const [companion, setCompanion] = useState("");
	const [accessibility, setAccessibility] = useState("");
	const [language, setLanguage] = useState("");
	const [diet, setDiet] = useState("");
	const [updates, setUpdates] = useState(false);
	const [saveError, setSaveError] = useState("");

	function finishSetup() {
		const email = getDemoSession();
		if (!email) {
			void navigate({ to: "/sign-in" });
			return;
		}
		const profile = readDemoProfile(email);
		const saved = saveDemoProfile(email, {
			...profile,
			interests: interests.filter((item) => selectedInterests.includes(item)),
			travelStyle: companions.find((item) => item === companion) ?? "",
			diet,
			accessibility,
			language: languages.find((item) => item === language) ?? profile.language,
		});
		if (saved) void navigate({ to: "/dashboard" });
		else
			setSaveError(
				"Preferences couldn’t be stored. You can retry or skip setup.",
			);
	}

	function toggleInterest(interest: string, checked: boolean) {
		setSelectedInterests((selected) =>
			checked
				? [...selected, interest]
				: selected.filter((item) => item !== interest),
		);
	}

	return (
		<main className="min-h-svh bg-paper p-3 tablet:p-[clamp(1.5rem,2.5vw,2.5rem)]">
			<div className="mx-auto grid min-h-[calc(100svh-5vw)] max-w-[100rem] bg-white p-3 desktop:grid-cols-[65%_35%] desktop:p-4">
				<div className="flex min-w-0 flex-col px-[clamp(0.7rem,3.6vw,3.25rem)] py-[clamp(1rem,2.4vw,2.25rem)]">
					<header className="flex items-center justify-between gap-4">
						<Link to="/" aria-label="Journey Forge home">
							<img
								src="/home/brand-dark.png"
								alt=""
								width="136"
								height="69"
								className="h-auto w-[clamp(6rem,9vw,8rem)]"
							/>
						</Link>
						<Link to="/dashboard" className={`${textButton} text-sm`}>
							Skip setup
						</Link>
					</header>
					<div className="mt-8">
						<div className="flex gap-2" aria-hidden="true">
							{steps.map((item, i) => (
								<span
									key={item}
									className={`h-1.5 w-9 ${i === index ? "bg-ocean" : i < index ? "bg-ink" : "bg-[#c8d0c9]"}`}
								/>
							))}
						</div>
						<p className="mt-3 text-xs text-ink/75">
							Step {index + 1} of {steps.length}
						</p>
					</div>
					<h1 className="mt-6 text-[clamp(2rem,3.35vw,3.25rem)] leading-tight font-[750] tracking-[-0.055em] text-ocean">
						{titles[index]}
					</h1>
					<p className="mt-4 text-sm leading-relaxed text-ink/75">
						{descriptions[index]}
					</p>
					{step === "interests" && (
						<fieldset className="mt-8 grid min-w-0 grid-cols-2 gap-3 bg-paper p-3 tablet:grid-cols-5 tablet:p-4">
							<legend className="sr-only">Interests</legend>
							{interests.map((interest, i) => (
								<label key={interest} className={`${optionCard} min-h-28`}>
									<span className="flex items-start justify-between gap-2">
										<ChoiceIcon index={i} />
										<input
											type="checkbox"
											checked={selectedInterests.includes(interest)}
											onChange={(event) =>
												toggleInterest(interest, event.target.checked)
											}
											className="size-[1.15rem] shrink-0 accent-ocean"
										/>
									</span>
									{interest}
								</label>
							))}
						</fieldset>
					)}
					{step === "travel" && (
						<div className="mt-8">
							<fieldset className="grid min-w-0 grid-cols-2 gap-3 bg-paper p-3 tablet:grid-cols-4 tablet:p-4">
								<legend className="sr-only">Travel companions</legend>
								{companions.map((option, i) => (
									<label
										key={option}
										className={`${optionCard} min-h-[7.5rem] desktop:min-h-[9.75rem]`}
									>
										<span className="flex items-start justify-between gap-2">
											<ChoiceIcon index={interests.length + i} />
											<input
												type="radio"
												name="companion"
												checked={companion === option}
												onChange={() => setCompanion(option)}
												className="size-[1.15rem] shrink-0 accent-ocean"
											/>
										</span>
										{option}
									</label>
								))}
							</fieldset>
							<div className="mt-4 text-right">
								<button
									type="button"
									className={`${textButton} text-sm text-ocean`}
									onClick={() => setCompanion("")}
								>
									Clear choice
								</button>
							</div>
							<div className="mt-8">
								<label
									htmlFor="accessibility"
									className="mb-2 block text-sm font-semibold"
								>
									Accessibility or mobility needs{" "}
									<span className="font-normal text-ink/75">(optional)</span>
								</label>
								<textarea
									id="accessibility"
									className={textareaStyle}
									maxLength={1200}
									value={accessibility}
									onChange={(event) => setAccessibility(event.target.value)}
									placeholder="Anything that helps make the day work for you."
									aria-describedby="accessibility-hint"
								/>
								<p id="accessibility-hint" className="mt-2 text-xs text-ink/75">
									Share only what you’re comfortable sharing.
								</p>
							</div>
						</div>
					)}
					{step === "preferences" && (
						<div className="mt-8">
							<label
								htmlFor="preferred-language"
								className="mb-2 block text-sm font-semibold"
							>
								Preferred language{" "}
								<span className="font-normal text-ink/75">(optional)</span>
							</label>
							<select
								id="preferred-language"
								className={`${inputStyle} pr-8`}
								value={language}
								onChange={(event) => setLanguage(event.target.value)}
							>
								<option value="">Choose a language</option>
								<option>English</option>
								<option>French</option>
								<option>Portuguese</option>
								<option>Japanese</option>
								<option>Spanish</option>
								<option>Other</option>
							</select>
							<label
								htmlFor="dietary-needs"
								className="mt-5 mb-2 block text-sm font-semibold"
							>
								Dietary needs{" "}
								<span className="font-normal text-ink/75">(optional)</span>
							</label>
							<textarea
								id="dietary-needs"
								className={textareaStyle}
								maxLength={1200}
								value={diet}
								onChange={(event) => setDiet(event.target.value)}
								placeholder="Food preferences or allergies you’d like us to know about."
							/>
							<label className="mt-5 flex cursor-pointer items-start gap-3.5 border-y border-ink/20 px-1 py-4">
								<input
									type="checkbox"
									checked={updates}
									onChange={(event) => setUpdates(event.target.checked)}
									className="mt-0.5 size-[1.2rem] shrink-0 accent-ocean"
								/>
								<span className="text-sm font-medium">
									Email me trip updates
									<span className="mt-2 block text-xs font-normal text-ink/75">
										Plans, reminders and changes to my trips.
									</span>
								</span>
							</label>
						</div>
					)}
					<div className="mt-auto flex flex-wrap gap-3.5 pt-9">
						{index > 0 && (
							<Link
								to="/onboarding/$step"
								params={{ step: steps[index - 1] }}
								className="inline-flex min-h-14 items-center justify-center border border-ink/25 px-7 text-sm font-medium hover:bg-paper"
							>
								Back
							</Link>
						)}
						{step === "preferences" ? (
							<button type="button" className={primary} onClick={finishSetup}>
								Start exploring <Arrow />
							</button>
						) : (
							<Link
								to="/onboarding/$step"
								params={{ step: steps[index + 1] }}
								className={`${primary} min-w-[10.9rem]`}
							>
								Continue <Arrow />
							</Link>
						)}
					</div>{" "}
					{saveError && (
						<p role="alert" className="mt-4 text-sm text-red-800">
							{saveError}
						</p>
					)}
					<footer className="mt-8 flex justify-between gap-4 pb-4 text-xs text-ink/75">
						<span>© 2026 Journey Forge</span>
						<Link to="/" hash="help" className={textButton}>
							Need a hand?
						</Link>
					</footer>
				</div>

				<aside
					className="hidden flex-col justify-end bg-[#0a2229] bg-hero bg-cover bg-center p-[clamp(1.5rem,2.2vw,2.5rem)] text-white desktop:flex"
					aria-label="Journey Forge"
				>
					<p className="text-[clamp(2.35rem,3.55vw,3.5rem)] leading-[1.04] font-[750] tracking-[-0.06em]">
						Your kind of
						<br />
						good day.
						<br />
						<span className="text-sun">Starts here.</span>
					</p>
					<p className="mt-5 text-sm leading-relaxed">
						Follow your curiosity.
						<br />
						We’ll take it from there.
					</p>
					<Link
						to="/"
						hash="destinations"
						className="group mt-8 flex items-center justify-between border-t border-white/40 pt-5 text-sm font-semibold hover:text-sun"
					>
						Keep exploring <Arrow />
					</Link>
				</aside>
			</div>
		</main>
	);
}
