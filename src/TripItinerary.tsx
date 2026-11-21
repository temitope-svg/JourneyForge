import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./DashboardIcon";
import {
	type ChangeRow,
	MoveActivity,
	RemoveActivity,
	ReviewChange,
	RevisePlan,
} from "./ItineraryChangeForms";
import {
	canSchedule,
	lowerCostActivities,
	scheduleDay,
	timeLabel,
} from "./itineraryChanges";
import {
	activities,
	currency,
	type DayActivity,
	type ItineraryEdits,
	itineraryDays,
	sampleActivities,
} from "./itineraryModel";
import ReplaceActivity from "./ReplaceActivity";
import type { TripDetails } from "./tripDraft";

const primary =
	"inline-flex min-h-11 items-center justify-center rounded-xl bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-[#0018c9]";
const outline =
	"inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#c7d7ef] bg-white px-4 py-2 text-sm font-medium hover:bg-[#e9f3ff]";
const small =
	"min-h-9 rounded-lg border border-[#dbeaff] bg-white px-2.5 text-xs hover:bg-[#e9f3ff] disabled:cursor-not-allowed disabled:opacity-45";
type Panel =
	| { action: "replace" | "remove" | "move"; index: number }
	| { action: "revise" | "review" }
	| {
			action: "proposal";
			edits: ItineraryEdits;
			rows: ChangeRow[];
			revision?: string;
	  };
const money = (amount: number) => `MUR ${currency.format(amount)}`;

