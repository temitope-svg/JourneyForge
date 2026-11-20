import {
	activities,
	activityNames,
	type DayActivity,
} from "./itineraryModel.ts";

export const travelGap = 15;
const sampleTimes = [540, 600, 750, 960];

export type ScheduledActivity = DayActivity & { startMinute: number };

export function scheduleDay(entries: DayActivity[]): ScheduledActivity[] {
	let earliest = 0;
	return entries.map((entry, index) => {
		const startMinute = Math.max(
			earliest,
			entry.startMinute ?? sampleTimes[index] ?? earliest,
		);
		earliest = startMinute + activities[entry.activity].duration + travelGap;
		return { ...entry, startMinute };
	});
}

export function timeLabel(minutes: number) {
	return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function removeActivity(
	entries: ScheduledActivity[],
	index: number,
	bringForward: boolean,
) {
	const offset =
		bringForward && entries[index + 1]
			? entries[index + 1].startMinute - entries[index].startMinute
			: 0;
	return entries.flatMap((entry, i) =>
		i === index
			? []
			: [
					{
						...entry,
						startMinute:
							i > index ? entry.startMinute - offset : entry.startMinute,
					},
				],
	);
}

export function canSchedule(
	entries: ScheduledActivity[],
	entry: ScheduledActivity,
) {
	const end = entry.startMinute + activities[entry.activity].duration;
	return (
		entry.startMinute >= 0 &&
		end <= 1440 &&
		entries.every(
			(other) =>
				end + travelGap <= other.startMinute ||
				other.startMinute + activities[other.activity].duration + travelGap <=
					entry.startMinute,
		)
	);
}

export function lowerCostActivities(
	entries: ScheduledActivity[],
	keepMustDo: boolean,
) {
	const used = new Set(entries.map((entry) => entry.activity));
	return entries.map((entry) => {
		if (activities[entry.activity].price === 0 || (entry.mustDo && keepMustDo))
			return entry;
		const cheaper = activityNames
			.filter(
				(name) =>
					!used.has(name) &&
					activities[name].price < activities[entry.activity].price,
			)
			.sort(
				(first, second) => activities[second].price - activities[first].price,
			)[0];
		if (!cheaper) return entry;
		used.add(cheaper);
		return { ...entry, activity: cheaper };
	});
}
