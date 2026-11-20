import { useState } from "react";
import {
	removeActivity,
	type ScheduledActivity,
	timeLabel,
	travelGap,
} from "./itineraryChanges";
import { activities, currency, type itineraryDays } from "./itineraryModel";

export type ItineraryDay = ReturnType<typeof itineraryDays>[number];
export type ChangeRow = { label: string; before: string; proposed: string };

const primary =
	"inline-flex min-h-12 items-center justify-center rounded-xl bg-ocean px-5 py-2 text-sm font-semibold text-white hover:bg-[#0018c9] disabled:cursor-not-allowed disabled:opacity-50";
const outline =
	"inline-flex min-h-12 items-center justify-center rounded-xl border border-[#c7d7ef] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#e9f3ff] disabled:cursor-not-allowed disabled:opacity-50";
const input =
	"mt-2 block min-h-12 w-full rounded-lg border border-[#c7d7ef] bg-white px-3 text-sm";
const choice =
	"flex min-h-14 cursor-pointer items-center gap-2.5 rounded-xl border border-[#dbeaff] px-4 py-2.5 text-sm font-medium has-checked:border-ocean has-checked:bg-[#e9f3ff] has-focus-visible:outline-2 has-focus-visible:outline-ocean";

function Actions({
	onCancel,
	submit,
	cancel = "Cancel",
	disabled = false,
}: {
	onCancel: () => void;
	submit: string;
	cancel?: string;
	disabled?: boolean;
}) {
	return (
		<div className="mt-6 flex flex-wrap gap-3">
			<button type="button" className={outline} onClick={onCancel}>
				{cancel}
			</button>
			<button type="submit" className={primary} disabled={disabled}>
				{submit}
			</button>
		</div>
	);
}

export function RemoveActivity({
	entries,
	index,
	onPreview,
	onCancel,
}: {
	entries: ScheduledActivity[];
	index: number;
	onPreview: (entries: ScheduledActivity[], bringForward: boolean) => void;
	onCancel: () => void;
}) {
	const [bringForward, setBringForward] = useState(false);
	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				onPreview(removeActivity(entries, index, bringForward), bringForward);
			}}
		>
			<p className="text-sm leading-relaxed text-[#506582]">
				Remove {activities[entries[index].activity].title} from this draft?
			</p>
			<fieldset className="mt-5" aria-label="After removal">
				<label className={choice}>
					<input
						type="radio"
						name="removal-spacing"
						checked={!bringForward}
						onChange={() => setBringForward(false)}
						className="size-4 accent-ocean"
					/>
					Keep this time free
				</label>
				<label className={choice}>
					<input
						type="radio"
						name="removal-spacing"
						checked={bringForward}
						onChange={() => setBringForward(true)}
						className="size-4 accent-ocean"
					/>
					Bring later stops forward
				</label>
			</fieldset>
			<p className="mt-5 rounded-xl bg-[#e9f3ff] p-4 text-sm leading-relaxed">
				This changes your draft only. Nothing has been booked.
			</p>
			<Actions onCancel={onCancel} submit="Preview removal" />
		</form>
	);
}

export function MoveActivity({
	entry,
	day,
	days,
	onPreview,
	onCancel,
}: {
	entry: ScheduledActivity;
	day: ItineraryDay;
	days: ItineraryDay[];
	onPreview: (target: string, start: number) => string | undefined;
	onCancel: () => void;
}) {
	const [target, setTarget] = useState(day.key);
	const [time, setTime] = useState(timeLabel(entry.startMinute));
	const [error, setError] = useState("");
	const [hours, minutes] = time.split(":").map(Number);
	const start = hours * 60 + minutes;

	function shift(offset: number) {
		setTime(
			timeLabel(
				Math.max(
					0,
					Math.min(
						1439,
						(Number.isFinite(start) ? start : entry.startMinute) + offset,
					),
				),
			),
		);
		setError("");
	}

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				setError(onPreview(target, start) ?? "");
			}}
		>
			<p className="text-sm text-[#506582]">
				{activities[entry.activity].title}
			</p>
			<div className="mt-6 grid gap-4 tablet:grid-cols-2">
				<label className="text-sm font-semibold">
					Day
					<select
						value={target}
						onChange={(event) => {
							setTarget(event.target.value);
							setError("");
						}}
						className={input}
					>
						{days.map((item, index) => (
							<option key={item.key} value={item.key} disabled={item.free}>
								Day {index + 1} · {item.label}
								{item.free ? " (free day)" : ""}
							</option>
						))}
					</select>
				</label>
				<label className="text-sm font-semibold">
					Start time
					<input
						type="time"
						value={time}
						required
						onChange={(event) => {
							setTime(event.target.value);
							setError("");
						}}
						className={input}
					/>
				</label>
			</div>
			<div className="mt-5 flex flex-wrap gap-3">
				<button
					type="button"
					className={outline}
					disabled={start === 0}
					onClick={() => shift(-travelGap)}
				>
					← Earlier
				</button>
				<button
					type="button"
					className={outline}
					disabled={start === 1439}
					onClick={() => shift(travelGap)}
				>
					Later →
				</button>
			</div>
			<p className="mt-5 rounded-xl bg-[#fff3d9] p-4 text-sm leading-relaxed text-[#634507]">
				At least {travelGap} minutes between sample stops. Actual travel and
				opening hours still need checking.
			</p>
			{error && (
				<p role="alert" className="mt-3 text-sm text-red-800">
					{error}
				</p>
			)}
			<Actions onCancel={onCancel} submit="Preview move" />
		</form>
	);
}

