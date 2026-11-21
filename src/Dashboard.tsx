import { Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, lazy, Suspense, useRef, useState } from "react";
import { z } from "zod";
import data from "../backend/dashboard.json";
import { type BookingStep, readBookingPreview } from "./bookingPreview";
import { Icon, type IconName } from "./DashboardIcon";
import { getDemoSession } from "./demoAuth";
import type { Experience } from "./ExperienceCard";
import ExperienceDetail from "./ExperienceDetail";
import { itineraryDays, itineraryEditsSchema } from "./itineraryModel";
import { type ProfileTab, readDemoProfile } from "./profileModel";
import type { SavedTab } from "./Saved";
import type { SampleRequest } from "./sampleTrips";
import type { TripSetupStep } from "./tripDraft";
import { defaultTripDetails, tripDetailsSchema } from "./tripDraft";
import type { ReviewStep } from "./tripReviewModel";

const Notifications = lazy(() => import("./Notifications"));
const Profile = lazy(() => import("./Profile"));
const TripReview = lazy(() => import("./TripReview"));
const MyTrips = lazy(() => import("./MyTrips"));
const BookingFlow = lazy(() => import("./BookingFlow"));
const Saved = lazy(() => import("./Saved"));
const SingleDayItinerary = lazy(() => import("./SingleDayItinerary"));
const Explore = lazy(() => import("./Explore"));
const TripSetup = lazy(() => import("./TripSetup"));
const PlanProgress = lazy(() => import("./PlanProgress"));
const TripItinerary = lazy(() => import("./TripItinerary"));
const TripPlanner = lazy(() => import("./TripPlanner"));

type Panel = "trip" | "pickup" | "region";
const panelTitles: Record<Panel, string> = {
	trip: "Your upcoming trip",
	pickup: "Pickup details",
	region: "Destination",
};

const card = "rounded-2xl border border-[#dbeaff] bg-white";
const pale = "bg-[#e9f3ff]";
const muted = "text-[#506582]";
const primary =
	"inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-ocean px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0018c9]";
const secondary =
	"inline-flex min-h-10 items-center justify-center gap-3 rounded-xl bg-[#e9f3ff] px-4 py-2 text-sm font-semibold text-ocean hover:bg-[#dbeaff]";
const storedDashboard = z.object({
	saved: z.array(z.string()),
	draft: z.string(),
	planner: tripDetailsSchema.optional(),
	itinerary: itineraryEditsSchema.optional(),
	revisionRequest: z.string().optional(),
});
const tripPrompt = z.string().trim().min(1).max(1200);

function readDashboard(key: string): z.infer<typeof storedDashboard> {
	try {
		const value = storedDashboard.safeParse(
			JSON.parse(localStorage.getItem(key) ?? "null"),
		);
		if (value.success) return value.data;
	} catch {
		// The sample dashboard is usable with browser storage disabled.
	}
	return { saved: ["sunset"], draft: "" };
}

