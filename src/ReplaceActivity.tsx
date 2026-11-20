import { useState } from "react";
import {
	activities,
	activityNames,
	currency,
	type DayActivity,
} from "./itineraryModel";

type ActivityId = DayActivity["activity"];
const filterButton =
	"min-h-12 rounded-xl border border-[#c7d7ef] bg-white px-4 text-sm font-semibold hover:bg-[#e9f3ff] aria-pressed:border-ocean aria-pressed:text-ocean";

export default function ReplaceActivity({
	current,
	onApply,
	onCancel,
}: {
	current: ActivityId;
	onApply: (activity: ActivityId) => void;
	onCancel: () => void;
}) {
	const currentActivity = activities[current];
	const [lowerCost, setLowerCost] = useState(false);
	const [choice, setChoice] = useState<ActivityId>();
	const alternatives = activityNames.filter(
		(name) =>
			name !== current &&
			(!lowerCost || activities[name].price < currentActivity.price),
	);
	const selected =
		choice && alternatives.includes(choice) ? choice : alternatives[0];

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				if (selected) onApply(selected);
			}}
		>
			<p className="text-sm leading-relaxed text-[#506582]">
				Replace {currentActivity.title}. Prices below are per person.
			</p>

			<fieldset
				aria-label="Filter alternatives"
				className="mt-6 flex flex-wrap gap-3"
			>
				<button
					type="button"
					aria-pressed={!lowerCost}
					className={filterButton}
					onClick={() => setLowerCost(false)}
				>
					All alternatives
				</button>
				<button
					type="button"
					aria-pressed={lowerCost}
					className={filterButton}
					onClick={() => setLowerCost(true)}
				>
					Lower cost
				</button>
			</fieldset>

			<fieldset
				className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-3.5"
				aria-label="Replacement activity"
			>
				{alternatives.map((name) => {
					const activity = activities[name];
					return (
						<label
							key={name}
							className="flex cursor-pointer flex-col rounded-xl border border-[#dbeaff] p-4 text-sm hover:border-ocean/40 has-checked:border-ocean has-checked:bg-[#e9f3ff] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ocean"
						>
							<input
								type="radio"
								name="replacement"
								checked={name === selected}
								onChange={() => setChoice(name)}
								className="mb-3 size-[1.1rem] accent-ocean"
							/>
							<img
								src={activity.image}
								alt=""
								className="aspect-[2] w-full rounded-lg object-cover"
							/>
							<span className="mt-4 font-semibold">{activity.title}</span>
							<span className="mt-2 text-xs text-[#506582]">
								MUR {currency.format(activity.price)} · {activity.duration} min
							</span>
						</label>
					);
				})}
			</fieldset>
			{!alternatives.length && (
				<p role="status" className="mt-4 rounded-xl bg-[#e9f3ff] p-4 text-sm">
					There are no lower-cost alternatives for this activity.
				</p>
			)}

			<div className="mt-6 flex flex-wrap gap-3">
				<button
					type="button"
					onClick={onCancel}
					className="min-h-12 rounded-xl border border-[#c7d7ef] bg-white px-4 text-sm font-semibold hover:bg-[#e9f3ff]"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={!selected}
					className="min-h-12 rounded-xl bg-ocean px-5 text-sm font-semibold text-white hover:bg-[#0018c9] disabled:cursor-not-allowed disabled:opacity-50"
				>
					Replace activity
				</button>
			</div>
		</form>
	);
}
