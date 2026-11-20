import { Link, useNavigate } from "@tanstack/react-router";
import { Fragment, useEffect, useRef, useState } from "react";
import { readBookingPreview, startBookingPreview } from "./bookingPreview";
import { Icon } from "./DashboardIcon";
import { getDemoSession } from "./demoAuth";
import { ReviewChange } from "./ItineraryChangeForms";
import { scheduleDay, timeLabel } from "./itineraryChanges";
import {
	activities,
	currency,
	type DayActivity,
	type ItineraryEdits,
	itineraryDays,
	sampleActivities,
} from "./itineraryModel";
import ReplaceActivity from "./ReplaceActivity";
import { flexibleDay, type TripDetails } from "./tripDraft";

const card = "rounded-2xl border border-[#dbeaff] bg-white";
const muted = "text-[#506582]";
const primary =
	"inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-ocean px-4 text-sm font-semibold text-white hover:bg-[#0018c9]";
const outline =
	"inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#c7d7ef] bg-white px-4 text-sm font-semibold hover:bg-[#e9f3ff]";
const money = (amount: number) => `MUR ${currency.format(amount)}`;
const descriptions: Record<DayActivity["activity"], string> = {
	breakfast: "Coffee and breakfast by the coast.",
	"slow-breakfast":
		"Take your time over coffee, fruit and breakfast by the water.",
	lagoon: "Swim, wander, or simply take it in.",
	"forest-trail": "Follow a shaded trail through the island’s green hills.",
	lunch: "An unhurried lunch with local flavours.",
	sunset: "A slow sail along the west coast.",
	waterfall: "Forest views and a visit to the Chamarel waterfall lookout.",
	market: "Browse the stalls and try local flavours in Port Louis.",
};
const travelTimes = [15, 20, 25];

function durationLabel(minutes: number) {
	if (minutes < 60) return `${minutes} min`;
	if (minutes % 60 === 0)
		return `${minutes / 60} ${minutes === 60 ? "hour" : "hours"}`;
	return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
}

