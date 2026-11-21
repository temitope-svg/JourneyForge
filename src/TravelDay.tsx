import { Link } from "@tanstack/react-router";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
	BookingBack,
	BookingCard,
	BookingHeader,
	blueButton,
	box,
	Callout,
	field,
	Heading,
	lightButton,
	money,
	muted,
	section,
	textLink,
} from "./BookingLayout";
import { confirmedPlan, confirmedTotal } from "./confirmedSampleTrip";
import { Icon } from "./DashboardIcon";
import { timeLabel } from "./itineraryChanges";
import {
	readTabValue,
	travelStops,
	tripUpdates,
	updateKey,
	updateReadIds,
	writeTabValue,
} from "./travelDaySample";

type Stage = "today" | "trip-update" | "trip-help";

function TripLink({
	step,
	children,
	primary = false,
}: {
	step: Stage;
	children: ReactNode;
	primary?: boolean;
}) {
	return (
		<Link
			to="/trips/booking/$step"
			params={{ step }}
			className={primary ? blueButton : lightButton}
		>
			{children}
		</Link>
	);
}

function Modal({
	dialog,
	title,
	children,
}: {
	dialog: React.RefObject<HTMLDialogElement | null>;
	title: string;
	children: ReactNode;
}) {
	return (
		<dialog
			ref={dialog}
			aria-labelledby="travel-dialog-title"
			className="m-auto max-h-[90svh] w-[min(35rem,calc(100%-2rem))] overflow-auto rounded-2xl border border-[#dbeaff] bg-white p-6 text-[#102040] shadow-xl backdrop:bg-[#172345]/50 backdrop:backdrop-blur-xs tablet:p-8"
		>
			<form
				method="dialog"
				className="mb-5 flex items-start justify-between gap-4"
			>
				<h2
					id="travel-dialog-title"
					className="text-2xl font-semibold tracking-tight"
				>
					{title}
				</h2>
				<button
					type="submit"
					aria-label="Close"
					className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eef4fc] text-2xl hover:bg-[#e9f3ff]"
				>
					×
				</button>
			</form>
			{children}
		</dialog>
	);
}

function Layout({
	children,
	aside,
}: {
	children: ReactNode;
	aside: ReactNode;
}) {
	return (
		<div className="mt-6 grid items-start gap-5 desktop:grid-cols-[1.65fr_1fr]">
			<div className="min-w-0 space-y-5">{children}</div>
			<div className="min-w-0 space-y-5">{aside}</div>
		</div>
	);
}

function SampleLine({ children }: { children: ReactNode }) {
	return (
		<p className="mt-3 w-fit rounded-full bg-[#e9f3ff] px-3 py-1.5 text-xs text-[#506582]">
			{children}
		</p>
	);
}

