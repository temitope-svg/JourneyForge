import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
	BookingBack,
	BookingCard,
	BookingGrid,
	BookingHeader,
	blueButton,
	Callout,
	Heading,
	HelpLink,
	lightButton,
	money,
	muted,
	SectionDisclosure,
	section,
	textLink,
} from "./BookingLayout";
import {
	type BookingPlan,
	type BookingPreview,
	type BookingStep,
	bookingAmounts,
	bookingChange,
} from "./bookingPreview";
import { Icon, type IconName } from "./DashboardIcon";
import { timeLabel } from "./itineraryChanges";

type Advance = (step: BookingStep, changes: Partial<BookingPreview>) => void;
const demoBadge =
	"inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold";
const stateClasses = {
	confirmed: "bg-[#e5f7ed] text-[#175743]",
	checking: "bg-[#e9f3ff] text-ocean",
	approval: "bg-[#fff4d1] text-[#634507]",
};

function RequestPayment({
	total,
	label = "Current total",
}: {
	total: number;
	label?: string;
}) {
	return (
		<div className={section}>
			<p className="flex items-center justify-between gap-2 text-sm">
				<span>{label}</span>
				<strong className="text-base">{money(total)}</strong>
			</p>
			<div className="mt-5 flex items-start justify-between gap-3 text-sm">
				<div>
					<p>Payment status</p>
					<p className={`${muted} mt-1 text-xs`}>No money held or charged</p>
				</div>
				<span className={`${demoBadge} ${stateClasses.checking}`}>
					Authorised · demo
				</span>
			</div>
		</div>
	);
}

function ContactBlock() {
	return (
		<div
			className={`${section} flex flex-wrap items-center justify-between gap-3`}
		>
			<div>
				<p className="font-semibold">Your Journey Forge contact</p>
				<p className={`${muted} mt-2 text-sm`}>Assignment pending</p>
			</div>
			<HelpLink />
		</div>
	);
}

function RequestReceived({ preview }: { preview: BookingPreview }) {
	const { plan } = preview;
	return (
		<>
			<BookingHeader
				title="We’re confirming your trip."
				subtitle="Your request, one step at a time."
				request
				back={<BookingBack>Back to trips</BookingBack>}
			/>
			<BookingGrid
				aside={
					<BookingCard plan={plan}>
						<RequestPayment total={bookingAmounts(plan).total} />
						<ContactBlock />
					</BookingCard>
				}
			>
				<div className="flex items-center gap-4">
					<span className="grid size-14 place-items-center rounded-full bg-[#e9f3ff] text-ocean">
						<Icon name="clock" />
					</span>
					<span className="rounded-lg bg-sun px-3 py-2 text-sm font-semibold">
						Request received
					</span>
				</div>
				<h2 className="mt-5 text-3xl font-semibold tracking-tight">
					You’ve done your part.
				</h2>
				<p className={`${muted} mt-3 text-sm leading-relaxed`}>
					Your trip is awaiting simulated partner checks. Availability and final
					prices would be checked with each partner.
				</p>
				<div className={`${section} mt-6`}>
					<Heading>What happens next</Heading>
					<ol className="my-5 grid gap-5">
						{[
							[
								"We check each partner",
								"Activities, transport and timings, all checked by a person.",
							],
							[
								"You approve any changes",
								"If a price or time changes, you decide before we continue.",
							],
							[
								"Your trip is confirmed",
								"Once everything is agreed, you receive the final itinerary and pickup details.",
							],
						].map(([title, copy], index) => (
							<li key={title} className="flex items-start gap-4">
								<span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e9f3ff] text-ocean">
									{index + 1}
								</span>
								<div>
									<p className="font-semibold">{title}</p>
									<p className={`${muted} mt-2 text-sm leading-relaxed`}>
										{copy}
									</p>
								</div>
							</li>
						))}
					</ol>
				</div>
				<Callout title="Next update">
					A coordinator would share the expected response window. No live review
					is running in this preview.
				</Callout>
				<Link
					to="/trips/booking/$step"
					params={{ step: "confirmation-progress" }}
					className={`${blueButton} mt-5 w-full`}
				>
					View trip status <Icon name="next" className="size-4" />
				</Link>
				<Link
					to="/dashboard"
					className={`${textLink} mx-auto mt-4 block w-fit`}
				>
					Back to home
				</Link>
			</BookingGrid>
		</>
	);
}

