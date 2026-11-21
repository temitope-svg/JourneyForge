import { Link } from "@tanstack/react-router";
import { type FormEvent, useRef, useState } from "react";
import {
	BookingBack,
	BookingCard,
	BookingGrid,
	BookingHeader,
	blueButton,
	Callout,
	field,
	Heading,
	lightButton,
	money,
	muted,
	section,
} from "./BookingLayout";
import { confirmedPlan, confirmedTotal } from "./confirmedSampleTrip";
import { Icon } from "./DashboardIcon";

const bookings = [
	{ name: "The whole trip", amount: confirmedTotal },
	{ name: "Private transport", amount: confirmedPlan.transport },
	{ name: "Coastal breakfast", amount: 800 },
	{ name: "Lunch with a view", amount: 2400 },
	{ name: "Sunset sailing", amount: 4000 },
];
const initialDraft = { selection: bookings[0].name, message: "" };

function readDraft(key: string) {
	try {
		const value = JSON.parse(sessionStorage.getItem(key) ?? "null");
		if (
			value &&
			bookings.some(({ name }) => name === value.selection) &&
			typeof value.message === "string" &&
			value.message.length <= 1200
		) {
			return { selection: value.selection as string, message: value.message };
		}
	} catch {
		// A draft can still be composed with storage unavailable.
	}
	return initialDraft;
}

