import { Link } from "@tanstack/react-router";
import { type ReactNode, useRef, useState } from "react";
import {
	type BookingPreview,
	bookingChange,
	readBookingPreview,
} from "./bookingPreview";
import { Icon } from "./DashboardIcon";
import { type SampleRequest, sampleBookingAccount } from "./sampleTrips";

const statuses = [
	"Needs your approval",
	"Confirmed",
	"Draft",
	"Awaiting confirmation",
	"Completed",
] as const;
type Status = (typeof statuses)[number];
const groups = [
	"Needs your attention",
	"Upcoming",
	"Drafts and requests",
	"Past",
] as const;
type Group = (typeof groups)[number];

type TripRow = {
	id: string;
	title: string;
	details: string;
	note?: string;
	image: string;
	group: Group;
	status: Status;
	action: ReactNode;
};

const commonButton =
	"inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-4 py-2 text-sm font-semibold tablet:min-w-44 tablet:w-auto";
const lightButton = `${commonButton} border border-[#c7d7ef] bg-white text-ocean hover:bg-[#e9f3ff]`;
const primaryButton = `${commonButton} bg-ocean text-white hover:bg-[#0018c9]`;
const altText = "text-[#506582]";
const badgeStyles: Record<Status, string> = {
	"Needs your approval": "bg-[#fff3d2] text-[#694c0f]",
	Confirmed: "bg-[#e5f7ed] text-[#175743]",
	Draft: "bg-[#e9f3ff] text-ocean",
	"Awaiting confirmation": "bg-[#e9f3ff] text-ocean",
	Completed: "bg-[#e9f3ff] text-ocean",
};

function TripStatusLink({
	sample,
	approval = false,
}: {
	sample?: SampleRequest;
	approval?: boolean;
}) {
	return (
		<Link
			to="/trips/booking/$step"
			params={{ step: approval ? "change-approval" : "confirmation-progress" }}
			search={{ sample }}
			className={approval ? primaryButton : lightButton}
		>
			{approval ? "Review change" : "View status"}
			<Icon name="next" className="size-4" />
		</Link>
	);
}