function ConfirmationProgress({ preview }: { preview: BookingPreview }) {
	const { plan, decision, traveller } = preview;
	const change = bookingChange(plan);
	const pending = Boolean(change && decision === "pending");
	const total = bookingAmounts(plan).total;
	const approvedTotal =
		total + (change && decision === "approved" ? change.increase : 0);
	const partners = plan.activities
		.filter((entry) => entry.cost > 0)
		.map((entry, index) => {
			const state =
				change?.sunset.id === entry.id && pending
					? "approval"
					: index === 0
						? "confirmed"
						: "checking";
			return {
				id: entry.id,
				name: change?.sunset.id === entry.id ? "Sunset sailing" : entry.title,
				state,
				detail:
					state === "approval"
						? "An alternative departure is available."
						: change?.sunset.id === entry.id && decision === "approved"
							? `Later sailing approved for ${timeLabel(change.later)} in this example.`
							: change?.sunset.id === entry.id && decision === "declined"
								? "The change was declined. Another option would be needed."
								: state === "confirmed"
									? "Confirmed in this example."
									: "Availability and details are being checked in this example.",
				icon: "sun",
			} as const;
		});
	const partnerRows = plan.transport
		? [
				...partners,
				{
					id: "transport",
					name: "Private transport",
					state: "confirmed",
					detail: `Pickup: ${traveller?.pickup || plan.start || "to be decided"}.`,
					icon: "car",
				} as const,
			]
		: partners;
	const progressLabels = [
		"Request received",
		"Confirming partners",
		"Trip confirmed",
	];
	return (
		<>
			<BookingHeader
				title="Your day is taking shape."
				subtitle="Follow the details as we confirm them."
				request
				back={<BookingBack>Back to trips</BookingBack>}
			/>
			<BookingGrid
				aside={
					<BookingCard plan={plan}>
						<RequestPayment
							total={approvedTotal}
							label="Current approved total"
						/>
						{pending && change && (
							<p className="flex justify-between gap-2 text-sm text-[#634507]">
								<span>Proposed change</span>
								<strong>+ {money(change.increase)}</strong>
							</p>
						)}
						<Callout title="Nothing changes without you.">
							Any change to your day or its price needs your approval first.
						</Callout>
						<ContactBlock />
					</BookingCard>
				}
			>
				<ol
					className="grid grid-cols-3 gap-3 text-center text-xs"
					aria-label="Confirmation progress"
				>
					{progressLabels.map((text, index) => (
						<li
							key={text}
							aria-current={index === 1 ? "step" : undefined}
							className={index <= 1 ? "text-ocean" : muted}
						>
							<span
								className={`mx-auto mb-3 grid size-8 place-items-center rounded-full border ${index === 0 ? "border-ocean bg-ocean text-white" : index === 1 ? "border-2 border-ocean" : "border-[#92a5c1]"}`}
							>
								{index === 0 ? (
									<Icon name="check" className="size-5" />
								) : (
									index + 1
								)}
							</span>
							{text}
						</li>
					))}
				</ol>
				{pending ? (
					<div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#f0db9d] bg-[#fff8df] p-4">
						<div>
							<p className="font-semibold">One change needs your approval</p>
							<p className={`${muted} mt-2 text-sm`}>
								The sunset sailing has a new time and price.
							</p>
						</div>
						<Link
							to="/trips/booking/$step"
							params={{ step: "change-approval" }}
							className={blueButton}
						>
							Review change <Icon name="next" className="size-4" />
						</Link>
					</div>
				) : (
					decision !== "pending" && (
						<div className="mt-6">
							<Callout
								title={
									decision === "approved"
										? "Change approved in this preview"
										: "Change declined in this preview"
								}
							>
								{decision === "approved"
									? "The proposed sailing and estimate are reflected here. The current demo request remains unconfirmed."
									: "The original total stays the same. A coordinator would look for another option."}
							</Callout>
						</div>
					)
				)}
				<div className="mt-7 flex flex-wrap items-center justify-between gap-3">
					<Heading>The details, one by one</Heading>
					<p className={`${muted} text-xs`}>
						{partnerRows.filter(({ state }) => state === "confirmed").length} of{" "}
						{partnerRows.length} partners confirmed · demo
					</p>
				</div>
				<ul className="mt-4 divide-y divide-[#dbeaff] border-y border-[#dbeaff]">
					{partnerRows.map((partner) => (
						<li
							key={partner.id}
							className="flex flex-wrap items-center gap-3 py-5"
						>
							<Icon
								name={partner.icon}
								className="size-6 shrink-0 text-ocean"
							/>
							<div className="min-w-40 flex-1">
								<p className="font-semibold">{partner.name}</p>
								<p
									className={`${muted} mt-1.5 text-sm leading-relaxed wrap-anywhere`}
								>
									{partner.detail}
								</p>
							</div>
							<span className={`${demoBadge} ${stateClasses[partner.state]}`}>
								{partner.state === "approval"
									? "Approval needed"
									: partner.state === "confirmed"
										? "Confirmed"
										: "Checking"}
							</span>
						</li>
					))}
				</ul>
				{plan.activities.some((entry) => !entry.cost) && (
					<p className={`${muted} my-4 text-xs`}>
						Free activities need no reservation in this sample.
					</p>
				)}
				<SectionDisclosure title="View original requested itinerary">
					<ul className="space-y-2">
						{plan.activities.map((entry) => (
							<li key={entry.id}>
								{entry.time} · {entry.title}
							</li>
						))}
					</ul>
				</SectionDisclosure>
			</BookingGrid>
			<p className={`${muted} mt-6 text-sm leading-relaxed`}>
				Want to see the finished state?{" "}
				<Link
					to="/trips/booking/$step"
					params={{ step: "confirmed-trip" }}
					className="text-ocean underline underline-offset-2"
				>
					Preview a separate confirmed trip
				</Link>
				. Your current request stays unconfirmed.
			</p>
		</>
	);
}