export default function Dashboard({
	exploring = false,
	detail,
	savedTab,
	planning = false,
	setupStep,
	planStage,
	selectedDay,
	bookingStep,
	bookingSample,
	bookingMeeting,
	tripsView,
	reviewStep,
	profileTab,
	notificationView,
}: {
	exploring?: boolean;
	detail?: Experience;
	savedTab?: SavedTab;
	planning?: boolean;
	setupStep?: TripSetupStep;
	planStage?: "generating" | "ready" | "itinerary" | "single-day";
	selectedDay?: string;
	bookingStep?: BookingStep;
	bookingSample?: SampleRequest;
	bookingMeeting?: "pickup";
	tripsView?: "default" | "sample";
	reviewStep?: ReviewStep;
	profileTab?: ProfileTab;
	notificationView?: "all" | "unread";
}) {
	const navigate = useNavigate();
	const email = getDemoSession() ?? "";
	const displayName = readDemoProfile(email).name.split(/\s+/)[0] || "Traveler";
	const storageKey = `journey-forge:dashboard:${email}`;
	const [dashboard, setDashboard] = useState(() => readDashboard(storageKey));
	const [idea, setIdea] = useState(dashboard.draft);
	const [filter, setFilter] = useState("");
	const [notice, setNotice] = useState("");
	const [panel, setPanel] = useState<Panel>("trip");
	const dialog = useRef<HTMLDialogElement>(null);
	const prompt = useRef<HTMLTextAreaElement>(null);
	const trip = data.trip;
	const filtered = data.experiences.filter(
		(entry) => !filter || entry.categories.includes(filter),
	);
	const saved = data.experiences.filter((entry) =>
		dashboard.saved.includes(entry.id),
	);

	function update(next: z.infer<typeof storedDashboard>) {
		setDashboard(next);
		try {
			localStorage.setItem(storageKey, JSON.stringify(next));
			return true;
		} catch {
			return false;
		}
	}

	function toggleSaved(id: string) {
		const next = dashboard.saved.includes(id)
			? dashboard.saved.filter((item) => item !== id)
			: [...dashboard.saved, id];
		update({ ...dashboard, saved: next });
	}

	function openPanel(next: Panel) {
		setPanel(next);
		if (!dialog.current?.open) dialog.current?.showModal();
	}

	function planExperience(entry: Experience, openPlanner: boolean) {
		const addition = entry.planIdea;
		const lines = dashboard.draft.split("\n");
		const nextDraft = lines.includes(addition)
			? dashboard.draft
			: [dashboard.draft, addition].filter(Boolean).join("\n");
		const result = tripPrompt.safeParse(nextDraft);
		if (!result.success)
			return "Your trip draft is full. Shorten it on the dashboard and try again.";

		const stored = update({ ...dashboard, draft: result.data });
		if (openPlanner && stored) {
			void navigate({ to: "/trips/plan" });
		}
		return stored
			? "Experience saved to your trip draft."
			: "The draft could not be saved to browser storage.";
	}

	function saveDraft(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const result = tripPrompt.safeParse(idea);
		if (!result.success) {
			setNotice("Tell us what you have in mind to start a draft.");
			prompt.current?.focus();
			return;
		}
		if (update({ ...dashboard, draft: result.data })) {
			void navigate({ to: "/trips/plan" });
		} else {
			setNotice(
				"Browser storage is unavailable. Copy this idea before continuing to Trips.",
			);
		}
	}

	function prefill(value: string) {
		setIdea(value);
		setNotice("");
		prompt.current?.focus();
	}

	return (
		<div className="min-h-svh bg-linear-to-b from-white to-[#f5faff] text-[#102040]">
			<header className="mx-auto flex max-w-[100rem] flex-wrap items-center justify-between gap-3 px-4 py-3 tablet:px-8">
				<Link to="/dashboard" aria-label="Dashboard home">
					<img
						src="/home/brand-dark.png"
						width="136"
						height="69"
						className="h-auto w-[7.5rem]"
						alt=""
					/>
				</Link>
				<nav
					aria-label="Dashboard"
					className="order-last flex w-full justify-center gap-[clamp(1rem,2.9vw,2.5rem)] text-sm font-semibold tablet:order-0 tablet:w-auto"
				>
					<Link
						to="/dashboard"
						className="border-b-2 border-transparent p-2 aria-[current=page]:border-ocean aria-[current=page]:text-ocean"
						activeOptions={{ exact: true }}
					>
						Home
					</Link>
					<Link
						to="/trips"
						className="border-b-2 border-transparent p-2 hover:text-ocean data-[status=active]:border-ocean data-[status=active]:text-ocean"
					>
						Trips
					</Link>
					<Link
						to="/saved"
						className="border-b-2 border-transparent p-2 hover:text-ocean data-[status=active]:border-ocean data-[status=active]:text-ocean"
					>
						Saved
					</Link>
					<Link
						to="/profile/$tab"
						params={{ tab: "personal" }}
						className={`border-b-2 p-2 hover:text-ocean ${profileTab ? "border-ocean text-ocean" : "border-transparent"}`}
					>
						Profile
					</Link>
				</nav>
				<div className="flex items-center gap-3 text-sm tablet:gap-6">
					<button
						type="button"
						onClick={() => openPanel("region")}
						className="rounded-xl border border-[#dbeaff] px-3 py-2.5"
					>
						Mauritius{" "}
						<span
							aria-hidden="true"
							className="ml-1 inline-block size-1.5 -translate-y-0.5 rotate-45 border-r border-b"
						/>
					</button>
					<Link
						to="/notifications"
						aria-label="Notifications"
						className="grid size-9 place-items-center rounded-full text-ocean hover:bg-[#e9f3ff] data-[status=active]:bg-[#e9f3ff]"
					>
						<Icon name="message" className="size-5" />
					</Link>
					<Link to="/help" className="hover:text-ocean">
						Help
					</Link>
					<Link
						to="/profile/$tab"
						params={{ tab: "personal" }}
						aria-label="Open demo profile"
						className="grid size-11 place-items-center rounded-full border border-[#dbeaff] bg-[#e9f3ff] text-ocean"
					>
						{displayName[0]}
					</Link>
				</div>
			</header>

			{notificationView ? (
				<Suspense
					fallback={
						<main className="mx-auto max-w-[100rem] p-8" aria-busy="true">
							Loading notifications…
						</main>
					}
				>
					<Notifications
						email={email}
						unreadOnly={notificationView === "unread"}
					/>
				</Suspense>
			) : profileTab ? (
				<Suspense
					fallback={
						<main className="mx-auto max-w-[100rem] p-8" aria-busy="true">
							Loading profile…
						</main>
					}
				>
					<Profile key={profileTab} tab={profileTab} email={email} />
				</Suspense>
			) : reviewStep ? (
				<Suspense
					fallback={
						<main className="mx-auto max-w-[100rem] p-8" aria-busy="true">
							Loading trip review…
						</main>
					}
				>
					<TripReview email={email} step={reviewStep} />
				</Suspense>
			) : tripsView ? (
				<Suspense
					fallback={
						<main className="mx-auto max-w-[100rem] p-8" aria-busy="true">
							Loading your trips…
						</main>
					}
				>
					<MyTrips
						view={tripsView}
						email={email}
						draft={dashboard.draft}
						hasDraft={Boolean(dashboard.draft || dashboard.planner)}
						request={readBookingPreview(email)}
					/>
				</Suspense>
			) : bookingStep ? (
				<Suspense
					fallback={
						<main className="mx-auto max-w-[100rem] p-8" aria-busy="true">
							Loading booking preview…
						</main>
					}
				>
					<BookingFlow
						key={`${bookingStep}:${bookingSample ?? "current"}:${bookingMeeting ?? ""}`}
						step={bookingStep}
						email={email}
						sample={bookingSample}
						meeting={bookingMeeting}
					/>
				</Suspense>
			) : planStage ? (
				<Suspense
					fallback={
						<main className="mx-auto max-w-[100rem] p-8" aria-busy="true">
							Loading itinerary preview…
						</main>
					}
				>
					{planStage === "single-day" ? (
						<SingleDayItinerary
							key={selectedDay}
							selectedDay={selectedDay}
							idea={dashboard.draft}
							details={dashboard.planner ?? defaultTripDetails}
							initialEdits={dashboard.itinerary ?? {}}
							onSave={(itinerary) =>
								update({
									...dashboard,
									planner: dashboard.planner ?? defaultTripDetails,
									itinerary,
								})
							}
						/>
					) : planStage === "itinerary" ? (
						<TripItinerary
							key={selectedDay}
							selectedDay={selectedDay}
							idea={dashboard.draft}
							details={dashboard.planner ?? defaultTripDetails}
							initialEdits={dashboard.itinerary ?? {}}
							initialRevision={dashboard.revisionRequest}
							onSave={(itinerary, revisionRequest) =>
								update({
									...dashboard,
									planner: dashboard.planner ?? defaultTripDetails,
									itinerary,
									revisionRequest,
								})
							}
						/>
					) : (
						<PlanProgress
							key={planStage}
							ready={planStage === "ready"}
							idea={dashboard.draft}
							details={dashboard.planner ?? defaultTripDetails}
						/>
					)}
				</Suspense>
			) : setupStep ? (
				<Suspense
					fallback={
						<main className="mx-auto max-w-[100rem] p-8" aria-busy="true">
							Loading trip setup…
						</main>
					}
				>
					<TripSetup
						step={setupStep}
						details={dashboard.planner ?? defaultTripDetails}
						onSave={(setup) =>
							update({
								...dashboard,
								planner: {
									...(dashboard.planner ?? defaultTripDetails),
									date: setup.arrival,
									flexible: setup.flexible,
									setup,
								},
							})
						}
					/>
				</Suspense>
			) : planning ? (
				<Suspense
					fallback={
						<main className="mx-auto max-w-[100rem] p-8" aria-busy="true">
							Loading trip planner…
						</main>
					}
				>
					<TripPlanner
						initialIdea={dashboard.draft}
						initialDetails={dashboard.planner}
						onSave={(draft, planner) =>
							update({ ...dashboard, draft, planner })
						}
					/>
				</Suspense>
			) : detail ? (
				<ExperienceDetail
					key={detail.id}
					experience={detail}
					saved={dashboard.saved.includes(detail.id)}
					onSave={() => toggleSaved(detail.id)}
					onPlan={(openPlanner) => planExperience(detail, openPlanner)}
				/>
			) : savedTab ? (
				<Suspense
					fallback={
						<main className="mx-auto max-w-[100rem] p-8" aria-busy="true">
							Loading saved collection…
						</main>
					}
				>
					<Saved
						tab={savedTab}
						singleDay={
							itineraryDays(dashboard.planner ?? defaultTripDetails).length ===
							1
						}
						experiences={saved}
						draft={
							dashboard.draft ||
							(dashboard.planner ? "Mauritius trip draft" : "")
						}
						onToggleSaved={toggleSaved}
					/>
				</Suspense>
			) : exploring ? (
				<Suspense
					fallback={
						<main className="mx-auto max-w-[100rem] p-8" aria-busy="true">
							Loading experiences…
						</main>
					}
				>
					<Explore saved={dashboard.saved} onToggleSaved={toggleSaved} />
				</Suspense>
			) : (
				<main className="mx-auto max-w-[100rem] px-4 pb-8 tablet:px-8">
					<div className="grid gap-4 desktop:grid-cols-[2.2fr_1fr]">
						<section
							className={`${card} flex min-w-0 flex-col overflow-hidden`}
							aria-labelledby="dashboard-title"
						>
							<div className="relative isolate flex min-h-[19rem] flex-1 flex-col justify-center overflow-hidden bg-[#f5e92c] px-5 py-7 text-[#111c13] tablet:min-h-[20.75rem] tablet:px-8">
								<img
									src="/dashboard/west-coast.webp"
									alt=""
									className="absolute inset-y-0 right-0 -z-10 h-full w-[72%] object-cover object-right opacity-80 [mask-image:linear-gradient(to_right,transparent,black_31%)] tablet:opacity-100"
								/>
								<p className="text-[clamp(1.2rem,2.25vw,2rem)] tracking-tight wrap-anywhere">
									Good morning, {displayName}.
								</p>
								<h1
									id="dashboard-title"
									className="mt-4 max-w-[14ch] text-[clamp(2.55rem,3.9vw,3.8rem)] leading-none font-medium tracking-[-0.055em]"
								>
									{trip.title}
								</h1>
								<p className="mt-5 text-lg tablet:text-[1.4rem]">
									Tomorrow · {trip.guestCount} guests
								</p>
								<span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#fffde8] px-3 py-2 text-sm font-semibold text-[#00665b]">
									<Icon name="check" className="size-[1.05rem]" />
									{trip.status}
								</span>
							</div>
							<div className="grid items-center gap-4 px-5 py-5 tablet:grid-cols-[1fr_0.85fr_1.65fr_auto] tablet:px-8">
								{(
									[
										{ label: "Date", value: trip.date, icon: "calendar" },
										{ label: "Pickup", value: trip.pickup, icon: "clock" },
										{
											label: "Meeting point",
											value: trip.meeting,
											icon: "pin",
										},
									] as const
								).map(({ label, value, icon }) => (
									<div
										key={label}
										className="flex items-center gap-3 tablet:border-r tablet:border-[#dbeaff] tablet:pr-3"
									>
										<Icon name={icon} className="size-7 shrink-0 text-ocean" />
										<div>
											<p className={`${muted} text-sm`}>{label}</p>
											<p className="mt-1 font-semibold">{value}</p>
										</div>
									</div>
								))}
								<button
									type="button"
									className={primary}
									onClick={() => openPanel("trip")}
								>
									View trip <Icon name="next" className="size-4" />
								</button>
							</div>
						</section>
						<section
							className={`${card} min-w-0 p-5 tablet:p-7`}
							aria-labelledby="dashboard-plan"
						>
							<h2
								id="dashboard-plan"
								className="text-[clamp(1.55rem,2.1vw,2rem)] leading-tight font-semibold tracking-tight"
							>
								What are you dreaming of?
							</h2>
							<form onSubmit={saveDraft} className="mt-4">
								<label htmlFor="dashboard-idea" className="sr-only">
									Trip idea
								</label>
								<textarea
									id="dashboard-idea"
									ref={prompt}
									value={idea}
									onChange={(event) => {
										setIdea(event.target.value);
										setNotice("");
									}}
									placeholder="Tell us what you have in mind..."
									maxLength={1200}
									className="block min-h-36 w-full rounded-xl border border-[#dbeaff] bg-[#e9f3ff] p-4 leading-relaxed placeholder:text-[#506582]"
								/>
								<button className={`${primary} mt-3 w-full`} type="submit">
									Plan a trip <Icon name="next" className="size-4" />
								</button>
							</form>
							{notice && (
								<p className="mt-3 text-sm" role="status">
									{notice}
								</p>
							)}
							<div className="mt-4 grid grid-cols-2 gap-3.5">
								{(
									[
										{
											label: "Slow & sunny",
											icon: "sun",
											idea: "A slow, sunny day with lunch and a walk along the lagoon.",
										},
										{
											label: "Adventure",
											icon: "mountain",
											idea: "An outdoor adventure with a scenic trail and time to explore.",
										},
									] as const
								).map((mood) => (
									<button
										type="button"
										key={mood.label}
										onClick={() => prefill(mood.idea)}
										className={`${card} min-w-0 px-3.5 py-3 text-left text-sm hover:border-ocean/50`}
									>
										<span className="mb-2 grid size-10 place-items-center rounded-full bg-[#eff6ff] text-ocean">
											<Icon name={mood.icon} />
										</span>
										<span className="flex items-center justify-between gap-2">
											{mood.label}
											<span
												aria-hidden="true"
												className="size-1.5 rotate-[-45deg] border-r border-b text-ocean"
											/>
										</span>
									</button>
								))}
							</div>
						</section>
					</div>

					<div className="mt-4 grid gap-4 tablet:grid-cols-2">
						<section
							className={`${card} flex items-center gap-4 bg-[#e9f3ff]! p-5 tablet:gap-7 tablet:px-7`}
						>
							<span className="grid size-[clamp(3rem,5.4vw,5rem)] shrink-0 place-items-center rounded-full bg-[#d9eaff] text-ocean">
								<Icon name="car" className="size-8" />
							</span>
							<div>
								<h2 className="text-lg font-semibold tracking-tight">
									Your pickup is confirmed
								</h2>
								<p className={`${muted} mt-1 text-sm`}>
									Meet your driver at the hotel entrance.
								</p>
								<button
									type="button"
									className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-ocean hover:underline"
									onClick={() => openPanel("pickup")}
								>
									View details <Icon name="next" className="size-4" />
								</button>
							</div>
						</section>
						<section
							className={`${card} flex flex-wrap items-center gap-4 p-5 tablet:gap-7 tablet:px-7`}
						>
							<span
								className={`${pale} grid size-[clamp(3rem,5.4vw,5rem)] shrink-0 place-items-center rounded-full text-ocean`}
							>
								<Icon name="bookmark" className="size-8" />
							</span>
							<div className="min-w-0 flex-1">
								<p className="text-sm">Kept for later</p>
								<h2 className="mt-1 text-lg font-semibold tracking-tight">
									{saved[0]?.savedTitle ?? "Nothing saved yet"}
								</h2>
								<p className={`${muted} mt-1 text-sm`}>
									{saved.length
										? "Saved experience"
										: "Save an experience to find it here."}
								</p>
							</div>
							<Link to="/saved" className={secondary}>
								View saved <Icon name="next" className="size-4" />
							</Link>
						</section>
					</div>

					<section className="mt-7" aria-labelledby="discover-title">
						<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
							<h2
								id="discover-title"
								className="text-[clamp(1.65rem,2.3vw,2.1rem)] font-medium tracking-tight"
							>
								Discover Mauritius
							</h2>
							<fieldset
								className="flex flex-wrap gap-2.5"
								aria-label="Experience filters"
							>
								{data.categories.map(({ label, icon }) => (
									<button
										type="button"
										key={label}
										aria-pressed={filter === label}
										onClick={() => setFilter(filter === label ? "" : label)}
										className="flex min-h-10 items-center gap-2 rounded-full border border-[#dbeaff] px-3.5 text-sm hover:border-ocean/40 aria-pressed:bg-ocean aria-pressed:text-white"
									>
										<Icon
											name={icon as IconName}
											className={`size-5 ${filter === label ? "" : "text-ocean"}`}
										/>
										{label}
									</button>
								))}
							</fieldset>
							<Link
								to="/explore"
								className={`${secondary} ml-auto rounded-full`}
							>
								Explore all <Icon name="next" className="size-4" />
							</Link>
						</div>
						<div className="mt-5 grid gap-4 tablet:grid-cols-3">
							{filtered.map((entry) => (
								<article
									key={entry.id}
									className={`${card} overflow-hidden p-1`}
								>
									<div className="relative">
										<img
											src={`/dashboard/${entry.image}.webp`}
											alt=""
											className="aspect-[1.88] w-full rounded-[0.65rem] object-cover"
										/>
										<button
											type="button"
											aria-label={`Save ${entry.title}`}
											aria-pressed={dashboard.saved.includes(entry.id)}
											onClick={() => toggleSaved(entry.id)}
											className="absolute top-3 right-3 grid size-11 place-items-center rounded-xl border border-[#dbeaff] bg-white hover:bg-[#e9f3ff] aria-pressed:bg-ocean aria-pressed:text-white"
										>
											<Icon name="bookmark" />
										</button>
									</div>
									<Link
										to="/experiences/$experienceId"
										params={{ experienceId: entry.id }}
										className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:text-ocean"
									>
										<span>
											<span className="block text-lg font-semibold tracking-tight">
												{entry.title}
											</span>
											<span
												className={`${muted} mt-2 flex items-center gap-1.5 text-sm`}
											>
												<Icon name="pin" className="size-4 text-ocean" />
												{entry.place} · {entry.duration}
											</span>
										</span>
										<span
											className={`${pale} grid size-11 shrink-0 place-items-center rounded-full text-ocean`}
										>
											<Icon name="next" className="size-5" />
										</span>
									</Link>
								</article>
							))}
						</div>
					</section>
				</main>
			)}
			<dialog
				ref={dialog}
				aria-labelledby="dashboard-dialog-title"
				className="m-auto max-h-[calc(100%-2rem)] w-[min(31rem,calc(100%-2rem))] rounded-2xl border border-[#dbeaff] bg-white p-7 text-[#102040] backdrop:bg-ink/65 motion-safe:open:animate-response-arrival"
			>
				<form method="dialog">
					<button
						type="submit"
						aria-label="Close"
						className="absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-[#e9f3ff] text-2xl"
					>
						×
					</button>
				</form>
				<h2
					id="dashboard-dialog-title"
					className="mb-5 pr-10 text-2xl font-bold tracking-tight"
				>
					{panelTitles[panel]}
				</h2>
				{panel === "trip" && (
					<div className="space-y-3">
						<p className="font-semibold">{trip.title}</p>
						<p>
							{trip.date} at {trip.pickup} · {trip.guestCount} guests
						</p>
						<p>{trip.meeting}</p>
						<p className={`${muted} text-sm`}>
							Sample itinerary for the dashboard preview.
						</p>
						<div className="flex flex-wrap gap-2">
							{readBookingPreview(email)?.authorised && (
								<Link
									to="/trips/booking/$step"
									params={{ step: "confirmation-progress" }}
									className={secondary}
								>
									View demo request status
								</Link>
							)}
							<Link
								to="/trips/booking/$step"
								params={{ step: "confirmed-trip" }}
								className={secondary}
							>
								View confirmed trip preview
							</Link>
						</div>
					</div>
				)}
				{panel === "pickup" && (
					<div className="space-y-3">
						<p>Meet your driver at the hotel entrance at {trip.pickup}.</p>
						<p>{trip.meeting}</p>
						<p className={`${muted} text-sm`}>
							Sample pickup for the dashboard preview.
						</p>
					</div>
				)}
				{panel === "region" && (
					<p>Mauritius is the destination available in this preview.</p>
				)}
			</dialog>
		</div>
	);
}