export default function MyTrips({
	view,
	email,
	draft,
	hasDraft,
	request,
}: {
	view: "default" | "sample";
	email: string;
	draft: string;
	hasDraft: boolean;
	request?: BookingPreview;
}) {
	const [tab, setTab] = useState<"saved" | "sample">(
		view === "sample" || (!hasDraft && !request?.authorised)
			? "sample"
			: "saved",
	);
	const [query, setQuery] = useState("");
	const [status, setStatus] = useState("");
	const dialog = useRef<HTMLDialogElement>(null);

	const sampleDecision =
		readBookingPreview(sampleBookingAccount(email, "sunset"))?.decision ??
		"pending";
	const sampleApproval = sampleDecision === "pending";
	const sampleTrips: TripRow[] = [
		{
			id: "sunset",
			title: "A sunset for two",
			details: "25 October 2026 · 2 adults · West coast",
			note: sampleApproval
				? "A later sailing adds MUR 400."
				: sampleDecision === "approved"
					? "Later sailing approved in the demo."
					: "Change declined in the demo.",
			image: "/dashboard/sunset.webp",
			group: sampleApproval ? "Needs your attention" : "Drafts and requests",
			status: sampleApproval ? "Needs your approval" : "Awaiting confirmation",
			action: <TripStatusLink sample="sunset" approval={sampleApproval} />,
		},
		{
			id: "confirmed",
			title: "A slow day on the west coast",
			details: "23 October 2026 · 2 adults · Mauritius",
			note: "Pickup at 08:30 · Flic en Flac",
			image: "/dashboard/west-coast.webp",
			group: "Upcoming",
			status: "Confirmed",
			action: (
				<Link
					to="/trips/booking/$step"
					params={{ step: "confirmed-trip" }}
					className={lightButton}
				>
					View trip <Icon name="next" className="size-4" />
				</Link>
			),
		},
		{
			id: "draft",
			title: "A little closer to nature",
			details: "Flexible dates · 2 adults · Mauritius",
			image: "/dashboard/waterfall.webp",
			group: "Drafts and requests",
			status: "Draft",
			action: (
				<button
					type="button"
					className={lightButton}
					onClick={() => dialog.current?.showModal()}
				>
					View draft <Icon name="next" className="size-4" />
				</button>
			),
		},
		{
			id: "market",
			title: "A taste of the island",
			details: "28 October 2026 · 2 adults · Mauritius",
			image: "/dashboard/market.webp",
			group: "Drafts and requests",
			status: "Awaiting confirmation",
			action: <TripStatusLink sample="market" />,
		},
		{
			id: "past",
			title: "An afternoon by the sea",
			details: "14 September 2026 · 2 adults · Mauritius",
			image: "/home/family.webp",
			group: "Past",
			status: "Completed",
			action: (
				<Link
					to="/trips/review/$step"
					params={{ step: "invitation" }}
					className={lightButton}
				>
					View trip <Icon name="next" className="size-4" />
				</Link>
			),
		},
	];
	const savedTrips: TripRow[] = [];
	if (hasDraft)
		savedTrips.push({
			id: "your-draft",
			title: "Your trip draft",
			details: "Mauritius · Saved in this browser",
			note: draft,
			image: "/dashboard/west-coast.webp",
			group: "Drafts and requests",
			status: "Draft",
			action: (
				<Link to="/trips/plan" className={lightButton}>
					View draft <Icon name="next" className="size-4" />
				</Link>
			),
		});
	if (request?.authorised) {
		const approval =
			request.decision === "pending" && Boolean(bookingChange(request.plan));
		savedTrips.unshift({
			id: "your-request",
			title: request.plan.title,
			details: `${request.plan.date} · ${request.plan.travellers} · Mauritius`,
			note: approval
				? "The sample sunset sailing has a new time and price."
				: "Demo request",
			image: "/dashboard/west-coast.webp",
			group: approval ? "Needs your attention" : "Drafts and requests",
			status: approval ? "Needs your approval" : "Awaiting confirmation",
			action: <TripStatusLink approval={approval} />,
		});
	}

	const terms = query.trim().toLowerCase();
	const filtered = (tab === "sample" ? sampleTrips : savedTrips).filter(
		(trip) =>
			(!status || status === trip.status) &&
			[trip.title, trip.details, trip.note, trip.status]
				.join(" ")
				.toLowerCase()
				.includes(terms),
	);

	function chooseTab(next: typeof tab) {
		setTab(next);
		setQuery("");
		setStatus("");
	}

	return (
		<main className="mx-auto max-w-[100rem] px-4 pt-5 pb-14 tablet:px-8">
			<header className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-[clamp(2.5rem,4.15vw,3.8rem)] leading-[1.05] font-semibold tracking-[-0.05em]">
						Your next stories.
					</h1>
					<p className={`${altText} mt-3 text-lg tablet:text-[1.3rem]`}>
						Plans in the making. Days to look forward to.
					</p>
					<p className={`${altText} mt-4 text-xs leading-relaxed`}>
						Design preview · No booking or payment made. Sample trips are
						separate from your saved work.
					</p>
				</div>
				<Link
					to="/trips/plan"
					className="inline-flex min-h-12 items-center gap-3 rounded-xl bg-ocean px-5 py-2 text-sm font-semibold text-white hover:bg-[#0018c9]"
				>
					Plan a trip <Icon name="next" className="size-4" />
				</Link>
			</header>

			<fieldset
				aria-label="Trip collection"
				className="mt-8 flex gap-6 border-b border-[#dbeaff]"
			>
				{(["saved", "sample"] as const).map((item) => (
					<button
						key={item}
						type="button"
						aria-pressed={tab === item}
						onClick={() => chooseTab(item)}
						className={`border-b-2 border-transparent py-3 text-sm underline underline-offset-2 aria-pressed:border-ocean aria-pressed:text-ocean ${altText}`}
					>
						{item === "saved" ? "Your saved work" : "Sample trips"}
					</button>
				))}
			</fieldset>
			<div className="mt-6 grid gap-4 tablet:grid-cols-[2.5fr_1fr_0.8fr]">
				<div className="relative">
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.6"
						className={`pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 ${altText}`}
					>
						<circle cx="10.5" cy="10.5" r="6.5" />
						<path d="m16 16 4 4" />
					</svg>
					<input
						type="search"
						aria-label="Search your trips"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search your trips"
						className="h-13 w-full rounded-lg border border-[#a9bad3] bg-white pr-3 pl-12 text-sm placeholder:text-[#506582]"
					/>
				</div>
				<select
					aria-label="Trip status"
					value={status}
					onChange={(event) => setStatus(event.target.value)}
					className="h-13 w-full min-w-0 rounded-lg border border-[#a9bad3] bg-white px-3 text-sm"
				>
					<option value="">All statuses</option>
					{statuses.map((item) => (
						<option key={item}>{item}</option>
					))}
				</select>
				<p
					className={`${altText} flex min-h-13 items-center gap-3 rounded-lg border border-[#dbeaff] bg-white px-4 text-sm`}
				>
					<Icon name="pin" className="size-5" />
					Mauritius
				</p>
			</div>

			{filtered.length ? (
				groups.map((group) => {
					const rows = filtered.filter((trip) => trip.group === group);
					if (!rows.length) return null;
					return (
						<section key={group} className="mt-6" aria-label={group}>
							<h2 className="mb-3 text-[1.4rem] font-semibold tracking-tight">
								{group}{" "}
								<span className={`${altText} ml-1 text-sm font-normal`}>
									{rows.length}
								</span>
							</h2>
							<ul
								className={`divide-y divide-[#dbeaff] rounded-2xl border px-4 ${group === "Needs your attention" ? "border-[#efda9c] bg-[#fdf9eb]" : "border-[#dbeaff] bg-white"}`}
							>
								{rows.map((trip) => (
									<li
										key={trip.id}
										className="grid items-center gap-3 py-4 tablet:grid-cols-[minmax(7rem,13rem)_minmax(0,1fr)] desktop:grid-cols-[minmax(9rem,13rem)_minmax(0,1fr)_minmax(11rem,max-content)_auto] desktop:gap-5"
									>
										<img
											src={trip.image}
											alt=""
											className="aspect-[2.05] h-auto w-full rounded-lg object-cover"
										/>
										<div className="min-w-0">
											<h3 className="text-lg font-semibold tracking-tight">
												{trip.title}
											</h3>
											<p className={`${altText} mt-2 text-sm leading-relaxed`}>
												{trip.details}
											</p>
											{trip.note && (
												<p
													className={`${altText} mt-1 line-clamp-2 text-sm leading-relaxed wrap-anywhere`}
												>
													{trip.note}
												</p>
											)}
										</div>
										<p
											className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${badgeStyles[trip.status]}`}
										>
											<Icon
												name={
													trip.status === "Confirmed" ||
													trip.status === "Completed"
														? "check"
														: "clock"
												}
												className="size-4"
											/>
											{trip.status}
										</p>
										<div>{trip.action}</div>
									</li>
								))}
							</ul>
						</section>
					);
				})
			) : (
				<div className="mt-6 rounded-2xl border border-[#dbeaff] bg-white p-7 text-center">
					<h2 className="text-xl font-semibold">
						{query || status
							? "No trips match your filters."
							: "Your plans will appear here."}
					</h2>
					{query || status ? (
						<button
							type="button"
							className="mt-4 text-sm font-semibold text-ocean hover:underline"
							onClick={() => {
								setQuery("");
								setStatus("");
							}}
						>
							Clear filters
						</button>
					) : (
						<Link
							to="/trips/plan"
							className="mt-4 inline-block text-sm font-semibold text-ocean hover:underline"
						>
							Plan a trip
						</Link>
					)}
				</div>
			)}
			<p className={`${altText} mt-4 text-xs`}>
				{tab === "sample"
					? "All trips shown are examples."
					: "Your draft and demo request are saved in this browser."}
			</p>

			<dialog
				ref={dialog}
				aria-labelledby="sample-trip-title"
				className="m-auto max-h-[90svh] w-[min(32rem,calc(100%-2rem))] overflow-auto rounded-2xl bg-white p-6 text-[#102040] shadow-xl backdrop:bg-[#172345]/50"
			>
				<form
					method="dialog"
					className="flex items-center justify-between gap-3"
				>
					<h2
						id="sample-trip-title"
						className="text-2xl font-semibold tracking-tight"
					>
						A little closer to nature
					</h2>
					<button
						type="submit"
						aria-label="Close"
						className="grid size-9 place-items-center rounded-lg text-2xl hover:bg-[#e9f3ff]"
					>
						×
					</button>
				</form>
				<img
					src="/dashboard/waterfall.webp"
					alt=""
					className="mt-4 aspect-[2] w-full rounded-xl object-cover"
				/>
				<p className={`${altText} mt-4 text-sm leading-relaxed`}>
					Sample draft · Flexible dates · 2 adults. A walk to the Chamarel
					lookout, followed by lunch nearby.
				</p>

				<Link to="/trips/plan" className={`${primaryButton} mt-5`}>
					Plan a trip <Icon name="next" className="size-4" />
				</Link>
			</dialog>
		</main>
	);
}