function ChangeApproval({
	preview,
	onAdvance,
}: {
	preview: BookingPreview;
	onAdvance: Advance;
}) {
	const { plan, decision } = preview;
	const change = bookingChange(plan);
	const { total } = bookingAmounts(plan);
	if (!change || decision !== "pending")
		return (
			<BookingHeader
				title="No change awaiting approval."
				subtitle="You can return to your demo trip status."
				request
				back={
					<BookingBack step="confirmation-progress">
						Back to trip status
					</BookingBack>
				}
			/>
		);

	const rows: {
		label: string;
		before: string;
		after: string;
		icon: IconName;
	}[] = [
		{
			label: "Departure",
			before: change.sunset.time,
			after: timeLabel(change.later),
			icon: "clock",
		},
		{
			label: "Sailing cost",
			before: money(change.sunset.cost),
			after: money(change.sunset.cost + change.increase),
			icon: "wallet",
		},
		{
			label: plan.transport ? "Return to starting point" : "Day ends",
			before: timeLabel(change.oldReturn),
			after: timeLabel(change.newReturn),
			icon: "car",
		},
	];

	return (
		<>
			<BookingHeader
				title="A small change. Your call."
				subtitle="Review the new sailing time and price before we continue."
				request
				back={
					<BookingBack step="confirmation-progress">
						Back to trip status
					</BookingBack>
				}
			/>
			<BookingGrid
				aside={
					<BookingCard plan={plan}>
						<div className={section}>
							<h3 className="font-semibold">Your choice</h3>
							<ul className={`${muted} mt-3 space-y-3 text-sm`}>
								<li>
									Later sailing:{" "}
									<strong className="text-[#102040]">
										{timeLabel(change.later)}
									</strong>
								</li>
								<li>
									Total increase:{" "}
									<strong className="text-[#102040]">
										{money(change.increase)}
									</strong>
								</li>
								<li>
									{plan.transport ? "Return" : "Day ends"}:{" "}
									<strong className="text-[#102040]">
										{timeLabel(change.newReturn)}
									</strong>
								</li>
							</ul>
						</div>
						<div className={section}>
							<h3 className="font-semibold">Current payment authorisation</h3>
							<p className="mt-3 text-2xl font-semibold">{money(total)}</p>
							<p className={`${muted} mt-3 text-sm`}>
								Demo only. No extra amount authorised.
							</p>
						</div>
						<div
							className={`${section} flex flex-wrap items-center justify-between gap-3`}
						>
							<div>
								<p className="font-semibold">Need to talk it through?</p>
								<p className={`${muted} mt-2 text-sm`}>
									Ask before you decide.
								</p>
							</div>
							<HelpLink />
						</div>
					</BookingCard>
				}
			>
				<div className="flex items-start gap-4">
					<span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#e9f3ff] text-ocean">
						<Icon name="waves" />
					</span>
					<div>
						<div className="flex flex-wrap items-center gap-3">
							<Heading>Sunset sailing</Heading>
							<span className="rounded-lg bg-sun px-3 py-1.5 text-xs font-semibold">
								Approval needed
							</span>
						</div>
						<p className={`${muted} mt-2 text-sm leading-relaxed`}>
							The original departure is unavailable in this example. A later
							sailing is available for your group.
						</p>
					</div>
				</div>
				<div className="my-5">
					<Callout title="Our recommendation">
						Take the later sailing and keep the rest of your day.
					</Callout>
				</div>
				<div className="overflow-hidden rounded-xl border border-[#dbeaff]">
					<table className="w-full table-fixed text-left text-sm">
						<thead>
							<tr className="border-b border-[#dbeaff]">
								<td />
								<th scope="col" className="p-3">
									Your original plan
								</th>
								<th scope="col" className="bg-[#e9f3ff] p-3">
									Proposed alternative
								</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => (
								<tr
									key={row.label}
									className="border-b border-[#dbeaff] last:border-b-0"
								>
									<th scope="row" className="p-3 font-medium">
										<span className="flex flex-wrap items-center gap-2">
											<Icon name={row.icon} className="size-4" />
											{row.label}
										</span>
									</th>
									<td className="border-l border-[#dbeaff] p-3">
										{row.before}
									</td>
									<td className="border-l border-[#dbeaff] bg-[#e9f3ff] p-3">
										{row.after}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="mt-3">
					<Callout>Other activities stay the same.</Callout>
				</div>
				<div className="mt-5 rounded-xl border border-[#dbeaff] p-4">
					<h3 className="text-lg font-semibold">Your price, updated</h3>
					<dl className="mt-3 text-sm">
						<div className="flex justify-between gap-3 border-b border-[#dbeaff] py-3">
							<dt>Previously approved total</dt>
							<dd>{money(total)}</dd>
						</div>
						<div className="flex justify-between gap-3 py-3">
							<dt>Increase</dt>
							<dd>+ {money(change.increase)}</dd>
						</div>
						<div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#e9f3ff] px-3 py-4 font-semibold">
							<dt>New total if approved</dt>
							<dd className="text-xl">{money(total + change.increase)}</dd>
						</div>
					</dl>
				</div>
				<p className={`${muted} mt-4 text-xs`}>
					This approval changes the demo estimate only. No extra amount is
					authorised.
				</p>
				<div className="mt-5 grid gap-3 tablet:grid-cols-[1fr_1.3fr]">
					<button
						type="button"
						className={lightButton}
						onClick={() =>
							onAdvance("confirmation-progress", { decision: "declined" })
						}
					>
						Decline change
					</button>
					<button
						type="button"
						className={blueButton}
						onClick={() =>
							onAdvance("confirmation-progress", { decision: "approved" })
						}
					>
						Approve change · + {money(change.increase)}{" "}
						<Icon name="next" className="size-4" />
					</button>
				</div>
				<p className={`${muted} mt-3 text-center text-xs`}>
					If you decline, another option is needed. Your trip stays unconfirmed.
				</p>
			</BookingGrid>
		</>
	);
}

const confirmedPlan: BookingPlan = {
	title: "A slow day on the west coast.",
	dayKey: "2026-10-23",
	date: "23 October 2026",
	travellers: "2 adults",
	guestCount: 2,
	start: "Flic en Flac",
	activities: [],
	transport: 2400,
	coordination: 800,
};
const confirmedStops: [string, IconName, string, string][] = [
	[
		"08:30",
		"car",
		"Hotel pickup",
		"Meet at your hotel entrance, Flic en Flac.",
	],
	["09:00", "sun", "Coastal breakfast", "A table for two by the water."],
	["10:00", "waves", "Time by the lagoon", "Free time, at your own pace."],
	["12:30", "sun", "Lunch with a view", "Local flavours, no rushing."],
	["16:30", "waves", "Sunset sailing", "Your approved later departure."],
	["19:15", "car", "Back at your hotel", ""],
];

function ConfirmedTrip() {
	const [action, setAction] = useState<
		"preview" | "updates" | "directions" | "receipt" | "share" | "change"
	>("preview");
	const [copyStatus, setCopyStatus] = useState("");
	const dialog = useRef<HTMLDialogElement>(null);
	const shareSummary =
		"Journey Forge sample trip: a slow day on the west coast of Mauritius. 23 October 2026, 08:30–19:15. This is a demo.";
	const panels = {
		preview: [
			"Preview your day",
			"Meet at the hotel entrance at 08:30. Your sample itinerary wraps up at 19:15.",
		],
		updates: [
			"Sample updates",
			"The example sunset sailing now departs at 16:30. Your return is scheduled for 19:15.",
		],
		directions: [
			"Meeting point",
			"Meet at the main entrance of your hotel in Flic en Flac. The coordinator would provide exact directions before the trip.",
		],
		receipt: [
			"Sample receipt",
			"Trip JF-1023 · MUR 10,400 · Paid in the demo. No real payment was made.",
		],
		share: ["Share summary", shareSummary],
		change: [
			"Cancel or request a change",
			"This is a sample trip. For a live booking, your coordinator would help you review changes or cancellation conditions.",
		],
	} as const;

	function show(next: typeof action) {
		setAction(next);
		setCopyStatus("");
		dialog.current?.showModal();
	}

	return (
		<>
			<BookingHeader
				title="Your day is all set."
				subtitle="Every detail, ready when you are."
				back={<BookingBack>Back to trips</BookingBack>}
			/>
			<div className="mt-4 flex flex-wrap items-start justify-between gap-4">
				<div>
					<p className="text-sm">Trip JF-1023 · Sample trip</p>
					<p className={`${muted} mt-2 text-xs`}>
						Design preview · No booking or payment made
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<a
						href="/dashboard/journey-forge-sample-trip.ics"
						download
						className={lightButton}
					>
						<Icon name="calendar" className="size-4 text-ocean" />
						Add to calendar
					</a>
					<button
						type="button"
						onClick={() => show("share")}
						className={lightButton}
					>
						Share summary
					</button>
				</div>
			</div>
			<div className="mt-6 flex flex-wrap gap-2.5">
				<button
					type="button"
					className={blueButton}
					onClick={() => show("preview")}
				>
					<Icon name="sun" className="size-4" />
					Preview your day
				</button>
				<button
					type="button"
					className={lightButton}
					onClick={() => show("updates")}
				>
					Sample updates
				</button>
				<HelpLink>I need help</HelpLink>
			</div>
			<BookingGrid
				aside={
					<BookingCard plan={confirmedPlan}>
						<div className={`${section} grid gap-4 text-sm`}>
							<div className="flex gap-3">
								<Icon name="clock" className="size-5 text-ocean" />
								<div>
									<p className="font-semibold">Pickup</p>
									<p className={`${muted} mt-2`}>
										08:30 · Your hotel, Flic en Flac
									</p>
								</div>
							</div>
							<div className="flex gap-3">
								<Icon name="pin" className="size-5 text-ocean" />
								<div>
									<p className="font-semibold">Meeting point</p>
									<p className={`${muted} mt-2`}>Main hotel entrance</p>
									<button
										type="button"
										className={`${textLink} mt-3`}
										onClick={() => show("directions")}
									>
										View directions
									</button>
								</div>
							</div>
						</div>
						<p className={`${section} flex justify-between gap-2 text-sm`}>
							<span>Confirmed total</span>
							<strong>{money(10400)}</strong>
						</p>
						<div className={section}>
							<p className="flex justify-between gap-2 text-sm">
								Payment{" "}
								<span className={`${demoBadge} ${stateClasses.confirmed}`}>
									Paid · demo
								</span>
							</p>
							<button
								type="button"
								className={`${textLink} mt-4`}
								onClick={() => show("receipt")}
							>
								View sample receipt →
							</button>
							<p className={`${muted} mt-3 text-xs`}>
								No real payment was made.
							</p>
						</div>
						<div className={section}>
							<p className="font-semibold">Your Journey Forge contact</p>
							<p className={`${muted} mt-2 mb-3 text-sm`}>
								Sample support contact
							</p>
							<HelpLink>Contact Journey Forge</HelpLink>
						</div>
					</BookingCard>
				}
			>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<Heading>Your confirmed itinerary</Heading>
					<span className={`${demoBadge} ${stateClasses.confirmed}`}>
						<Icon name="check" className="size-4" />
						Confirmed · demo
					</span>
				</div>
				<p className={`${section} mt-4 text-sm`}>23 October 2026 · Day 1</p>
				<ol className="mt-2 divide-y divide-[#dbeaff]">
					{confirmedStops.map(([time, icon, title, description]) => (
						<li
							key={time}
							className="grid grid-cols-[3rem_auto_1fr] items-start gap-3 py-4 text-sm"
						>
							<time dateTime={time} className="pt-1">
								{time}
							</time>
							<Icon name={icon} className="mt-1 size-5 text-ocean" />
							<div>
								<p className="font-semibold">{title}</p>
								{description && (
									<p className={`${muted} mt-2 text-sm`}>{description}</p>
								)}
							</div>
						</li>
					))}
				</ol>
				<div className="my-5">
					<Callout title="Your approved change is included.">
						The later sailing is part of this separate confirmed-trip example.
					</Callout>
				</div>
				<div className={section}>
					<h3 className="font-semibold">Before you go</h3>
					<div className="mt-4 grid gap-3 tablet:grid-cols-2">
						<div className="rounded-xl border border-[#dbeaff] p-4">
							<p className="font-semibold">Travellers</p>
							<p className={`${muted} mt-2 text-sm`}>
								2 adults. No additional needs noted.
							</p>
						</div>
						<div className="rounded-xl border border-[#dbeaff] p-4">
							<p className="font-semibold">Bring along</p>
							<p className={`${muted} mt-2 text-sm`}>
								Sun protection, swimwear and a light layer.
							</p>
						</div>
					</div>
					<button
						type="button"
						className={`${textLink} mt-5 underline underline-offset-2`}
						onClick={() => show("change")}
					>
						Cancel or request a change
					</button>
				</div>
			</BookingGrid>

			<dialog
				ref={dialog}
				aria-labelledby="confirmed-dialog"
				className="m-auto max-h-[90svh] w-[min(32rem,calc(100%-2rem))] overflow-auto rounded-2xl bg-white p-6 text-[#102040] shadow-xl backdrop:bg-[#172345]/50 motion-safe:open:animate-response-arrival"
			>
				<form
					method="dialog"
					className="mb-4 flex items-center justify-between gap-4"
				>
					<h2
						id="confirmed-dialog"
						className="text-2xl font-semibold tracking-tight"
					>
						{panels[action][0]}
					</h2>
					<button
						type="submit"
						aria-label="Close"
						className="grid size-9 place-items-center rounded-lg text-2xl hover:bg-[#e9f3ff]"
					>
						×
					</button>
				</form>
				<p className={`${muted} text-sm leading-relaxed`}>
					{panels[action][1]}
				</p>
				{action === "share" && (
					<>
						<button
							type="button"
							className={`${lightButton} mt-4`}
							onClick={async () => {
								try {
									await navigator.clipboard.writeText(shareSummary);
									setCopyStatus("Summary copied.");
								} catch {
									setCopyStatus(
										"Clipboard unavailable. You can select and copy the summary above.",
									);
								}
							}}
						>
							Copy sample summary
						</button>
						{copyStatus && (
							<p role="status" className="mt-2 text-sm">
								{copyStatus}
							</p>
						)}
					</>
				)}
			</dialog>
		</>
	);
}

export default function BookingStatus({
	step,
	preview,
	onAdvance,
}: {
	step:
		| "request-received"
		| "confirmation-progress"
		| "change-approval"
		| "confirmed-trip";
	preview?: BookingPreview;
	onAdvance: Advance;
}) {
	if (step === "confirmed-trip") return <ConfirmedTrip />;
	if (!preview) return null;
	if (step === "request-received") return <RequestReceived preview={preview} />;
	if (step === "confirmation-progress")
		return <ConfirmationProgress preview={preview} />;
	return <ChangeApproval preview={preview} onAdvance={onAdvance} />;
}