export default function SingleDayItinerary({
	idea,
	details,
	selectedDay,
	initialEdits,
	onSave,
}: {
	idea: string;
	details: TripDetails;
	selectedDay?: string;
	initialEdits: ItineraryEdits;
	onSave: (edits: ItineraryEdits) => boolean;
}) {
	const navigate = useNavigate();
	const days = itineraryDays(details);
	const day = days.find((item) => item.key === selectedDay) ?? days[0];
	const [edits, setEdits] = useState(initialEdits);
	const [active, setActive] = useState<DayActivity>();
	const [proposal, setProposal] = useState<DayActivity["activity"]>();
	const dialogTitle = useRef<HTMLHeadingElement>(null);
	useEffect(() => {
		if (proposal) dialogTitle.current?.focus();
	}, [proposal]);
	const [notice, setNotice] = useState("");
	const dialog = useRef<HTMLDialogElement>(null);
	const entries = day.free
		? []
		: scheduleDay(edits[day.key] ?? sampleActivities(idea));
	const guests = details.adults + details.children;
	const activityCost = entries.reduce(
		(total, entry) => total + activities[entry.activity].price * guests,
		0,
	);
	const transport = day.free || details.transport === "no" ? 0 : 2400;
	const coordination = day.free ? 0 : 800;
	const estimate = activityCost + transport + coordination;
	const budget = details.budget ? Number(details.budget) : undefined;
	const difference = budget === undefined ? undefined : budget - estimate;
	const last = entries.at(-1);

	function showDialog(entry: DayActivity) {
		setActive(entry);
		dialog.current?.showModal();
	}

	function beginBooking() {
		const email = getDemoSession();
		if (!email) {
			void navigate({ to: "/sign-in" });
			return;
		}
		const saved = startBookingPreview(email, {
			title: "A slow day on the west coast.",
			dayKey: day.key,
			date: day.key === flexibleDay ? "Flexible date" : day.label,
			travellers: `${details.adults} ${details.adults === 1 ? "adult" : "adults"}${details.children ? `, ${details.children} ${details.children === 1 ? "child" : "children"}` : ""}`,
			guestCount: guests,
			start: day.start,
			activities: entries.map((entry) => ({
				id: entry.id,
				activity: entry.activity,
				title: activities[entry.activity].title,
				time: timeLabel(entry.startMinute),
				minute: entry.startMinute,
				duration: activities[entry.activity].duration,
				cost: activities[entry.activity].price * guests,
			})),
			transport,
			coordination,
		});
		if (saved) {
			onSave(edits);
			const step = readBookingPreview(email)?.authorised
				? "confirmation-progress"
				: "traveller-details";
			void navigate({
				to: "/trips/booking/$step",
				params: { step },
			});
		} else {
			setNotice(
				"Browser storage is unavailable. Enable it to continue to the booking preview.",
			);
		}
	}

	return (
		<main className="mx-auto max-w-[100rem] px-4 pt-5 pb-12 tablet:px-8">
			<Link
				to="/trips"
				className="inline-flex items-center gap-2 text-sm text-ocean hover:underline"
			>
				<Icon name="next" className="size-4 rotate-180" />
				Back to your details
			</Link>
			<header className="mt-4 flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-[clamp(2.35rem,3.5vw,3.25rem)] leading-tight font-semibold tracking-[-0.048em]">
						{day.free
							? "A day to make your own."
							: "A slow day on the west coast."}
					</h1>
					<p
						className={`${muted} mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm`}
					>
						<span>
							Mauritius · {details.adults}{" "}
							{details.adults === 1 ? "adult" : "adults"}
							{details.children
								? `, ${details.children} ${details.children === 1 ? "child" : "children"}`
								: ""}{" "}
							· {day.key === flexibleDay ? "Flexible date" : day.label}
						</span>
						<span className="rounded-full bg-[#e9f3ff] px-3 py-1 text-xs font-semibold text-ocean">
							Sample plan
						</span>
					</p>
				</div>
				<p className="flex flex-wrap items-center gap-4 text-xs">
					<Link
						to="/trips"
						className={`${muted} inline-flex items-center gap-2 hover:text-ocean`}
					>
						<Icon
							name="check"
							className="size-5 rounded-full bg-[#e9f3ff] p-1 text-ocean"
						/>
						Your day
					</Link>
					<span
						aria-current="step"
						className="inline-flex items-center gap-2 font-semibold text-ocean"
					>
						<span className="grid size-6 place-items-center rounded-full bg-ocean text-white">
							2
						</span>
						Review your plan
					</span>
				</p>
			</header>

			<div className="mt-6 grid items-start gap-5 desktop:grid-cols-[1.85fr_1fr]">
				<section
					className={`${card} min-w-0 p-5 tablet:p-7`}
					aria-labelledby="single-day-heading"
				>
					<div className="flex flex-wrap items-start justify-between gap-3">
						<div>
							<h2
								id="single-day-heading"
								className="text-[1.65rem] leading-tight font-semibold tracking-tight"
							>
								Your day, at your pace.
							</h2>
							<p className={`${muted} mt-2 text-sm`}>
								A little structure. Plenty of room for you.
							</p>
						</div>
						<Link
							to="/trips/itinerary"
							search={{ day: day.key }}
							className={`${outline} text-ocean`}
						>
							<Icon name="calendar" className="size-4" />
							Adjust plan
						</Link>
					</div>
					{entries.length ? (
						<ol className="mt-8">
							{entries.map((entry, index) => {
								const activity = activities[entry.activity];
								const previous = entries[index - 1];
								const gap = previous
									? entry.startMinute -
										previous.startMinute -
										activities[previous.activity].duration
									: 0;
								const travel =
									index > 0 && transport
										? Math.min(gap, travelTimes[index - 1] ?? 15)
										: 0;
								const freeTime = gap - travel;
								return (
									<Fragment key={entry.id}>
										{index > 0 && (
											<li className="ml-12 border-l border-[#c7d7ef] py-3 pl-5 tablet:ml-[4rem] tablet:pl-6">
												{freeTime >= 45 && (
													<div className="mb-3 flex items-center gap-3 rounded-lg bg-[#eff6ff] p-3 text-sm">
														<Icon name="sun" className="size-5 text-ocean" />
														<div>
															<p className="font-semibold">Leave some room</p>
															<p className={`${muted} mt-1 text-xs`}>
																{durationLabel(freeTime)} to unwind before your
																next stop.
															</p>
														</div>
													</div>
												)}
												{travel > 0 && (
													<p
														className={`${muted} flex items-center gap-2 text-xs after:h-px after:flex-1 after:bg-[#dbeaff]`}
													>
														<Icon name="car" className="size-4" />
														About {travel} min travel
													</p>
												)}
											</li>
										)}
										<li className="grid grid-cols-[3rem_1fr] tablet:grid-cols-[4rem_1fr]">
											<time
												className="pt-1 text-sm font-semibold"
												dateTime={
													entry.startMinute < 1440
														? timeLabel(entry.startMinute)
														: undefined
												}
											>
												{timeLabel(entry.startMinute)}
											</time>
											<div
												className={`relative flex flex-wrap items-start gap-3 border-[#c7d7ef] pl-5 before:absolute before:top-1.5 before:-left-[5px] before:size-2.5 before:rounded-full before:border-2 before:border-ocean before:bg-white tablet:gap-5 tablet:pl-6 ${!last || last.id !== entry.id || transport ? "border-l" : "border-l border-transparent"}`}
											>
												<img
													src={activity.image}
													alt=""
													className="h-20 w-24 shrink-0 rounded-xl object-cover tablet:h-[6.1rem] tablet:w-[8.8rem]"
												/>
												<div className="min-w-28 flex-1">
													<h3 className="text-lg font-semibold tracking-tight">
														{activity.title}
													</h3>
													<p className={`${muted} mt-1 text-sm`}>
														{descriptions[entry.activity]}
													</p>
													<p
														className={`${muted} mt-2 flex items-center gap-1.5 text-xs`}
													>
														<Icon name="clock" className="size-4" />
														{durationLabel(activity.duration)}
													</p>
												</div>
												<div className="ml-auto grid justify-items-end gap-2 text-sm">
													<p className="font-semibold">
														{activity.price
															? money(activity.price * guests)
															: "Free"}
													</p>
													<button
														type="button"
														onClick={() => showDialog(entry)}
														aria-label={`Change ${activity.title}`}
														className="inline-flex items-center gap-1.5 text-ocean hover:underline"
													>
														Change <Icon name="next" className="size-4" />
													</button>
												</div>
											</div>
										</li>
									</Fragment>
								);
							})}
							{last && transport > 0 && (
								<li className="grid grid-cols-[3rem_1fr] pt-3 tablet:grid-cols-[4rem_1fr]">
									<span className="text-sm font-semibold">
										{timeLabel(
											last.startMinute + activities[last.activity].duration,
										)}
									</span>
									<p
										className={`${muted} relative flex items-center gap-2 pl-5 text-xs before:absolute before:-left-1 before:size-2 before:rounded-full before:border-2 before:border-[#92a5c1] before:bg-white tablet:pl-6`}
									>
										<Icon name="car" className="size-4" />
										Return journey · about 45 min
									</p>
								</li>
							)}
						</ol>
					) : (
						<p className="mt-7 rounded-xl bg-[#e9f3ff] p-4 text-sm">
							{day.free
								? "No activities or transport are planned for this free day."
								: "This draft has no activities for this day."}
						</p>
					)}
					<p className={`${muted} mt-7 border-t border-[#dbeaff] pt-4 text-xs`}>
						Illustrative itinerary and travel times.
					</p>
				</section>

				<aside className={`${card} p-2.5`} aria-labelledby="single-estimate">
					<div className="relative overflow-hidden rounded-xl">
						<img
							src="/dashboard/west-coast.webp"
							alt="Le Morne mountain and the lagoon in Mauritius"
							className="aspect-[2] w-full object-cover"
						/>
						<span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs">
							<Icon name="pin" className="size-4" />
							Mauritius
						</span>
					</div>
					<div className="p-4">
						<h2
							id="single-estimate"
							className="mt-2 text-[1.65rem] leading-tight font-semibold tracking-tight"
						>
							Your day, at a glance.
						</h2>
						<p className={`${muted} mt-2 text-sm`}>
							Estimate for {guests} {guests === 1 ? "guest" : "guests"}
						</p>
						<dl className="mt-6 grid gap-4 border-b border-[#dbeaff] pb-5 text-sm">
							{(
								[
									["Experiences & meals", activityCost],
									["Private transport", transport],
									["Coordination", coordination],
								] as const
							).map(([label, amount]) => (
								<div key={label} className="flex justify-between gap-3">
									<dt className={muted}>{label}</dt>
									<dd className="font-semibold">{money(amount)}</dd>
								</div>
							))}
						</dl>
						<div className="mt-5 flex items-center justify-between gap-3">
							<p className="text-sm font-semibold">Estimated total</p>
							<p className="text-[clamp(1.45rem,2.35vw,2.15rem)] font-semibold tracking-tight text-ocean">
								{money(estimate)}
							</p>
						</div>
						{budget !== undefined && (
							<div className="mt-4 text-xs">
								<p className={`${muted} flex justify-between gap-3`}>
									<span>Your budget</span>
									<span>{money(budget)}</span>
								</p>
								<p
									className={`mt-3 rounded-lg p-3 ${difference !== undefined && difference < 0 ? "bg-[#fff3d9] text-[#634507]" : "bg-[#e9f7f0] text-[#175743]"}`}
								>
									{difference === 0
										? "Matches your budget."
										: difference !== undefined && difference < 0
											? `${money(-difference)} over your budget.`
											: `${money(difference ?? 0)} to spare.`}
								</p>
							</div>
						)}
						<p className={`${muted} mt-5 text-xs`}>
							Illustrative prices, not a quote. Nothing is booked.
						</p>
						<div className="mt-5 grid gap-2.5">
							<button
								type="button"
								className={primary}
								onClick={beginBooking}
								disabled={day.free || !entries.length}
							>
								Continue with this plan <Icon name="next" className="size-4" />
							</button>
							<button
								type="button"
								className={outline}
								onClick={() =>
									setNotice(
										onSave(edits)
											? "Draft saved under Saved → Draft plans."
											: "Browser storage is unavailable. Your draft is still here.",
									)
								}
							>
								<Icon name="bookmark" className="size-5" />
								Save for later
							</button>
						</div>
						{notice && (
							<p className="mt-3 text-sm text-ocean" role="status">
								{notice}
							</p>
						)}
						<p className={`${muted} mt-4 text-xs`}>
							Continue to preview a booking request. No booking or payment will
							be made.
						</p>
					</div>
				</aside>
			</div>

			<details className={`${card} group mt-5`}>
				<summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 text-sm font-semibold [&::-webkit-details-marker]:hidden">
					Your details &amp; estimate notes{" "}
					<span
						aria-hidden="true"
						className="size-2 rotate-45 border-r border-b text-ocean group-open:rotate-[225deg]"
					/>
				</summary>
				<div className="space-y-2 border-t border-[#dbeaff] p-5 text-sm leading-relaxed">
					{idea && <p className="whitespace-pre-wrap wrap-anywhere">{idea}</p>}
					<p>Starting point: {day.start || "To be decided"}</p>
					<p className={muted}>
						This estimate covers your group for this day. Actual prices, travel
						times, and availability need confirmation.
					</p>
				</div>
			</details>

			<dialog
				ref={dialog}
				aria-labelledby="single-day-dialog-title"
				onClose={() => {
					setActive(undefined);
					setProposal(undefined);
				}}
				className="m-auto max-h-[90svh] w-[min(42.5rem,calc(100%-2rem))] overflow-auto rounded-2xl border border-[#dbeaff] bg-white p-6 text-[#102040] shadow-xl backdrop:bg-[#172345]/37 backdrop:backdrop-blur-xs motion-safe:open:animate-response-arrival"
			>
				<form
					method="dialog"
					className="mb-3 flex items-center justify-between gap-4"
				>
					<h2
						id="single-day-dialog-title"
						ref={dialogTitle}
						tabIndex={-1}
						className="text-2xl font-semibold tracking-tight"
					>
						{proposal
							? "Here’s what would change."
							: "A different kind of day."}
					</h2>
					<button
						type="submit"
						aria-label="Close"
						className="grid size-10 place-items-center rounded-lg text-2xl hover:bg-[#e9f3ff]"
					>
						×
					</button>
				</form>
				{active && proposal ? (
					<ReviewChange
						rows={[
							{
								label: "Activity",
								before: activities[active.activity].title,
								proposed: activities[proposal].title,
							},
						]}
						before={estimate}
						proposed={
							estimate +
							(activities[proposal].price - activities[active.activity].price) *
								guests
						}
						onCancel={() => dialog.current?.close()}
						onApply={() => {
							setEdits({
								...edits,
								[day.key]: scheduleDay(
									entries.map((entry) =>
										entry.id === active.id
											? { ...entry, activity: proposal }
											: entry,
									),
								),
							});
							setNotice("Activity changed. Save for later to keep it.");
							dialog.current?.close();
						}}
					/>
				) : active ? (
					<ReplaceActivity
						current={active.activity}
						onCancel={() => dialog.current?.close()}
						onApply={setProposal}
					/>
				) : null}
			</dialog>
		</main>
	);
}