function Today({ email, showPickup }: { email: string; showPickup: boolean }) {
	const [clock, setClock] = useState(showPickup ? 495 : 585);
	const [meeting, setMeeting] = useState("");
	const dialog = useRef<HTMLDialogElement>(null);
	const next = travelStops.find((stop) => stop.end > clock);
	const completed = travelStops.filter((stop) => stop.end <= clock);
	const later = next ? travelStops.filter((stop) => stop.time > next.time) : [];
	const read = updateReadIds(email);
	const unread = tripUpdates.filter(
		(update) => !read.includes(update.id),
	).length;

	useEffect(() => {
		if (showPickup && !dialog.current?.open) dialog.current?.showModal();
	}, [showPickup]);

	function openMeeting(location: string) {
		setMeeting(location);
		dialog.current?.showModal();
	}

	return (
		<>
			<BookingHeader
				title="Your day, unfolding."
				subtitle="One good moment at a time."
				back={<BookingBack step="confirmed-trip">Back to trip</BookingBack>}
			/>
			<div className="mt-3 flex flex-wrap items-start justify-between gap-3">
				<div>
					<p className="text-sm">23 October 2026 · Day 1 · 2 adults</p>
					<SampleLine>Sample trip · No live tracking</SampleLine>
				</div>
				<TripLink step="trip-help">I need help</TripLink>
			</div>
			<label
				className={`${muted} mt-4 flex flex-wrap items-center gap-2 text-xs`}
			>
				Sample day · Demo clock{" "}
				<select
					value={clock}
					onChange={(event) => setClock(Number(event.target.value))}
					className="min-h-9 rounded-md border border-[#c7d7ef] bg-white px-2 text-[#102040]"
				>
					{[495, 530, 585, 610, 735, 975, 1155, 1170].map((minute) => (
						<option key={minute} value={minute}>
							{timeLabel(minute)}
						</option>
					))}
				</select>{" "}
				Mauritius time
			</label>

			<Layout
				aside={
					<BookingCard plan={confirmedPlan}>
						<div className={section}>
							<p className="flex items-center gap-2 font-semibold">
								<Icon name="pin" className="size-5 text-ocean" />
								Where to meet
							</p>
							<p className={`${muted} mt-3 text-sm`}>
								{next?.meeting ?? confirmedPlan.start}
							</p>
							<p className={`${muted} mt-2 text-xs`}>
								Sample location · confirm before travelling
							</p>
							<button
								type="button"
								className={`${lightButton} mt-4`}
								onClick={() =>
									openMeeting(next?.meeting ?? confirmedPlan.start)
								}
							>
								View directions
							</button>
						</div>
						<div className={section}>
							<p className="font-semibold">Bring along</p>
							<ul className={`${muted} mt-3 grid gap-2 text-sm`}>
								<li>Sun protection</li>
								<li>Swimwear and a light layer</li>
								<li>Water</li>
							</ul>
						</div>
						<div className={section}>
							<p className="font-semibold">Your Journey Forge contact</p>
							<p className={`${muted} mt-2 mb-4 text-sm`}>
								Contact details appear when approved for sharing.
							</p>
							<TripLink step="trip-help">Contact Journey Forge</TripLink>
						</div>
					</BookingCard>
				}
			>
				<section className="rounded-2xl border border-[#dbeaff] border-t-[4px] border-t-ocean bg-[#e9f3ff] p-5 tablet:p-7">
					<div className="flex flex-wrap items-center justify-between gap-2 text-xs">
						<div className="flex items-center gap-3 font-semibold text-ocean">
							{next ? (
								<>
									{clock < next.time ? "UP NEXT" : "NOW"} ·{" "}
									{timeLabel(next.time)}
									{clock < next.time && (
										<span className="rounded-full bg-sun px-3 py-1.5 text-[#102040]">
											In {next.time - clock} min
										</span>
									)}
								</>
							) : (
								"DAY COMPLETE"
							)}
						</div>
						<p className="rounded-full bg-[#e5f7ed] px-3 py-1.5 text-[#175743]">
							Sample day
						</p>
					</div>
					<div className="mt-6 flex items-start gap-4">
						<Icon
							name={next?.icon ?? "check"}
							className="size-9 shrink-0 text-ocean"
						/>
						<div>
							<h2 className="text-[clamp(1.75rem,3vw,2.45rem)] leading-tight font-semibold tracking-tight">
								{next?.title ?? "That’s a wrap."}
							</h2>
							<p className={`${muted} mt-2 leading-relaxed`}>
								{next?.copy ??
									"You’ve reached the end of this sample itinerary."}
							</p>
						</div>
					</div>
					{next && (
						<p className="mt-6 flex flex-wrap items-center gap-2 text-sm">
							<Icon name="pin" className="size-5 text-ocean" />
							{next.meeting}
							<span className={`${muted} text-xs`}>Sample meeting point</span>
						</p>
					)}
					<div className="mt-5 flex flex-wrap gap-3">
						{next && (
							<button
								type="button"
								className={blueButton}
								onClick={() => openMeeting(next.meeting)}
							>
								<Icon name="pin" className="size-4" />
								View meeting details
							</button>
						)}
						<TripLink step="trip-help">I need help</TripLink>
					</div>
					<details className="group mt-6 border-t border-[#c7d7ef] pt-5">
						<summary className="flex cursor-pointer list-none items-start gap-3 text-sm [&::-webkit-details-marker]:hidden">
							<Icon name="check" className="size-5 shrink-0 text-[#175743]" />
							<span className="flex-1 font-semibold">
								{completed.length} completed{" "}
								{completed.length === 1 ? "step" : "steps"}
								{completed.length > 0 && (
									<span className={`${muted} mt-1 block text-xs font-normal`}>
										{completed.map((stop) => stop.title).join(" · ")}
									</span>
								)}
							</span>
							<span
								aria-hidden="true"
								className="mt-1 size-2 rotate-45 border-r border-b group-open:rotate-[225deg]"
							/>
						</summary>
						{completed.length > 0 && (
							<ul className="mt-4 grid gap-2 pl-8 text-sm">
								{completed.map((stop) => (
									<li key={stop.title}>
										{timeLabel(stop.time)} · {stop.title}
									</li>
								))}
							</ul>
						)}
					</details>
				</section>
				<section className={`${box} p-5 tablet:p-6`}>
					<Heading>Later today</Heading>
					{later.length ? (
						<ol className="mt-4 divide-y divide-[#dbeaff] border-y border-[#dbeaff]">
							{later.map((stop) => (
								<li
									key={stop.title}
									className="grid grid-cols-[3.5rem_auto_1fr] items-start gap-3 py-4"
								>
									<time className={`${muted} pt-0.5 text-sm`}>
										{timeLabel(stop.time)}
									</time>
									<Icon name={stop.icon} className="size-5 text-ocean" />
									<div>
										<p className="font-semibold">{stop.title}</p>
										<p className={`${muted} mt-2 text-sm`}>{stop.copy}</p>
									</div>
								</li>
							))}
						</ol>
					) : (
						<p className={`${muted} mt-4 text-sm`}>
							There are no more stops after this.
						</p>
					)}
					<p className={`${muted} mt-4 text-xs`}>
						Sample timings. The update history records the earlier pickup delay.
					</p>
				</section>
				<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#e9f3ff] p-4 text-sm">
					<div>
						<p>Your sailing time is confirmed for 16:30.</p>
						<p className={`${muted} mt-1 text-xs`}>
							{unread} unread sample {unread === 1 ? "update" : "updates"}
						</p>
					</div>
					<Link
						to="/trips/booking/$step"
						params={{ step: "trip-update" }}
						className={`${textLink} inline-flex gap-2`}
					>
						View updates <Icon name="next" className="size-4" />
					</Link>
				</div>
			</Layout>

			<Modal dialog={dialog} title="Your meeting details">
				<p className={`${muted} text-sm font-semibold`}>
					{meeting || (showPickup ? travelStops[0].meeting : next?.meeting)}
				</p>
				<p className={`${muted} mt-2 text-sm leading-relaxed`}>
					Sample location only. Confirm the exact address before travelling.
					Directions and partner details aren’t connected in this preview. No
					route or live driver location is shown.
				</p>
				<div className="mt-5">
					<TripLink step="trip-help" primary>
						I need help
					</TripLink>
				</div>
			</Modal>
		</>
	);
}