export default function ChangeTrip({
	email,
	cancel = false,
}: {
	email: string;
	cancel?: boolean;
}) {
	const key = `journey-forge:change-draft:${email}:JF-1023`;
	const [draft, setDraft] = useState(() => readDraft(key));
	const [cancelScope, setCancelScope] = useState("activity");
	const [activity, setActivity] = useState("Sunset sailing");
	const [notice, setNotice] = useState("");
	const [error, setError] = useState("");
	const message = useRef<HTMLTextAreaElement>(null);
	const dialog = useRef<HTMLDialogElement>(null);
	const selected =
		bookings.find(
			({ name }) =>
				name ===
				(cancel
					? cancelScope === "activity"
						? activity
						: cancelScope
					: draft.selection),
		) ?? bookings[0];

	function openReview(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!draft.message.trim()) {
			setError("Tell us what you’d like to change.");
			message.current?.focus();
			return;
		}
		setError("");
		dialog.current?.showModal();
	}

	function saveDraft() {
		try {
			const saved = { ...draft, message: draft.message.trim() };
			sessionStorage.setItem(key, JSON.stringify(saved));
			setDraft(saved);
			setNotice("Change draft saved in this tab. No request was sent.");
		} catch {
			setNotice(
				"Browser storage is unavailable. Your draft is here for this visit.",
			);
		}
		dialog.current?.close();
	}

	return (
		<main className="mx-auto max-w-[100rem] px-4 pt-6 pb-14 tablet:px-8">
			<BookingHeader
				title="Plans change. Let’s work it out."
				subtitle="Review your options before anything changes."
				back={<BookingBack step="confirmed-trip">Back to trip</BookingBack>}
			/>
			<p className="mt-5 text-sm">Trip JF-1023 · Sample trip</p>
			<p className={`${muted} mt-3 text-xs`}>
				Design preview · No booking or payment made
			</p>

			<BookingGrid
				aside={
					<BookingCard plan={confirmedPlan}>
						<p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#e5f7ed] px-3 py-1.5 text-xs font-medium text-[#175743]">
							<Icon name="check" className="size-4" />
							Confirmed · demo
						</p>
						<div className={section}>
							<h3 className="font-semibold">Selected booking</h3>
							<div className="mt-4 flex items-start gap-3">
								<Icon name="calendar" className="size-6 text-ocean" />
								<div>
									<p className="font-semibold">{selected.name}</p>
									<p className={`${muted} mt-2 text-sm`}>
										{confirmedPlan.travellers} · {confirmedPlan.date}
									</p>
								</div>
							</div>
						</div>
						<dl
							className={`${section} flex items-center justify-between gap-3 text-sm`}
						>
							<dt>Selection amount</dt>
							<dd className="font-semibold">{money(selected.amount)}</dd>
						</dl>
						<Callout title="Nothing changes yet.">
							A request must be reviewed before any confirmed booking changes.
						</Callout>
						<div className={section}>
							<p className="font-semibold">Your Journey Forge contact</p>
							<p className={`${muted} my-3 text-sm`}>Sample support contact</p>
							<Link
								to="/trips/booking/$step"
								params={{ step: "trip-help" }}
								className={lightButton}
							>
								Contact Journey Forge
							</Link>
						</div>
					</BookingCard>
				}
			>
				<nav
					aria-label="Manage sample trip"
					className="grid grid-cols-2 overflow-hidden rounded-lg border border-[#dbeaff] bg-[#f4f7fb]"
				>
					<Link
						to="/trips/booking/$step"
						params={{ step: "change-trip" }}
						className="grid min-h-12 place-items-center border-b-2 border-transparent px-3 py-2 text-center text-sm text-[#506582] hover:text-ocean aria-[current=page]:border-ocean aria-[current=page]:bg-white aria-[current=page]:text-ocean"
					>
						Request a change
					</Link>
					<Link
						to="/trips/booking/$step"
						params={{ step: "cancel-trip" }}
						className="grid min-h-12 place-items-center border-b-2 border-transparent px-3 py-2 text-center text-sm text-[#506582] hover:text-ocean aria-[current=page]:border-ocean aria-[current=page]:bg-white aria-[current=page]:text-ocean"
					>
						Cancel a booking
					</Link>
				</nav>

				{!cancel ? (
					<form className="mt-7 space-y-5" onSubmit={openReview}>
						<div>
							<Heading>What would make the day work better?</Heading>
							<p className={`${muted} mt-3 text-sm leading-relaxed`}>
								Tell us what you have in mind. Your confirmed itinerary stays
								unchanged.
							</p>
						</div>
						<label className="block text-sm font-semibold">
							Which part of your trip?
							<select
								value={draft.selection}
								onChange={(event) => {
									setDraft({ ...draft, selection: event.target.value });
									setNotice("");
								}}
								className={`${field} mt-2 font-normal`}
							>
								{bookings.map(({ name }) => (
									<option key={name}>{name}</option>
								))}
							</select>
						</label>
						<div>
							<label
								htmlFor="change-trip-message"
								className="block text-sm font-semibold"
							>
								What would you like to change?
							</label>
							<textarea
								ref={message}
								id="change-trip-message"
								value={draft.message}
								maxLength={1200}
								aria-invalid={Boolean(error)}
								aria-describedby={
									error
										? "change-trip-error change-trip-hint"
										: "change-trip-hint"
								}
								onChange={(event) => {
									setDraft({ ...draft, message: event.target.value });
									setError("");
									setNotice("");
								}}
								placeholder="A different time, an extra guest, another way to spend the afternoon…"
								className={`${field} mt-2 min-h-40 py-3 leading-relaxed`}
							/>
							<p
								id="change-trip-hint"
								className={`${muted} mt-3 text-xs leading-relaxed`}
							>
								Up to 1,200 characters. Leave out payment details and sensitive
								personal information.
							</p>
							{error && (
								<p
									id="change-trip-error"
									role="alert"
									className="mt-2 text-sm text-red-800"
								>
									{error}
								</p>
							)}
						</div>
						<Callout title="Nothing changes yet.">
							Any new price, availability or timing needs review and your
							approval. This preview can save a draft, but cannot send a
							request.
						</Callout>
						<div className="flex flex-wrap gap-3">
							<button type="submit" className={blueButton}>
								Review change draft <Icon name="next" className="size-4" />
							</button>
							<Link
								to="/trips/booking/$step"
								params={{ step: "confirmed-trip" }}
								className={lightButton}
							>
								Keep my trip
							</Link>
						</div>
						{notice && (
							<p role="status" className="text-sm text-ocean">
								{notice}
							</p>
						)}
					</form>
				) : (
					<div className="mt-6 space-y-5">
						<ol
							className="grid grid-cols-4 gap-2 text-center text-xs"
							aria-label="Cancellation steps"
						>
							{["Select", "Review policy", "Reason", "Confirm"].map(
								(label, i) => (
									<li
										key={label}
										aria-current={i === 1 ? "step" : undefined}
										className={i < 2 ? "text-ocean" : muted}
									>
										<span
											className={`mx-auto mb-2 grid size-8 place-items-center rounded-full border ${i < 2 ? "border-ocean bg-ocean font-semibold text-white" : "border-[#92a5c1]"}`}
										>
											{i + 1}
										</span>
										{label}
									</li>
								),
							)}
						</ol>
						<fieldset className="space-y-4">
							<legend className="mb-5 text-[1.6rem] font-semibold tracking-tight">
								What would you like to cancel?
							</legend>
							{[
								[
									"The whole trip",
									"The whole trip",
									"Cancel all confirmed bookings for this trip.",
								],
								[
									"activity",
									"One activity",
									"Cancel a single activity, keeping the rest of your trip unchanged.",
								],
								[
									"Private transport",
									"Private transport",
									"Cancel only your private transport booking.",
								],
							].map(([value, label, copy]) => (
								<label
									key={value}
									className="flex cursor-pointer items-start gap-3 text-sm"
								>
									<input
										type="radio"
										name="cancel-scope"
										checked={cancelScope === value}
										onChange={() => setCancelScope(value)}
										className="mt-0.5 size-4 shrink-0 accent-ocean"
									/>
									<span>
										<span className="font-semibold">{label}</span>
										<span className={`${muted} mt-2 block text-xs`}>
											{copy}
										</span>
									</span>
								</label>
							))}
						</fieldset>
						{cancelScope === "activity" && (
							<div className={section}>
								<label className="grid items-center gap-2 text-sm tablet:grid-cols-[5rem_1fr]">
									Activity
									<select
										value={activity}
										onChange={(event) => setActivity(event.target.value)}
										className={field}
									>
										<option value="Sunset sailing">
											Sunset sailing · 16:30
										</option>
										<option value="Coastal breakfast">
											Coastal breakfast · 09:00
										</option>
										<option value="Lunch with a view">
											Lunch with a view · 12:30
										</option>
									</select>
								</label>
								<p className={`${muted} mt-2 text-xs tablet:pl-[5.5rem]`}>
									The rest of your trip stays unchanged.
								</p>
							</div>
						)}
						<div className={section}>
							<Heading>Before you decide</Heading>
							<div className="mt-4">
								<Callout warning title="Cancellation policy pending">
									The partner’s terms are unavailable in this preview. Those
									terms are needed before you can confirm.
								</Callout>
							</div>
						</div>
						<dl className="divide-y divide-[#dbeaff] border-y border-[#dbeaff] text-sm">
							<div className="flex justify-between gap-3 py-3">
								<dt>Amount paid for this selection</dt>
								<dd>{money(selected.amount)} · demo</dd>
							</div>
							<div className="flex justify-between gap-3 py-3">
								<dt>Estimated refund</dt>
								<dd>Not available yet</dd>
							</div>
						</dl>
						<p className={`${muted} text-xs`}>
							Any applicable fees and the refund estimate must appear before
							confirmation.
						</p>
						<div className="flex flex-wrap gap-3">
							<button
								type="button"
								disabled
								className={`${lightButton} disabled:cursor-not-allowed disabled:bg-[#eef2f7] disabled:text-[#687a94]`}
							>
								Continue to reason
							</button>
							<Link
								to="/trips/booking/$step"
								params={{ step: "confirmed-trip" }}
								className={lightButton}
							>
								Keep my trip
							</Link>
						</div>
						<p className={`${muted} text-xs`}>
							Available once the policy and refund estimate are provided.
						</p>
					</div>
				)}
			</BookingGrid>

			<dialog
				ref={dialog}
				aria-labelledby="change-draft-title"
				className="m-auto max-h-[90svh] w-[min(35rem,calc(100%-2rem))] overflow-auto rounded-2xl border border-[#dbeaff] bg-white p-6 text-[#102040] shadow-xl backdrop:bg-[#172345]/40 backdrop:backdrop-blur-xs"
			>
				<form
					method="dialog"
					className="mb-4 flex items-center justify-between gap-4"
				>
					<h2
						id="change-draft-title"
						className="text-2xl font-semibold tracking-tight"
					>
						Review your change draft
					</h2>
					<button
						type="submit"
						aria-label="Close"
						className="grid size-9 place-items-center rounded-lg text-2xl hover:bg-[#e9f3ff]"
					>
						×
					</button>
				</form>
				<p className={`${muted} text-sm`}>Selected booking</p>
				<p className="mt-1 font-semibold">
					{selected.name} · {money(selected.amount)}
				</p>
				<p className="mt-4 rounded-lg bg-[#f4f7fb] p-4 text-sm leading-relaxed whitespace-pre-wrap wrap-anywhere">
					{draft.message.trim()}
				</p>
				<div className="mt-4">
					<Callout>
						No request will be sent. Your draft is kept in this tab.
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
						Save change draft
					</button>
				</div>
			</dialog>
		</main>
	);
}
