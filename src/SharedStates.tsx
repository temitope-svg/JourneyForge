import { Link } from "@tanstack/react-router";
import { blueButton, box, lightButton, muted, textLink } from "./BookingLayout";
import { Icon } from "./DashboardIcon";

const views = {
	loading: "Loading",
	slow: "Taking longer",
	empty: "Empty",
	error: "Error and retry",
	offline: "Offline",
	signIn: "Sign-in required",
	expired: "Session expired",
} as const;

export type SharedView = keyof typeof views;

type SharedAction =
	| "finish-loading"
	| "check-status"
	| "retry"
	| "reconnect"
	| "preview-download";

const viewsDetails = {
	slow: {
		icon: "clock",
		title: "Taking a little longer.",
		message:
			"In a connected service, your request would continue processing without a second submission.",
	},
	empty: {
		icon: "bookmark",
		title: "Nothing saved. Yet.",
		message: "Keep an experience here for another day.",
	},
	error: {
		icon: "close",
		title: "We couldn’t load this.",
		message: "Try again. Your saved items haven’t changed.",
	},
	offline: {
		title: "No trip saved on this device.",
		message:
			"Reconnect to download your confirmed itinerary when the service is connected.",
	},
	signIn: {
		icon: "bookmark",
		title: "Keep this idea with you.",
		message:
			"Sign in to save across devices when accounts are connected. Local bookmarks are unchanged.",
	},
	expired: {
		icon: "account",
		title: "Sign in again to continue.",
		message:
			"Your session ended. Sign in to check whether your latest changes were saved.",
	},
} as const;

const heading =
	"text-[clamp(2rem,3vw,3rem)] leading-tight font-semibold tracking-[-0.045em]";

function SharedHeader() {
	const navLinks = [
		{ to: "/dashboard", label: "Home" },
		{ to: "/trips", label: "Trips" },
		{ to: "/saved", label: "Saved" },
		{ to: "/profile", label: "Profile" },
	] as const;

	return (
		<header className="mx-auto flex max-w-[100rem] flex-wrap items-center justify-between gap-3 px-4 py-3 tablet:px-8">
			<Link to="/dashboard" aria-label="Dashboard home">
				<img
					src="/home/brand-dark.png"
					alt=""
					width={136}
					height={69}
					className="h-auto w-[7.5rem]"
				/>
			</Link>
			<nav
				aria-label="Dashboard"
				className="order-last flex w-full justify-center gap-5 text-sm font-semibold tablet:order-0 tablet:w-auto"
			>
				{navLinks.map(({ to, label }) => (
					<Link key={to} to={to} className="p-2 hover:text-ocean">
						{label}
					</Link>
				))}
			</nav>
			<div className="flex items-center gap-3 text-sm tablet:gap-6">
				<span className="hidden items-center gap-2 rounded-xl border border-[#dbeaff] px-3 py-2.5 tablet:inline-flex">
					Mauritius <Icon name="pin" className="size-4" />
				</span>
				<Link to="/help" className={textLink}>
					Help
				</Link>
				<Link
					to="/profile"
					aria-label="Profile"
					className="grid size-10 place-items-center rounded-full bg-[#e9f3ff] text-ocean"
				>
					<Icon name="account" />
				</Link>
			</div>
		</header>
	);
}

function LoadingState({ onFinish }: { onFinish: () => void }) {
	return (
		<>
			<h1 className={heading}>Explore Mauritius</h1>
			<p role="status" className={`${muted} mt-3`}>
				Loading experiences…
			</p>
			<div aria-hidden="true" className="mt-7 grid gap-5 tablet:grid-cols-3">
				{["first", "second", "third"].map((card) => (
					<div key={card} className={`${box} space-y-3 p-4`}>
						<div className="aspect-video rounded-md bg-[#e5edf5]" />
						<div className="h-3 rounded-full bg-[#e5edf5]" />
						<div className="h-3 w-3/5 rounded-full bg-[#e5edf5]" />
					</div>
				))}
			</div>
			<p className={`${muted} mt-6 text-xs`}>
				Static loading preview. No request is pending.
			</p>
			<button type="button" className={`${blueButton} mt-2`} onClick={onFinish}>
				Finish loading preview
			</button>
		</>
	);
}

