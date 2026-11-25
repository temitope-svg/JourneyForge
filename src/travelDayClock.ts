import { useSyncExternalStore } from "react";

const minuteMs = 60_000;
const mauritiusTime = new Intl.DateTimeFormat("en-GB", {
	timeZone: "Indian/Mauritius",
	hourCycle: "h23",
	hour: "2-digit",
	minute: "2-digit",
});

export function mauritiusMinute(now: Date) {
	const [hour, minute] = mauritiusTime.format(now).split(":").map(Number);
	return hour * 60 + minute;
}

function subscribeToClock(update: () => void) {
	let timer: number;

	function refresh() {
		window.clearTimeout(timer);
		timer = window.setTimeout(refresh, minuteMs - (Date.now() % minuteMs));
		update();
	}

	refresh();
	document.addEventListener("visibilitychange", refresh);
	window.addEventListener("focus", refresh);

	return () => {
		window.clearTimeout(timer);
		document.removeEventListener("visibilitychange", refresh);
		window.removeEventListener("focus", refresh);
	};
}

function subscribeToDemoClock() {
	return () => {};
}

// The caller enables live time for an itinerary on its local travel date.
export function useTravelDayClock(demoMinute: number, live: boolean) {
	return useSyncExternalStore(
		live ? subscribeToClock : subscribeToDemoClock,
		() => (live ? mauritiusMinute(new Date()) : demoMinute),
	);
}