export default function TripItinerary({
	idea,
	details,
	initialEdits,
	initialRevision,
	selectedDay,
	onSave,
}: {
	idea: string;
	details: TripDetails;
	initialEdits: ItineraryEdits;
	initialRevision?: string;
	selectedDay?: string;
	onSave: (edits: ItineraryEdits, revision: string) => boolean;
}) {
	const days = itineraryDays(details);
	const [dayIndex, setDayIndex] = useState(() =>
		Math.max(
			0,
			days.findIndex((item) => item.key === selectedDay),
		),
	);
	const [edits, setEdits] = useState(initialEdits);
	const [revision, setRevision] = useState(initialRevision ?? "");
	const [notice, setNotice] = useState("");
	const [panel, setPanel] = useState<Panel>({ action: "review" });
	const dialog = useRef<HTMLDialogElement>(null);
	const dialogTitle = useRef<HTMLHeadingElement>(null);

	useEffect(() => {
		if (panel.action === "proposal") dialogTitle.current?.focus();
	}, [panel.action]);
	const daysPlanned = days.filter((day) => !day.free);
	const day = days[dayIndex];
	const defaults = sampleActivities(idea);
	const entries = scheduleDay(edits[day.key] ?? defaults);
	const guests = details.adults + details.children;
	function costOf(next: ItineraryEdits) {
		return daysPlanned.reduce(
			(sum, item) =>
				sum +
				(next[item.key] ?? defaults).reduce(
					(cost, entry) => cost + activities[entry.activity].price * guests,
					0,
				),
			0,
		);
	}

	const activitiesCost = costOf(edits);
	const transport = details.transport === "no" ? 0 : daysPlanned.length * 2400;
	const coordination = daysPlanned.length * 800;
	const total = activitiesCost + transport + coordination;
	const budget = details.budget ? Number(details.budget) : undefined;
	const active = "index" in panel ? entries[panel.index] : undefined;

	function updateEntries(next: DayActivity[]) {
		setEdits((current) => ({ ...current, [day.key]: next }));
		setNotice("");
	}

	function showPanel(next: Panel) {
		setPanel(next);
		dialog.current?.showModal();
	}

	function describeActivity(index: number, entry: (typeof entries)[number]) {
		return `Day ${index + 1} · ${timeLabel(entry.startMinute)} · ${activities[entry.activity].title}`;
	}

	function previewMove(index: number, target: string, startMinute: number) {
		const targetIndex = days.findIndex(
			(item) => item.key === target && !item.free,
		);
		if (targetIndex < 0 || !Number.isInteger(startMinute))
			return "Choose a planned day and a valid start time.";
		const entry = entries[index];
		if (target === day.key && entry.startMinute === startMinute)
			return "Choose a different start time or day.";

		const remainder = entries.filter((_, i) => i !== index);
		const sameDay = target === day.key;
		const destination = sameDay
			? remainder
			: scheduleDay(edits[target] ?? defaults);
		const moved = {
			...entry,
			startMinute,
			id: sameDay ? entry.id : crypto.randomUUID(),
		};
		if (!canSchedule(destination, moved))
			return "Choose a time that leaves at least 15 minutes between stops and ends before midnight.";

		const next = [...destination, moved].sort(
			(a, b) => a.startMinute - b.startMinute,
		);
		setPanel({
			action: "proposal",
			edits: { ...edits, [day.key]: remainder, [target]: next },
			rows: [
				{
					label: "Activity",
					before: describeActivity(dayIndex, entry),
					proposed: describeActivity(targetIndex, moved),
				},
			],
		});
	}

	function previewRevision(
		request: string,
		keepMustDo: boolean,
		lowerCost: boolean,
	) {
		const next = { ...edits };
		const rows: ChangeRow[] =
			request !== revision
				? [
						{
							label: "Revision request",
							before: revision || "None",
							proposed: request || "None",
						},
					]
				: [];
		if (lowerCost) {
			for (const [index, item] of days.entries()) {
				if (item.free) continue;
				const current = scheduleDay(edits[item.key] ?? defaults);
				const updated = scheduleDay(lowerCostActivities(current, keepMustDo));
				const changed = updated.filter(
					(entry, position) => entry.activity !== current[position].activity,
				);
				if (!changed.length) continue;
				next[item.key] = updated;
				rows.push({
					label: `Day ${index + 1} activities`,
					before: changed
						.map(
							(entry) =>
								activities[
									current.find((previous) => previous.id === entry.id)
										?.activity ?? entry.activity
								].title,
						)
						.join(", "),
					proposed: changed
						.map((entry) => activities[entry.activity].title)
						.join(", "),
				});
			}
			if (!rows.some((row) => row.label.startsWith("Day ")))
				rows.push({
					label: "Activities",
					before: "Current activities",
					proposed: "No lower-cost sample changes available",
				});
		}
		setPanel({ action: "proposal", edits: next, rows, revision: request });
	}

	return (
		<main className="mx-auto max-w-[84rem] px-4 pt-6 pb-16 tablet:px-8 tablet:pt-8">
			<Link
				to="/trips/plan"
				className="inline-flex items-center gap-2 text-sm text-ocean underline underline-offset-2"
			>
				<Icon name="next" className="size-4 rotate-180" /> Back to your details
			</Link>
			<header className="mt-8 flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.05em]">
						{days.length} {days.length === 1 ? "day" : "days"}, your way.
					</h1>
					<p className="mt-4 text-sm text-[#506582]">
						Mauritius · {guests} {guests === 1 ? "guest" : "guests"} · Sample ·{" "}
						{days[0].label}
					</p>
				</div>
				<Link
					to="/trips/setup/$step"
					params={{ step: "dates" }}
					className={outline}
				>
					<Icon name="calendar" className="size-4" />
					Edit days and starting points
				</Link>
			</header>

			<fieldset
				aria-label="Itinerary days"
				className="mt-10 flex flex-wrap gap-2.5"
			>
				{days.map((item, index) => (
					<button
						key={item.key}
						type="button"
						aria-pressed={index === dayIndex}
						onClick={() => setDayIndex(index)}
						className="min-h-11 rounded-lg border border-[#dbeaff] bg-white px-4 text-sm hover:border-ocean/50 aria-pressed:border-ocean aria-pressed:bg-ocean aria-pressed:text-white"
					>
						Day {index + 1} · {item.label}
					</button>
				))}
			</fieldset>

			<div className="mt-5 grid items-start gap-6 desktop:grid-cols-[2fr_1fr]">
				<section
					className="min-w-0 rounded-2xl border border-[#dbeaff] bg-white p-5 tablet:p-7"
					aria-labelledby="itinerary-day"
				>
					<div className="flex flex-wrap items-start justify-between gap-4 py-4">
						<div>
							<h2
								id="itinerary-day"
								className="text-2xl font-semibold tracking-tight"
							>
								Day {dayIndex + 1} · {day.label}
							</h2>
							<p className="mt-2 text-sm text-[#506582]">
								{day.free
									? "Free day"
									: `Starting point: ${day.start || "To be decided"}`}
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Link
								to="/trips/single-day"
								search={{ day: day.key }}
								className={outline}
							>
								View this day
							</Link>
							{!day.free && (
								<button
									type="button"
									className={outline}
									onClick={() => showPanel({ action: "revise" })}
								>
									Revise plan
								</button>
							)}
						</div>
					</div>
					{day.free ? (
						<p className="mt-6 rounded-xl bg-[#e9f3ff] p-4 text-sm leading-relaxed">
							No activities or transport are planned for this day.
						</p>
					) : entries.length ? (
						<ol className="mt-7 divide-y divide-[#dbeaff] border-t border-[#dbeaff]">
							{entries.map((entry, index) => {
								const activity = activities[entry.activity];
								return (
									<li
										key={entry.id}
										className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 py-5 tablet:grid-cols-[4rem_4.5rem_1fr]"
									>
										<time
											dateTime={
												entry.startMinute < 1440
													? timeLabel(entry.startMinute)
													: undefined
											}
											className="text-sm text-[#506582]"
										>
											{timeLabel(entry.startMinute)}
										</time>
										<img
											src={activity.image}
											alt=""
											className="col-start-1 row-start-2 size-16 rounded-lg object-cover tablet:col-auto tablet:row-auto tablet:size-[4.5rem]"
										/>
										<div className="col-start-2 row-span-2 row-start-1 min-w-0 tablet:col-auto tablet:row-auto">
											<h3 className="text-lg font-semibold tracking-tight">
												{activity.title}
											</h3>
											<p className="mt-1.5 text-xs text-[#506582]">
												{activity.duration} min ·{" "}
												{money(activity.price * guests)} for your group
											</p>
											<label className="mt-2.5 flex w-fit items-center gap-2 text-sm">
												<input
													type="checkbox"
													checked={entry.mustDo}
													onChange={(event) =>
														updateEntries(
															entries.map((item, i) =>
																i === index
																	? { ...item, mustDo: event.target.checked }
																	: item,
															),
														)
													}
													className="size-4 accent-ocean"
												/>
												Must-do
											</label>
											<div className="mt-3 flex flex-wrap gap-2">
												<button
													type="button"
													className={small}
													onClick={() =>
														showPanel({ action: "replace", index })
													}
												>
													Replace
												</button>
												<button
													type="button"
													className={small}
													onClick={() => showPanel({ action: "remove", index })}
												>
													Remove
												</button>
												<button
													type="button"
													className={small}
													onClick={() => showPanel({ action: "move", index })}
												>
													Move / reorder
												</button>
											</div>
										</div>
									</li>
								);
							})}
						</ol>
					) : (
						<p className="mt-6 rounded-xl bg-[#e9f3ff] p-4 text-sm">
							This day has no activities. Move an activity here from another
							planned day to fill it.
						</p>
					)}
					<p className="mt-6 text-xs leading-relaxed text-[#506582]">
						Sample activities and travel spacing. No live availability checks.
					</p>
				</section>

				<aside
					aria-labelledby="itinerary-estimate"
					className="rounded-2xl border border-[#dbeaff] bg-[#e9f3ff] p-6"
				>
					<h2
						id="itinerary-estimate"
						className="text-xl font-semibold tracking-tight"
					>
						Trip estimate
					</h2>
					<p className="mt-4 text-[1.85rem] leading-tight font-bold tracking-tight">
						{money(total)}
					</p>
					<dl className="mt-5 grid gap-4 text-sm">
						{(
							[
								["Experiences & meals", activitiesCost],
								["Transport", transport],
								["Coordination", coordination],
							] as const
						).map(([label, amount]) => (
							<div key={label} className="flex justify-between gap-3">
								<dt>{label}</dt>
								<dd>{money(amount)}</dd>
							</div>
						))}
					</dl>
					{budget !== undefined && (
						<p className="mt-4 text-sm">{money(budget)} total budget</p>
					)}
					{budget !== undefined && total > budget && (
						<p className="mt-4 rounded-xl bg-[#fff3d9] p-3 text-sm text-[#634507]">
							{money(total - budget)} over your budget.
						</p>
					)}
					<div className="mt-5 flex flex-wrap gap-2.5">
						<button
							type="button"
							className={primary}
							onClick={() =>
								setNotice(
									onSave(edits, revision)
										? "Itinerary draft saved."
										: "Browser storage is unavailable. Your edits are still here.",
								)
							}
						>
							Save draft
						</button>
						<button
							type="button"
							className={outline}
							onClick={() => showPanel({ action: "review" })}
						>
							Review request
						</button>
					</div>
					{notice && (
						<p role="status" className="mt-3 text-sm font-semibold">
							{notice}
						</p>
					)}
					<p className="mt-4 text-sm leading-relaxed text-[#506582]">
						Not booked. Estimates and availability need confirmation.
					</p>
				</aside>
			</div>

			<dialog
				ref={dialog}
				aria-labelledby="itinerary-dialog-title"
				onClose={() => {
					setPanel({ action: "review" });
				}}
				className={`m-auto w-[calc(100%-2rem)] overflow-auto rounded-2xl border border-[#dbeaff] bg-white p-6 text-[#102040] shadow-xl motion-safe:open:animate-response-arrival ${panel.action === "replace" ? "max-h-[90svh] max-w-[42.5rem] backdrop:bg-[#172345]/37 backdrop:backdrop-blur-xs tablet:p-8" : "max-h-[calc(100%-2rem)] max-w-[33rem] backdrop:bg-[#172345]/37 backdrop:backdrop-blur-xs tablet:p-8"}`}
			>
				<form
					method="dialog"
					className={`flex items-center justify-between gap-4 ${panel.action === "review" ? "mb-5" : "mb-2"}`}
				>
					<h2
						id="itinerary-dialog-title"
						ref={dialogTitle}
						tabIndex={-1}
						className="text-2xl font-semibold tracking-tight"
					>
						{
							{
								revise: "What would you change?",
								review: "Review request",
								replace: "A different kind of day.",
								remove: "Make some room?",
								move: "Find a better time.",
								proposal: "Here’s what would change.",
							}[panel.action]
						}
					</h2>
					<button
						type="submit"
						aria-label="Close"
						className="grid size-10 place-items-center rounded-lg text-2xl hover:bg-[#e9f3ff]"
					>
						×
					</button>
				</form>
				{panel.action === "review" && (
					<div className="space-y-3 text-sm">
						<p className="whitespace-pre-wrap wrap-anywhere">
							{idea || "A sample day in Mauritius."}
						</p>
						<p>
							{daysPlanned.length} planned · {days.length - daysPlanned.length}{" "}
							free · {guests} {guests === 1 ? "guest" : "guests"}
						</p>
						<p className="font-semibold">Estimated total: {money(total)}</p>
						<p className="text-[#506582]">
							This is a preview. No request is sent.
						</p>
					</div>
				)}
				{panel.action === "revise" && (
					<RevisePlan
						initialRequest={revision}
						onPreview={previewRevision}
						onCancel={() => dialog.current?.close()}
					/>
				)}
				{panel.action === "replace" && active && (
					<ReplaceActivity
						current={active.activity}
						onCancel={() => dialog.current?.close()}
						onApply={(activity) => {
							const next = scheduleDay(
								entries.map((entry, index) =>
									index === panel.index ? { ...entry, activity } : entry,
								),
							);
							setPanel({
								action: "proposal",
								edits: { ...edits, [day.key]: next },
								rows: [
									{
										label: "Activity",
										before: describeActivity(dayIndex, active),
										proposed: describeActivity(dayIndex, next[panel.index]),
									},
								],
							});
						}}
					/>
				)}
				{panel.action === "remove" && active && (
					<RemoveActivity
						entries={entries}
						index={panel.index}
						onCancel={() => dialog.current?.close()}
						onPreview={(next, bringForward) =>
							setPanel({
								action: "proposal",
								edits: { ...edits, [day.key]: next },
								rows: [
									{
										label: "Activity",
										before: describeActivity(dayIndex, active),
										proposed: "Not in plan",
									},
									...(bringForward && next[panel.index]
										? [
												{
													label: "Next stop",
													before: timeLabel(
														entries[panel.index + 1].startMinute,
													),
													proposed: timeLabel(next[panel.index].startMinute),
												},
											]
										: []),
								],
							})
						}
					/>
				)}
				{panel.action === "move" && active && (
					<MoveActivity
						entry={active}
						day={day}
						days={days}
						onCancel={() => dialog.current?.close()}
						onPreview={(target, start) =>
							previewMove(panel.index, target, start)
						}
					/>
				)}
				{panel.action === "proposal" && (
					<ReviewChange
						rows={panel.rows}
						before={total}
						proposed={costOf(panel.edits) + transport + coordination}
						onCancel={() => dialog.current?.close()}
						onApply={() => {
							setEdits(panel.edits);
							if (panel.revision !== undefined) setRevision(panel.revision);
							setNotice("Changes applied. Save draft to keep them.");
							dialog.current?.close();
						}}
					/>
				)}
			</dialog>
		</main>
	);
}