function StateActions({
	view,
	onAction,
}: {
	view: Exclude<SharedView, "loading">;
	onAction: (action: SharedAction) => void;
}) {
	switch (view) {
		case "slow":
			return (
				<>
					<button
						type="button"
						className={blueButton}
						onClick={() => onAction("check-status")}
					>
						Check status
					</button>
					<Link to="/trips" className={lightButton}>
						Back to Trips
					</Link>
				</>
			);
		case "empty":
			return (
				<Link to="/explore" className={blueButton}>
					Explore experiences
				</Link>
			);
		case "error":
			return (
				<>
					<button
						type="button"
						className={blueButton}
						onClick={() => onAction("retry")}
					>
						Try again
					</button>
					<Link to="/dashboard" className={lightButton}>
						Back to dashboard
					</Link>
				</>
			);
		case "offline":
			return (
				<>
					<button
						type="button"
						className={blueButton}
						onClick={() => onAction("reconnect")}
					>
						Try reconnecting
					</button>
					<button
						type="button"
						className={lightButton}
						onClick={() => onAction("preview-download")}
					>
						Preview downloaded example
					</button>
				</>
			);
		case "signIn":
			return (
				<>
					<Link to="/sign-in" className={blueButton}>
						Sign in
					</Link>
					<Link to="/create-account" className={lightButton}>
						Create an account
					</Link>
					<Link to="/explore" className={lightButton}>
						Keep browsing
					</Link>
				</>
			);
		case "expired":
			return (
				<>
					<Link to="/sign-in" className={blueButton}>
						Sign in again
					</Link>
					<Link to="/" className={lightButton}>
						Back to home
					</Link>
				</>
			);
	}
}

const notes = {
	offline:
		"This website does not yet cache confirmed trips. The sample download is a standalone file you can open offline.",
	signIn: "Account sync is not connected in this prototype.",
	expired: "Preview state only. No active session was expired.",
} as const;

export default function SharedStates({
	view,
	onAction,
	onViewChange,
	onReturn,
}: {
	view: SharedView;
	onAction: (action: SharedAction) => void;
	onViewChange: (view: SharedView) => void;
	onReturn: () => void;
}) {
	const details = view === "loading" ? undefined : viewsDetails[view];

	return (
		<div className="min-h-svh bg-linear-to-b from-white to-[#f5faff] text-[#102040]">
			<SharedHeader />
			<main className="mx-auto max-w-[100rem] px-4 pt-8 pb-16 tablet:px-14">
				<div
					className={`${box} mb-6 flex flex-wrap items-center gap-3 px-4 py-3 text-xs`}
				>
					<p className={muted}>Shared state preview — no live service event</p>
					<label className="flex items-center gap-2">
						View
						<select
							value={view}
							onChange={(event) => {
								const next = Object.keys(views).find(
									(key): key is SharedView => key === event.target.value,
								);
								if (next) onViewChange(next);
							}}
							className="min-h-10 rounded-lg border border-[#dbeaff] bg-white px-3"
						>
							{Object.entries(views).map(([key, label]) => (
								<option key={key} value={key}>
									{label}
								</option>
							))}
						</select>
					</label>
					<button
						type="button"
						className="text-ocean underline"
						onClick={onReturn}
					>
						Return to page
					</button>
				</div>

				{view === "loading" ? (
					<LoadingState onFinish={() => onAction("finish-loading")} />
				) : (
					details && (
						<section
							className={`${box} mx-auto mt-12 max-w-[46rem] px-5 py-12 text-center tablet:px-12`}
						>
							{"icon" in details ? (
								<Icon
									name={details.icon}
									className="mx-auto mb-7 size-12 text-ocean"
								/>
							) : (
								<p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-lg bg-sun/30 px-3 py-2 text-xs">
									<Icon name="moon" className="size-4" /> Offline state preview
								</p>
							)}
							<h1 className={heading}>{details.title}</h1>
							<p
								className={`${muted} mx-auto mt-4 max-w-[52ch] text-sm leading-relaxed`}
							>
								{details.message}
							</p>
							<div className="mt-6 flex flex-wrap justify-center gap-3">
								<StateActions view={view} onAction={onAction} />
							</div>
							{(view === "offline" ||
								view === "signIn" ||
								view === "expired") && (
								<p
									className={`${muted} mx-auto mt-4 max-w-[60ch] text-xs leading-relaxed`}
								>
									{notes[view]}
								</p>
							)}
						</section>
					)
				)}
			</main>
		</div>
	);
}