function TripUpdate({ email }: { email: string }) {
	const [selected, setSelected] =
		useState<(typeof tripUpdates)[number]["id"]>("delay");
	const [read, setRead] = useState(() => updateReadIds(email));
	const [notice, setNotice] = useState("");
	const update =
		tripUpdates.find((item) => item.id === selected) ?? tripUpdates[0];

	function markRead() {
		const next = [...new Set([...read, update.id])];
		setRead(next);
		setNotice(
			writeTabValue(updateKey(email), next)
				? "Update marked as read."
				: "Update marked as read for this visit.",
		);
	}

	return (
		<>
			<BookingHeader
				title="A small delay. You’re in the loop."
				subtitle="The latest on your day, all in one place."
				back={<BookingBack step="today">Back to today</BookingBack>}
			/>
			<p className="mt-4 text-sm">Trip JF-1023 · 23 October 2026</p>
			<SampleLine>Sample update · No live partner connection</SampleLine>
			<Layout
				aside={
					<>
						<aside className={`${box} p-3`}>
							<img
								src="/dashboard/west-coast.webp"
								alt=""
								className="aspect-[1.9] w-full rounded-xl object-cover"
							/>
							<div className="p-4">
								<Heading>Your updated pickup</Heading>
								<p className="mt-3 flex items-baseline gap-3 text-4xl font-semibold tracking-tight">
									08:50{" "}
									<s className={`${muted} text-base font-normal`}>08:30</s>
								</p>
								<p className="mt-5 flex items-center gap-2 text-sm font-semibold">
									<Icon name="pin" className="size-5 text-ocean" />
									Your hotel, Flic en Flac
								</p>
								<p className={`${muted} mt-2 text-sm`}>Main hotel entrance</p>
								<Link
									to="/trips/booking/$step"
									params={{ step: "today" }}
									search={{ meeting: "pickup" }}
									className={`${lightButton} mt-4`}
								>
									View pickup details
								</Link>
							</div>
						</aside>
						<section className={`${box} p-5`}>
							<Heading>Update history</Heading>
							<ul className="mt-4 divide-y divide-[#dbeaff]">
								{tripUpdates.map((item) => (
									<li key={item.id}>
										<button
											type="button"
											aria-pressed={item.id === selected}
											onClick={() => {
												setSelected(item.id);
												setNotice("");
											}}
											className="grid w-full grid-cols-[4rem_1fr] gap-3 py-3 text-left text-sm hover:text-ocean"
										>
											<span className={muted}>{item.time}</span>
											<span
												className={`border-l-2 pl-3 ${item.id === selected ? "border-ocean" : "border-[#dbeaff]"}`}
											>
												<span className="block font-semibold">
													{item.label}
												</span>
												<span className={`${muted} mt-1 block text-xs`}>
													{item.summary}
												</span>
												<span className="mt-2 block text-xs text-ocean">
													{read.includes(item.id) ? "Read" : "Unread"}
													{item.id === selected ? " · Viewing" : ""}
												</span>
											</span>
										</button>
									</li>
								))}
							</ul>
							<p className={`${muted} mt-3 text-xs`}>
								Updates stay here after you’ve read them.
							</p>
						</section>
						<section className={`${box} p-5`}>
							<p className="font-semibold">Your Journey Forge contact</p>
							<p className={`${muted} mt-2 mb-4 text-sm`}>
								Contact details appear when approved for sharing.
							</p>
							<TripLink step="trip-help">Contact Journey Forge</TripLink>
						</section>
					</>
				}
			>
				<section className={`${box} p-5 tablet:p-7`}>
					<Callout warning title={update.heading}>
						{update.time === "Yesterday"
							? update.time
							: `23 October 2026 · ${update.time} Mauritius time`}
					</Callout>
					<div className={`${section} mt-5 pb-5`}>
						<p className="font-semibold">What happened</p>
						<p className={`${muted} mt-2 text-sm`}>{update.happened}</p>
					</div>
					<div className={`${section} pb-5`}>
						<p className="font-semibold">What we’re doing</p>
						<p className={`${muted} mt-2 text-sm`}>
							Journey Forge is checking the rest of your schedule in this
							example.
						</p>
					</div>
					<Callout title="What you need to do">{update.action}</Callout>
					<table className="mt-5 w-full text-left text-sm">
						<thead className="bg-[#e9f3ff]">
							<tr>
								<td />
								<th scope="col" className="p-3">
									Original
								</th>
								<th scope="col" className="p-3">
									Updated
								</th>
							</tr>
						</thead>
						<tbody>
							{[
								[update.item, update.before, update.after],
								...(update.item === "Meeting point"
									? []
									: [["Meeting point", "Hotel entrance", "Unchanged"]]),
								["Price", money(confirmedTotal), "No change"],
							].map(([label, before, after]) => (
								<tr key={label} className="border-b border-[#dbeaff]">
									<th scope="row" className="p-3 font-medium">
										{label}
									</th>
									<td className={`${muted} p-3`}>{before}</td>
									<td className={`${muted} p-3`}>{after}</td>
								</tr>
							))}
						</tbody>
					</table>
					<p className={`${muted} my-4 text-xs`}>
						Any further sample change will appear here.
					</p>
					<Callout>No approval needed. No new price change.</Callout>
					<div className="mt-5 flex flex-wrap gap-3">
						<button
							type="button"
							onClick={markRead}
							disabled={read.includes(update.id)}
							className={blueButton}
						>
							<Icon name="check" className="size-4" />
							{read.includes(update.id) ? "Marked as read" : "Mark as read"}
						</button>
						<TripLink step="trip-help">I need help</TripLink>
					</div>
					{notice && (
						<p className="mt-3 text-sm text-ocean" role="status">
							{notice}
						</p>
					)}
				</section>
			</Layout>
		</>
	);
}

