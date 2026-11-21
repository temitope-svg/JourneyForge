import { Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { Icon } from "./DashboardIcon";
import {
	flexibleDay,
	type TripDetails,
	type TripSetupDetails,
	type TripSetupStep,
	tripDayLabel,
	tripSetupSteps,
} from "./tripDraft";

const copy = [
	["How much island time?", "Choose your dates and the days you want planned."],
	[
		"Where does each day begin?",
		"Starting points help us allow realistic travel time.",
	],
	[
		"Leave room to wander.",
		"Keep selected days open, without activities or transport.",
	],
];

const maxDays = 14;
const dayInMs = 86_400_000;
const label = "mb-2 block text-sm font-semibold";
const input =
	"min-h-12 w-full min-w-0 rounded-lg border border-[#cadbf3] bg-white px-3 text-sm disabled:bg-[#f4f7fb] disabled:text-[#506582]";
const choice =
	"flex min-h-14 cursor-pointer items-center gap-2.5 rounded-xl border border-[#dbeaff] px-4 py-2.5 text-sm font-medium has-checked:border-ocean has-checked:bg-[#e9f3ff] has-focus-visible:outline-2 has-focus-visible:outline-ocean";
const primary =
	"inline-flex min-h-12 items-center justify-center rounded-xl bg-ocean px-5 py-2 text-sm font-semibold text-white hover:bg-[#0018c9]";
const outline =
	"inline-flex min-h-12 items-center justify-center rounded-xl border border-[#c7d7ef] bg-white px-5 py-2 text-sm font-semibold hover:bg-[#e9f3ff]";

function getDays({ arrival, departure, flexible }: TripSetupDetails) {
	if (flexible) return [flexibleDay];
	if (!arrival || !departure) return [];
	const start = Date.parse(`${arrival}T00:00:00Z`);
	const end = Date.parse(`${departure}T00:00:00Z`);
	const count = (end - start) / dayInMs + 1;
	if (!Number.isInteger(count) || count < 1 || count > maxDays) return [];
	return Array.from({ length: count }, (_, index) =>
		new Date(start + index * dayInMs).toISOString().slice(0, 10),
	);
}

function initialize(details: TripDetails): TripSetupDetails {
	const saved = details.setup;
	return {
		arrival: details.date,
		departure: saved?.arrival === details.date ? saved.departure : details.date,
		flexible: details.flexible,
		selection: saved?.selection ?? "all",
		selected: saved?.selected ?? [],
		sameStart: saved?.sameStart ?? false,
		sharedStart: saved?.sharedStart ?? details.start,
		starts: saved?.starts ?? {},
		freeDays:
			saved?.freeDays.filter((day) => saved.selected.includes(day)) ?? [],
	};
}

export default function TripSetup({
	step,
	details,
	onSave,
}: {
	step: TripSetupStep;
	details: TripDetails;
	onSave: (setup: TripSetupDetails) => boolean;
}) {
	const navigate = useNavigate();
	const [setup, setSetup] = useState(() => initialize(details));
	const [error, setError] = useState("");
	const index = tripSetupSteps.indexOf(step);
	const days = getDays(setup);
	const selected =
		setup.selection === "all" || setup.flexible
			? days
			: days.filter((day) => setup.selected.includes(day));

	function change(changes: Partial<TripSetupDetails>) {
		setSetup((current) => ({ ...current, ...changes }));
		setError("");
	}

	function move(next: TripSetupStep) {
		setError("");
		void navigate({ to: "/trips/setup/$step", params: { step: next } });
	}

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!days.length) {
			setError(
				!setup.arrival || !setup.departure
					? "Choose an arrival and departure date, or make your dates flexible."
					: setup.departure < setup.arrival
						? "Departure must be on or after arrival."
						: `Choose a trip of up to ${maxDays} days.`,
			);
			return;
		}
		if (index === 0 && !selected.length) {
			setError("Choose at least one day to plan.");
			return;
		}
		if (index < tripSetupSteps.length - 1) {
			move(tripSetupSteps[index + 1]);
			return;
		}

		const starts = Object.fromEntries(
			selected.flatMap((day) => {
				const startingPoint = setup.starts[day];
				return startingPoint === undefined ? [] : [[day, startingPoint.trim()]];
			}),
		);
		if (
			onSave({
				...setup,
				arrival: setup.flexible ? "" : setup.arrival,
				departure: setup.flexible ? "" : setup.departure,
				selected,
				sharedStart: setup.sharedStart.trim(),
				starts,
				freeDays: days.filter(
					(day) => !selected.includes(day) || setup.freeDays.includes(day),
				),
			})
		) {
			void navigate({ to: "/trips/plan", replace: true });
		} else {
			setError(
				"Your day preferences could not be saved to browser storage. You can retry here.",
			);
		}
	}

	return (
		<main className="mx-auto max-w-[84rem] px-4 pt-6 pb-16 tablet:px-8 tablet:pt-8">
			<Link
				to="/trips/plan"
				className="inline-flex items-center gap-2 text-sm text-ocean underline underline-offset-2"
			>
				<Icon name="next" className="size-4 rotate-180" /> Back to your details
			</Link>

			<div className="mx-auto mt-7 max-w-[57.5rem] rounded-2xl border border-[#dbeaff] bg-white p-5 tablet:mt-8 tablet:p-8">
				<div className="grid grid-cols-3 gap-2" aria-hidden="true">
					{tripSetupSteps.map((item, i) => (
						<div
							key={item}
							className={`h-1 ${i <= index ? "bg-ocean" : "bg-[#dbeaff]"}`}
						/>
					))}
				</div>
				<p className="mt-6 text-sm">
					Step {index + 1} of {tripSetupSteps.length}
				</p>
				<h1 className="mt-5 text-[clamp(2rem,3.5vw,3.2rem)] leading-tight font-semibold tracking-[-0.045em]">
					{copy[index][0]}
				</h1>
				<p className="mt-3 text-sm leading-relaxed text-[#506582] tablet:text-base">
					{copy[index][1]}
				</p>

				<form className="mt-7" onSubmit={submit}>
					{step === "dates" ? (
						<>
							<div className="grid gap-4 tablet:grid-cols-2 tablet:gap-5">
								<label className="text-sm font-semibold">
									Arrival
									<input
										type="date"
										value={setup.arrival}
										disabled={setup.flexible}
										onChange={(event) => {
											const arrival = event.target.value;
											change({
												arrival,
												departure:
													!setup.departure ||
													setup.departure === setup.arrival ||
													setup.departure < arrival
														? arrival
														: setup.departure,
											});
										}}
										className={`${input} mt-2 block`}
									/>
								</label>
								<label className="text-sm font-semibold">
									Departure
									<input
										type="date"
										value={setup.departure}
										disabled={setup.flexible}
										onChange={(event) =>
											change({ departure: event.target.value })
										}
										className={`${input} mt-2 block`}
									/>
								</label>
							</div>
							<label className="mt-5 flex w-fit cursor-pointer items-center gap-2 text-sm font-medium">
								<input
									type="checkbox"
									checked={setup.flexible}
									onChange={(event) =>
										change({ flexible: event.target.checked })
									}
									className="size-4 accent-ocean"
								/>
								My dates are flexible (one sample day)
							</label>
							{!setup.flexible && (
								<fieldset
									className="mt-2 grid gap-3 tablet:grid-cols-2"
									aria-label="Days to plan"
								>
									<label className={choice}>
										<input
											type="radio"
											name="plan-days"
											checked={setup.selection === "all"}
											onChange={() => change({ selection: "all" })}
											className="size-4 accent-ocean"
										/>
										Plan every day
									</label>
									<label className={choice}>
										<input
											type="radio"
											name="plan-days"
											checked={setup.selection === "custom"}
											onChange={() =>
												change({ selection: "custom", selected: days })
											}
											className="size-4 accent-ocean"
										/>
										Choose days
									</label>
								</fieldset>
							)}
							{days.length > 0 && (
								<fieldset
									className="mt-5 grid gap-3 tablet:grid-cols-3"
									aria-label="Trip dates"
								>
									{days.map((day) => (
										<label
											key={day}
											className={`${choice} has-disabled:cursor-default`}
										>
											<input
												type="checkbox"
												checked={selected.includes(day)}
												disabled={setup.selection === "all" || setup.flexible}
												onChange={(event) =>
													change({
														selected: event.target.checked
															? [...setup.selected, day]
															: setup.selected.filter((item) => item !== day),
													})
												}
												className="size-4 accent-ocean"
											/>
											{tripDayLabel(day)}
										</label>
									))}
								</fieldset>
							)}
							<p className="mt-5 rounded-xl bg-[#e9f3ff] p-4 text-sm leading-relaxed">
								Up to {maxDays} days in this prototype. You can leave days free
								in step 3. If you change the date range, review the new days
								before saving.
							</p>
						</>
					) : !selected.length ? (
						<p className="rounded-xl bg-[#e9f3ff] p-4 text-sm">
							Set your dates and choose at least one day to plan first.
						</p>
					) : step === "starting-points" ? (
						<>
							<label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-medium">
								<input
									type="checkbox"
									checked={setup.sameStart}
									onChange={(event) =>
										change({ sameStart: event.target.checked })
									}
									className="size-4 accent-ocean"
								/>
								Use the same starting point every day
							</label>
							{setup.sameStart ? (
								<div className="mt-5">
									<label htmlFor="shared-start" className={label}>
										Starting point
									</label>
									<input
										id="shared-start"
										value={setup.sharedStart}
										onChange={(event) =>
											change({ sharedStart: event.target.value })
										}
										maxLength={160}
										placeholder="Your hotel or area in Mauritius"
										className={input}
									/>
								</div>
							) : (
								<div className="divide-y divide-[#dbeaff] border-b border-[#dbeaff]">
									{selected.map((day) => (
										<label
											key={day}
											className="grid items-center gap-3 py-5 text-sm font-semibold tablet:grid-cols-[9rem_1fr]"
										>
											{tripDayLabel(day)}
											<input
												value={setup.starts[day] ?? details.start}
												onChange={(event) =>
													change({
														starts: {
															...setup.starts,
															[day]: event.target.value,
														},
													})
												}
												maxLength={160}
												placeholder="Your hotel or area in Mauritius"
												className={`${input} font-normal`}
											/>
										</label>
									))}
								</div>
							)}
						</>
					) : (
						<>
							<div className="divide-y divide-[#dbeaff] border-b border-[#dbeaff]">
								{selected.map((day) => (
									<fieldset
										key={day}
										aria-label={tripDayLabel(day)}
										className="grid min-w-0 items-center gap-3 py-5 first:pt-0 tablet:grid-cols-[9rem_1fr_1fr]"
									>
										<p className="text-sm font-semibold">{tripDayLabel(day)}</p>
										<label className={choice}>
											<input
												type="radio"
												name={`free-${day}`}
												checked={!setup.freeDays.includes(day)}
												onChange={() =>
													change({
														freeDays: setup.freeDays.filter(
															(item) => item !== day,
														),
													})
												}
												className="size-4 accent-ocean"
											/>
											Planned
										</label>
										<label className={choice}>
											<input
												type="radio"
												name={`free-${day}`}
												checked={setup.freeDays.includes(day)}
												onChange={() =>
													change({ freeDays: [...setup.freeDays, day] })
												}
												className="size-4 accent-ocean"
											/>
											Free day
										</label>
									</fieldset>
								))}
							</div>
							<p className="mt-5 rounded-xl bg-[#e9f3ff] p-4 text-sm leading-relaxed">
								Free days keep draft activities hidden for later and add no
								estimated activity, transport or coordination costs.
							</p>
						</>
					)}

					{error && (
						<p role="alert" className="mt-4 text-sm text-red-800">
							{error}
						</p>
					)}
					<div className="mt-6 flex flex-wrap gap-3">
						{index === 0 ? (
							<Link to="/trips/plan" className={outline}>
								Cancel
							</Link>
						) : (
							<button
								type="button"
								className={outline}
								onClick={() => move(tripSetupSteps[index - 1])}
							>
								Back
							</button>
						)}
						{index > 0 && !selected.length ? (
							<button
								type="button"
								className={primary}
								onClick={() => move("dates")}
							>
								Set dates
							</button>
						) : (
							<button type="submit" className={primary}>
								{step === "free-days" ? "Save day preferences" : "Continue"}
							</button>
						)}
					</div>
				</form>
			</div>
		</main>
	);
}
