import { Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useRef, useState } from "react";
import { Icon, type IconName } from "./DashboardIcon";
import { defaultTripDetails, type TripDetails } from "./tripDraft";

const card = "rounded-2xl border border-[#dbeaff] bg-white";
const input =
	"min-h-12 w-full rounded-[0.65rem] border border-[#92a5c1] bg-white px-3 text-sm placeholder:text-[#506582]";
const label = "mb-2 block text-sm font-semibold";
const primary =
	"inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-ocean px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0018c9]";
const transportOptions = [
	{ value: "yes", label: "Yes, please", summary: "Transport requested" },
	{ value: "no", label: "No, thanks", summary: "I’ll arrange transport" },
	{ value: "unsure", label: "Not sure", summary: "To be decided" },
] as const;
function Count({
	name,
	value,
	min,
	onChange,
}: {
	name: string;
	value: number;
	min: number;
	onChange: (value: number) => void;
}) {
	return (
		<div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-1 gap-y-2 px-2">
			<span className="text-xs">{name}</span>
			<div className="flex items-center gap-2">
				<button
					type="button"
					aria-label={`Remove one: ${name}`}
					disabled={value <= min}
					onClick={() => onChange(value - 1)}
					className="grid size-7 place-items-center rounded-full bg-[#e9f3ff] text-lg text-ocean disabled:cursor-not-allowed disabled:opacity-40"
				>
					−
				</button>
				<output
					aria-label={name}
					className="min-w-2 text-center text-sm tabular-nums"
				>
					{value}
				</output>
				<button
					type="button"
					aria-label={`Add one: ${name}`}
					onClick={() => onChange(value + 1)}
					className="grid size-7 place-items-center rounded-full bg-[#e9f3ff] text-lg text-ocean"
				>
					+
				</button>
			</div>
		</div>
	);
}

