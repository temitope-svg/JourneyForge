import { Link } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";
import { Icon } from "./DashboardIcon";
import StatusLayout from "./layout/StatusLayout";

const content = {
	maintenance: {
		label: "Planned maintenance",
		title: "We’ll be back.",
		message: "Return time not yet available.",
	},
	expired: {
		label: "Shared link",
		title: "This link no longer opens.",
		message: "Ask the person who shared it for a new link.",
	},
	offline: {
		label: "Offline",
		title: "You’re offline.",
		message: "Reconnect to get the latest updates.",
	},
	denied: {
		label: "Access denied",
		title: "This trip isn’t available to this account.",
		message: "Try the account used for this booking.",
	},
} as const;

type Status = keyof typeof content;

const primary =
	"inline-flex min-h-12 min-w-36 items-center justify-between gap-6 rounded-[3px] bg-ocean px-5 py-3 text-sm font-semibold text-white hover:bg-[#0018c9] tablet:min-w-52";
const secondary =
	"inline-flex min-h-12 items-center gap-4 text-sm font-semibold text-ocean hover:underline";

function RetryButton({ label }: { label: string }) {
	return (
		<button
			type="button"
			className={primary}
			onClick={() => window.location.reload()}
		>
			{label} <Icon name="retry" className="size-5" />
		</button>
	);
}

function subscribeToConnection(update: () => void) {
	window.addEventListener("online", update);
	window.addEventListener("offline", update);
	return () => {
		window.removeEventListener("online", update);
		window.removeEventListener("offline", update);
	};
}

function OfflineDetails() {
	const online = useSyncExternalStore(
		subscribeToConnection,
		() => navigator.onLine,
	);
	return (
		<div className="space-y-7">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<p role="status" className="text-sm">
					{online
						? "Offline-screen preview. Your browser currently reports a connection."
						: "Your browser currently reports that it’s offline."}
				</p>
				<RetryButton label="Try again" />
			</div>
			<section className="bg-sun/25 p-6">
				<h2 className="text-xl font-bold">Saved trip details</h2>
				<p className="mt-2 text-sm">
					Offline trip storage is unavailable in this preview.
				</p>
				<p className="mt-3 text-sm">
					When connected, open{" "}
					<Link to="/trips" className="underline underline-offset-2">
						My trips
					</Link>{" "}
					to check your plans.
				</p>
				<Link
					to="/offline/saved-example"
					className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-ocean underline underline-offset-2"
				>
					Preview downloaded example
				</Link>
			</section>
		</div>
	);
}

function Illustration({ status }: { status: Exclude<Status, "offline"> }) {
	return (
		<svg
			viewBox="0 0 180 185"
			fill="none"
			aria-hidden="true"
			className="w-[clamp(8rem,16vw,15rem)] justify-self-end tablet:mr-6"
		>
			<g
				className="stroke-ink"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				{status === "maintenance" ? (
					<>
						<rect x="17" y="31" width="146" height="146" rx="10" />
						<path d="M17 64h146" />
						<rect
							x="40"
							y="13"
							width="10"
							height="34"
							rx="5"
							className="fill-paper"
						/>
						<rect
							x="130"
							y="13"
							width="10"
							height="34"
							rx="5"
							className="fill-paper"
						/>
						<circle cx="90" cy="119" r="31" className="fill-sun" />
						<path d="M90 98v22l15 9" />
					</>
				) : status === "expired" ? (
					<>
						<path
							d="m110 110 26-26a28 28 0 0 0-40-40L67 74m41 33a28 28 0 0 1-33 5m-4-57a28 28 0 0 0-32 5L12 87a28 28 0 0 0 40 40l27-27m-22-5 44-44"
							transform="translate(14 10)"
						/>
						<path
							d="m44 28-13-13m33 10V8m44 129v19m20-21 13 13"
							className="stroke-sun"
							strokeWidth="5"
						/>
					</>
				) : (
					<>
						<path d="M55 83V55a35 35 0 0 1 70 0v28" />
						<rect
							x="37"
							y="82"
							width="106"
							height="98"
							rx="10"
							className="fill-sun"
						/>
						<path d="M83 154v-17a11 11 0 1 1 14 0v17z" className="fill-ink" />
					</>
				)}
			</g>
		</svg>
	);
}

export default function StatusPage({ status }: { status: Status }) {
	const { label, title, message } = content[status];

	return (
		<StatusLayout>
			<div className={status === "offline" ? "col-span-full" : undefined}>
				<p className="text-sm font-semibold tracking-wider text-ocean uppercase">
					{label}
				</p>
				<h1 className="mt-8 max-w-[13ch] text-[clamp(3rem,5.45vw,5.5rem)] leading-none font-[750] tracking-[-0.06em]">
					{title}
				</h1>
				<p className="mt-8 text-[clamp(1.15rem,1.65vw,1.65rem)] text-ink/75">
					{message}
				</p>
			</div>
			{status !== "offline" && <Illustration status={status} />}
			<div className="col-span-full">
				{status === "denied" && (
					<section className="mb-5 bg-ink/5 p-6 text-sm">
						<h2 className="font-bold">Account details unavailable</h2>
						<p className="mt-2">
							This preview cannot identify the account authorised for this trip.
							Switching opens sign-in and keeps your current session active.
						</p>
					</section>
				)}
				{status === "offline" ? (
					<OfflineDetails />
				) : (
					<div className="flex flex-wrap items-center gap-5 tablet:gap-8">
						{status === "maintenance" ? (
							<>
								<RetryButton label="Check again" />
								<Link
									to="/trips"
									className="inline-flex min-h-12 items-center rounded-[3px] border border-ink/70 px-5 text-sm hover:border-ocean hover:text-ocean"
								>
									View my trips
								</Link>
							</>
						) : status === "expired" ? (
							<>
								<Link to="/" className={primary}>
									Home <Icon name="next" className="size-5" />
								</Link>
								<Link to="/sign-in" className={secondary}>
									Sign in <Icon name="next" className="size-5" />
								</Link>
							</>
						) : (
							<>
								<Link to="/sign-in" className={primary}>
									Switch account <Icon name="next" className="size-5" />
								</Link>
								<Link to="/" className={secondary}>
									Home <Icon name="next" className="size-5" />
								</Link>
							</>
						)}
					</div>
				)}
				<p className="mt-5 text-xs text-ink/75">
					Design preview. This screen does not establish a live service, booking
					or account status.
				</p>
			</div>
		</StatusLayout>
	);
}