export function RevisePlan({
	initialRequest,
	onPreview,
	onCancel,
}: {
	initialRequest: string;
	onPreview: (request: string, keepMustDo: boolean, lowerCost: boolean) => void;
	onCancel: () => void;
}) {
	const [request, setRequest] = useState(initialRequest);
	const [keepMustDo, setKeepMustDo] = useState(true);
	const [lowerCost, setLowerCost] = useState(false);
	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				onPreview(request.trim(), keepMustDo, lowerCost);
			}}
		>
			<p className="text-sm text-[#506582]">
				Tell us how you’d like to reshape your trip.
			</p>
			<label className="mt-6 block text-sm font-semibold">
				Revision request
				<textarea
					className={`${input} min-h-32 py-3 font-normal`}
					value={request}
					onChange={(event) => setRequest(event.target.value)}
					maxLength={1200}
					placeholder="Less driving, a cheaper lunch, and more time by the sea."
				/>
			</label>
			<label className={choice}>
				<input
					type="checkbox"
					checked={keepMustDo}
					onChange={(event) => setKeepMustDo(event.target.checked)}
					className="size-4 accent-ocean"
				/>
				Keep my must-do activities
			</label>
			<label className={choice}>
				<input
					type="checkbox"
					checked={lowerCost}
					onChange={(event) => setLowerCost(event.target.checked)}
					className="size-4 accent-ocean"
				/>
				Preview lower-cost sample alternatives
			</label>
			<p className="mt-5 rounded-xl bg-[#e9f3ff] p-4 text-sm leading-relaxed">
				The preview records your request. The optional sample rule replaces paid
				activities with cheaper catalogue options.
			</p>
			<Actions
				onCancel={onCancel}
				cancel="Back"
				submit="Preview changes"
				disabled={!request.trim() && !lowerCost}
			/>
		</form>
	);
}

export function ReviewChange({
	rows,
	before,
	proposed,
	onCancel,
	onApply,
}: {
	rows: ChangeRow[];
	before: number;
	proposed: number;
	onCancel: () => void;
	onApply: () => void;
}) {
	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				onApply();
			}}
		>
			<p className="text-sm leading-relaxed text-[#506582]">
				Compare this proposal before it replaces your draft.
			</p>
			<table className="mt-6 w-full table-fixed border-collapse text-left text-sm leading-relaxed wrap-anywhere">
				<thead>
					<tr className="border-b border-[#dbeaff]">
						<th scope="col" className="w-1/4 p-2">
							Change
						</th>
						<th scope="col" className="p-2">
							Before
						</th>
						<th scope="col" className="p-2">
							Proposed
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map(({ label, before, proposed }) => (
						<tr key={label} className="border-b border-[#dbeaff]">
							<th scope="row" className="p-2 font-semibold">
								{label}
							</th>
							<td className="p-2">{before}</td>
							<td className="p-2">{proposed}</td>
						</tr>
					))}
					<tr className="border-b border-[#dbeaff]">
						<th scope="row" className="p-2 font-semibold">
							Trip estimate
						</th>
						<td className="p-2">MUR {currency.format(before)}</td>
						<td className="p-2">MUR {currency.format(proposed)}</td>
					</tr>
				</tbody>
			</table>
			<p className="mt-5 rounded-xl bg-[#e9f3ff] p-4 text-sm leading-relaxed">
				Sample travel spacing is recalculated. Opening hours, real travel times
				and availability still need confirmation.
			</p>
			<Actions onCancel={onCancel} submit="Apply to draft" />
		</form>
	);
}