export default function TripPlanner({
	initialIdea,
	initialDetails,
	onSave,
}: {
	initialIdea: string;
	initialDetails?: TripDetails;
	onSave: (idea: string, details: TripDetails) => boolean;
}) {
	const navigate = useNavigate();
	const [idea, setIdea] = useState(initialIdea);
	const [details, setDetails] = useState(initialDetails ?? defaultTripDetails);
	const [notice, setNotice] = useState("");
	const ideaInput = useRef<HTMLTextAreaElement>(null);

	function change<K extends keyof TripDetails>(key: K, value: TripDetails[K]) {
		setDetails((current) => ({ ...current, [key]: value }));
		setNotice("");
	}

	function updateIdea(value: string) {
		setIdea(value);
		setNotice("");
	}

	function save(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setNotice(
			onSave(idea.trim(), details)
				? "Draft saved. Find it under Saved → Draft plans."
				: "Browser storage is unavailable. Your draft is here for this visit.",
		);
	}

	function continuePlanning(
		form: HTMLFormElement | null,
		next: "setup" | "generate",
	) {
		if (!form?.reportValidity()) return;
		if (!onSave(idea.trim(), details)) {
			setNotice(
				"Browser storage is unavailable. Your draft is here for this visit.",
			);
			return;
		}
		if (next === "setup") {
			void navigate({ to: "/trips/setup/$step", params: { step: "dates" } });
		} else {
			void navigate({ to: "/trips/generating" });
		}
	}

	const travellers = `${details.adults} ${details.adults === 1 ? "adult" : "adults"}${details.children ? `, ${details.children} ${details.children === 1 ? "child" : "children"}` : ""}`;
	const summary: { title: string; value: string; icon: IconName }[] = [
		{ title: "Destination", value: "Mauritius", icon: "pin" },
		{ title: "Travellers", value: travellers, icon: "people" },
		{
			title: "Budget",
			value: details.budget
				? `MUR ${Number(details.budget).toLocaleString("en")}`
				: "Up to you",
			icon: "wallet",
		},
		{
			title: "Transport",
			value:
				transportOptions.find(({ value }) => value === details.transport)
					?.summary ?? "To be decided",
			icon: "car",
		},
	];

	return (
		<main className="mx-auto max-w-[100rem] px-4 pt-6 pb-9 tablet:px-8 tablet:pt-8">
			<Link
				to="/dashboard"
				className="inline-flex items-center gap-2 text-sm text-ocean hover:underline"
			>
				<Icon name="next" className="size-4 rotate-180" /> Back to dashboard
			</Link>
			<header className="mt-6 flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-[clamp(2.2rem,3.5vw,3.25rem)] leading-tight font-semibold tracking-[-0.045em]">
						Let’s make it your day.
					</h1>
					<p className="mt-2 text-lg text-[#506582] tablet:text-[1.35rem]">
						A few details. A day that feels like you.
					</p>
				</div>
				<p className="inline-flex items-center gap-2.5 text-sm text-ocean">
					<span className="grid size-8 place-items-center rounded-full bg-ocean text-white">
						1
					</span>
					Your day
				</p>
			</header>

			<div className="mt-7 grid items-start gap-5 desktop:grid-cols-[1.85fr_1fr]">
				<form className={`${card} p-5 tablet:p-7`} onSubmit={save}>
					<label
						htmlFor="planner-idea"
						className="block text-[1.7rem] leading-tight font-semibold tracking-tight"
					>
						What are you dreaming of?
					</label>
					<textarea
						id="planner-idea"
						ref={ideaInput}
						value={idea}
						maxLength={1200}
						onChange={(event) => updateIdea(event.target.value)}
						placeholder="A slow day on the west coast, with good food, a quiet beach and a sunset for two."
						className="mt-3 block min-h-28 w-full rounded-[0.65rem] border border-[#dbeaff] bg-[#e9f3ff] p-4 text-sm leading-relaxed placeholder:text-[#506582]"
					/>
					<div className="mt-3 flex flex-wrap gap-3">
						{(
							[
								{
									title: "Slow & sunny",
									icon: "sun",
									idea: "A slow day on the west coast, with good food, a quiet beach and a sunset for two.",
								},
								{
									title: "Adventure",
									icon: "mountain",
									idea: "An outdoor day in Mauritius with scenic trails, a waterfall and a stop for local food.",
								},
							] as const
						).map((mood) => (
							<button
								type="button"
								key={mood.title}
								onClick={() => {
									updateIdea(mood.idea);
									ideaInput.current?.focus();
								}}
								className="inline-flex min-h-12 items-center gap-2.5 rounded-[0.65rem] border border-[#b4c8e8] px-4 text-sm font-medium hover:bg-[#e9f3ff]"
							>
								<Icon name={mood.icon} className="size-6 text-ocean" />
								{mood.title}
							</button>
						))}
					</div>

					<h2 className="mt-6 text-[1.7rem] leading-tight font-semibold tracking-tight">
						The essentials
					</h2>
					<div className="mt-4 grid gap-x-6 gap-y-6 tablet:grid-cols-2">
						<div>
							<label htmlFor="planner-date" className={label}>
								When
							</label>
							<input
								id="planner-date"
								type="date"
								value={details.date}
								disabled={details.flexible}
								onChange={(event) => change("date", event.target.value)}
								className={`${input} disabled:bg-[#f4f7fb] disabled:text-[#506582]`}
							/>
							<label className="mt-2 flex items-center gap-2 text-xs text-[#506582]">
								<input
									type="checkbox"
									checked={details.flexible}
									onChange={(event) => change("flexible", event.target.checked)}
									className="size-4 accent-ocean"
								/>
								My dates are flexible
							</label>
						</div>

						<fieldset className="min-w-0">
							<legend className={label}>Who’s coming?</legend>
							<div className="flex min-h-12 divide-x divide-[#dbeaff] rounded-[0.65rem] border border-[#92a5c1] py-1.5">
								<Count
									name="Adults"
									min={1}
									value={details.adults}
									onChange={(value) => change("adults", value)}
								/>
								<Count
									name="Children"
									min={0}
									value={details.children}
									onChange={(value) => change("children", value)}
								/>
							</div>
						</fieldset>

						<div>
							<label htmlFor="planner-budget" className={label}>
								Total budget
							</label>
							<div className="flex items-center rounded-[0.65rem] border border-[#92a5c1] focus-within:border-ocean">
								<input
									id="planner-budget"
									type="number"
									min={0}
									step={1}
									inputMode="numeric"
									value={details.budget}
									onChange={(event) => change("budget", event.target.value)}
									placeholder="12,000"
									aria-describedby="planner-budget-hint"
									className="min-h-12 w-full min-w-0 rounded-l-[0.65rem] px-3 text-sm placeholder:text-[#506582]"
								/>
								<span className="self-stretch border-l border-[#92a5c1] px-4 py-4 text-xs text-[#506582]">
									MUR
								</span>
							</div>
							<p
								id="planner-budget-hint"
								className="mt-2 text-xs text-[#506582]"
							>
								For your whole group
							</p>
						</div>

						<fieldset className="min-w-0">
							<legend className={label}>Transport</legend>
							<div className="grid min-h-12 grid-cols-3 divide-x divide-[#92a5c1] rounded-[0.65rem] border border-[#92a5c1]">
								{transportOptions.map(({ value, label: text }) => (
									<label
										key={value}
										className="relative grid cursor-pointer place-items-center px-1.5 py-2 text-center text-xs first:rounded-l-[0.6rem] last:rounded-r-[0.6rem] has-checked:bg-ocean has-checked:text-white has-focus-visible:z-10 has-focus-visible:outline-2 has-focus-visible:outline-ocean"
									>
										<input
											type="radio"
											name="transport"
											value={value}
											checked={details.transport === value}
											onChange={() => change("transport", value)}
											className="sr-only"
										/>
										{text}
									</label>
								))}
							</div>
						</fieldset>

						<div className="tablet:col-span-2">
							<label htmlFor="planner-start" className={label}>
								Where will your day start?
							</label>
							<div className="relative">
								<Icon
									name="pin"
									className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ocean"
								/>
								<input
									id="planner-start"
									value={details.start}
									onChange={(event) => change("start", event.target.value)}
									maxLength={160}
									placeholder="Your hotel or area in Mauritius"
									className={`${input} pl-11`}
								/>
							</div>
						</div>
					</div>

					<details className="group mt-6 rounded-xl border border-[#dbeaff]">
						<summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
							<Icon name="heart" className="size-5 text-ocean" />
							<span className="flex-1 text-sm font-semibold">
								A few personal touches
								<span className="mt-1 block text-xs font-normal text-[#506582]">
									Food, interests and accessibility
								</span>
							</span>
							<span
								aria-hidden="true"
								className="size-2 rotate-45 border-r border-b text-ocean group-open:rotate-[225deg]"
							/>
						</summary>
						<div className="grid gap-4 border-t border-[#dbeaff] p-4">
							{(
								[
									{ key: "food", label: "Food or dietary needs" },
									{ key: "interests", label: "Interests" },
									{
										key: "accessibility",
										label: "Accessibility or mobility needs",
									},
								] as const
							).map(({ key, label: text }) => (
								<label key={key} className="text-sm font-medium">
									{text}
									<textarea
										value={details[key]}
										maxLength={600}
										onChange={(event) => change(key, event.target.value)}
										className={`${input} mt-2 block min-h-16 py-2`}
									/>
								</label>
							))}
						</div>
					</details>

					<div className="mt-6 flex flex-wrap items-center justify-between gap-4">
						<button
							type="submit"
							className="py-2 text-sm font-semibold text-ocean hover:underline"
						>
							Save for later
						</button>
						<button
							type="button"
							onClick={(event) =>
								continuePlanning(event.currentTarget.form, "setup")
							}
							className="py-2 text-sm font-semibold text-ocean hover:underline"
						>
							Set up trip dates
						</button>
						<button
							type="button"
							onClick={(event) =>
								continuePlanning(event.currentTarget.form, "generate")
							}
							className={primary}
						>
							Review sample itinerary <Icon name="next" className="size-4" />
						</button>
					</div>
					{details.setup &&
						details.setup.arrival === details.date &&
						details.setup.flexible === details.flexible && (
							<p className="mt-3 text-sm text-[#506582]">
								Day preferences saved ·{" "}
								{
									details.setup.selected.filter(
										(day) => !details.setup?.freeDays.includes(day),
									).length
								}{" "}
								planned · {details.setup.freeDays.length} free
							</p>
						)}
					{notice && (
						<p className="mt-3 text-sm text-ocean" role="status">
							{notice}
						</p>
					)}
					<p className="mt-3 text-right text-xs leading-relaxed text-[#506582]">
						Explore an editable sample. Live generation and booking aren’t
						connected yet.
					</p>
				</form>

				<aside className={`${card} p-3`} aria-labelledby="planner-summary">
					<div className="relative overflow-hidden rounded-xl">
						<img
							src="/dashboard/west-coast.webp"
							alt="The coast of Mauritius and Le Morne mountain"
							className="aspect-[1.55] w-full object-cover"
						/>
						<span className="absolute bottom-4 left-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-2 text-xs">
							<Icon name="pin" className="size-4" /> Mauritius
						</span>
					</div>
					<div className="p-3">
						<h2
							id="planner-summary"
							className="mt-2 text-[1.7rem] leading-tight font-semibold tracking-tight"
						>
							Your day, taking shape.
						</h2>
						<dl className="mt-4 divide-y divide-[#dbeaff]">
							{summary.map(({ title, value, icon }) => (
								<div key={title} className="flex items-center gap-4 py-4">
									<span className="grid size-13 shrink-0 place-items-center rounded-full bg-[#e9f3ff] text-ocean">
										<Icon name={icon} />
									</span>
									<div>
										<dt className="text-sm text-[#506582]">{title}</dt>
										<dd className="mt-1 font-semibold">{value}</dd>
									</div>
								</div>
							))}
						</dl>
						<p className="mt-5 flex items-center gap-4 rounded-xl bg-[#e9f3ff] p-4 text-sm leading-relaxed text-[#506582]">
							<Icon name="sun" className="size-7 shrink-0 text-ocean" />
							<span>
								A little less rushing.
								<br />A little more living.
							</span>
						</p>
					</div>
				</aside>
			</div>
		</main>
	);
}