const helpTopics = [
	["I can’t find the pickup or venue", "car"],
	["The driver or partner is late", "clock"],
	["Something is different from the plan", "pin"],
	["I need to cancel or leave early", "calendar"],
	["Safety or medical issue", "heart"],
	["Something else", "people"],
] as const;
const defaultHelp = {
	topic: 0,
	message: "",
	location: "Hotel entrance, Flic en Flac",
};

function TripHelp({ email }: { email: string }) {
	const storageKey = `journey-forge:trip-help:${email}:JF-1023`;
	const [draft, setDraft] = useState(
		() =>
			readTabValue(storageKey, (value): value is typeof defaultHelp => {
				if (
					!value ||
					typeof value !== "object" ||
					!("topic" in value) ||
					!("message" in value) ||
					!("location" in value)
				)
					return false;
				return (
					typeof value.topic === "number" &&
					Number.isInteger(value.topic) &&
					value.topic >= 0 &&
					value.topic < helpTopics.length &&
					typeof value.message === "string" &&
					typeof value.location === "string"
				);
			}) ?? defaultHelp,
	);
	const [mode, setMode] = useState<"emergency" | "preview">("preview");
	const [notice, setNotice] = useState("");
	const dialog = useRef<HTMLDialogElement>(null);

	function open(next: typeof mode) {
		setMode(next);
		dialog.current?.showModal();
	}

	function saveDraft() {
		const saved = writeTabValue(storageKey, {
			...draft,
			message: draft.message.trim(),
			location: draft.location.trim(),
		});
		setNotice(
			saved
				? "Help draft saved in this tab. No message was sent."
				: "Browser storage is unavailable. Your draft is here for this visit.",
		);
		dialog.current?.close();
	}

	return (
		<>
			<BookingHeader
				title="A person in your corner."
				subtitle="Tell us what’s happening. We’ll help with the next step."
				back={<BookingBack step="today">Back to today</BookingBack>}
			/>
			<p className="mt-4 text-sm">
				Trip JF-1023 · A slow day on the west coast
			</p>
			<SampleLine>Design preview · No message will be sent</SampleLine>
			<div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#f3b7be] bg-[#fff1f2] p-4 text-sm text-[#8d1730]">
				<div>
					<p className="font-semibold">
						Immediate danger or a medical emergency?
					</p>
					<p className="mt-1">Contact local emergency services first.</p>
				</div>
				<button
					type="button"
					className="font-semibold underline underline-offset-2"
					onClick={() => open("emergency")}
				>
					Emergency guidance
				</button>
			</div>
			<Layout
				aside={
					<>
						<BookingCard plan={confirmedPlan}>
							<p className={`${muted} text-xs`}>Trip JF-1023 · Sample trip</p>
						</BookingCard>
						<section className={`${box} p-5`}>
							<Heading>What happens after you send</Heading>
							<p
								className={`${muted} mt-4 rounded-lg bg-[#e9f3ff] p-3 text-sm`}
							>
								Sample support case · JF-H001
							</p>
							<ol className="my-5 grid gap-4 text-sm">
								{[
									[
										"Request received · demo",
										"Your issue would be kept with this trip.",
									],
									[
										"Waiting for a person",
										"Response time is unavailable in this preview.",
									],
									[
										"A coordinator replies",
										"Their reply and next steps would appear here.",
									],
								].map(([title, copy]) => (
									<li key={title} className="border-l-2 border-[#dbeaff] pl-3">
										<p className="font-semibold">{title}</p>
										<p className={`${muted} mt-2 text-xs`}>{copy}</p>
									</li>
								))}
							</ol>
							<Callout>
								This is a preview. No issue has been sent or received.
							</Callout>
						</section>
					</>
				}
			>
				<form
					className={`${box} space-y-5 p-5 tablet:p-7`}
					onSubmit={(event) => {
						event.preventDefault();
						open("preview");
					}}
				>
					<Heading>What do you need help with?</Heading>
					<fieldset
						className="grid gap-3 tablet:grid-cols-2"
						aria-label="Help topic"
					>
						{helpTopics.map(([topic, icon], index) => (
							<label
								key={topic}
								className="flex min-h-16 cursor-pointer items-center gap-2.5 rounded-lg border border-[#c7d7ef] p-3 text-sm has-checked:border-ocean has-checked:bg-[#e9f3ff] has-focus-visible:outline-2 has-focus-visible:outline-ocean"
							>
								<input
									type="radio"
									name="help-topic"
									checked={draft.topic === index}
									onChange={() => {
										setDraft({ ...draft, topic: index });
										setNotice("");
									}}
									className="size-4 shrink-0 accent-ocean"
								/>
								<Icon name={icon} className="size-5 shrink-0 text-ocean" />
								{topic}
							</label>
						))}
					</fieldset>
					<label className="block text-sm font-semibold">
						Tell us a little more
						<textarea
							className={`${field} mt-2 min-h-28 py-3 font-normal`}
							maxLength={1200}
							placeholder="I’m at the hotel entrance but can’t see the pickup vehicle."
							value={draft.message}
							onChange={(event) => {
								setDraft({ ...draft, message: event.target.value });
								setNotice("");
							}}
						/>
					</label>
					<label className="block text-sm font-semibold">
						Where are you now?{" "}
						<span className={`${muted} font-normal`}>(optional)</span>
						<input
							className={`${field} mt-2 font-normal`}
							maxLength={160}
							value={draft.location}
							onChange={(event) => {
								setDraft({ ...draft, location: event.target.value });
								setNotice("");
							}}
						/>
					</label>
					<p className={`${muted} text-xs leading-relaxed`}>
						Share only what’s needed to help. Drafts stay in this tab’s session.
						Nothing is sent.
					</p>
					<div className="flex flex-wrap gap-3">
						<button type="submit" className={blueButton}>
							Preview help request <Icon name="next" className="size-4" />
						</button>
						<TripLink step="today">Back to today</TripLink>
					</div>
					{notice && (
						<p className="text-sm text-ocean" role="status">
							{notice}
						</p>
					)}
				</form>
			</Layout>
			<Modal
				dialog={dialog}
				title={
					mode === "emergency"
						? "Emergency guidance"
						: "Review your help request"
				}
			>
				{mode === "emergency" ? (
					<p className={`${muted} text-sm leading-relaxed`}>
						If there’s immediate danger or a medical emergency, contact local
						emergency services first.
					</p>
				) : (
					<>
						<p className="font-semibold">{helpTopics[draft.topic][0]}</p>
						{draft.message.trim() && (
							<p
								className={`${muted} mt-3 text-sm whitespace-pre-wrap wrap-anywhere`}
							>
								{draft.message.trim()}
							</p>
						)}
						{draft.location.trim() && (
							<p className={`${muted} mt-3 text-sm wrap-anywhere`}>
								{draft.location.trim()}
							</p>
						)}
						<div className="mt-5">
							<Callout>
								Saving keeps the draft in this tab. No message will be sent.
							</Callout>
						</div>
						<div className="mt-5 flex flex-wrap gap-3">
							<button
								type="button"
								className={lightButton}
								onClick={() => dialog.current?.close()}
							>
								Edit draft
							</button>
							<button type="button" className={blueButton} onClick={saveDraft}>
								Save help draft
							</button>
						</div>
					</>
				)}
			</Modal>
		</>
	);
}

export default function TravelDay({
	step,
	email,
	meeting,
}: {
	step: Stage;
	email: string;
	meeting?: "pickup";
}) {
	return (
		<main className="mx-auto max-w-[100rem] px-4 pt-6 pb-14 tablet:px-8">
			{step === "today" ? (
				<Today email={email} showPickup={meeting === "pickup"} />
			) : step === "trip-update" ? (
				<TripUpdate email={email} />
			) : (
				<TripHelp email={email} />
			)}
		</main>
	);
}
