import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { box, lightButton, muted, textLink } from "./BookingLayout";
import { Icon, type IconName } from "./DashboardIcon";
import { readTabValue, writeTabValue } from "./travelDaySample";

const notices = [
	{
		id: "plan",
		icon: "pin",
		title: "Your plan is ready",
		body: "Your Mauritius itinerary is ready to explore.",
		date: "8 October",
		action: "View itinerary",
	},
	{
		id: "details",
		icon: "info",
		title: "A little more information",
		body: "Review the guest and pickup details for your request.",
		date: "7 October",
		action: "View details",
	},
	{
		id: "change",
		icon: "switch",
		title: "A change needs your approval",
		body: "Review the proposed change before anything is confirmed.",
		date: "6 October",
		action: "Review change",
	},
	{
		id: "confirmed",
		icon: "check",
		title: "Your trip is confirmed",
		body: "Your sample day on the west coast is all set.",
		date: "5 October",
		action: "View trip",
	},
	{
		id: "pickup",
		icon: "car",
		title: "Your pickup reminder",
		body: "Check where and when to meet your driver.",
		date: "4 October",
		action: "View pickup",
	},
	{
		id: "update",
		icon: "clock",
		title: "A change to your day",
		body: "Your sample pickup time has changed.",
		date: "3 October",
		action: "View update",
	},
	{
		id: "payment",
		icon: "wallet",
		title: "Your payment update",
		body: "Review the payment step for your sample request.",
		date: "2 October",
		action: "View payment",
	},
	{
		id: "review",
		icon: "message",
		title: "How was your day?",
		body: "Share your thoughts about your afternoon by the sea.",
		date: "15 September",
		action: "Review trip",
	},
	{
		id: "preferences",
		icon: "people",
		title: "Your preferences were updated",
		body: "Your sample account preferences were updated.",
		date: "14 September",
		action: "Read notice",
	},
] as const satisfies ReadonlyArray<{
	id: string;
	icon: IconName;
	title: string;
	body: string;
	date: string;
	action: string;
}>;

type Notice = (typeof notices)[number];
function NoticeAction({ item, onOpen }: { item: Notice; onOpen: () => void }) {
	const className = `${textLink} inline-flex items-center gap-2 whitespace-nowrap`;
	const content = (
		<>
			{item.action}
			<Icon name="next" className="size-4" />
		</>
	);
	switch (item.id) {
		case "plan":
			return (
				<Link to="/trips/ready" className={className} onClick={onOpen}>
					{content}
				</Link>
			);
		case "details":
		case "payment":
			return (
				<Link
					to="/trips/booking/$step"
					params={{
						step: item.id === "details" ? "traveller-details" : "payment",
					}}
					search={{ sample: "checkout" }}
					className={className}
					onClick={onOpen}
				>
					{content}
				</Link>
			);
		case "change":
			return (
				<Link
					to="/trips/booking/$step"
					params={{ step: "change-approval" }}
					search={{ sample: "sunset" }}
					className={className}
					onClick={onOpen}
				>
					{content}
				</Link>
			);
		case "confirmed":
		case "update":
			return (
				<Link
					to="/trips/booking/$step"
					params={{
						step: item.id === "confirmed" ? "confirmed-trip" : "trip-update",
					}}
					className={className}
					onClick={onOpen}
				>
					{content}
				</Link>
			);
		case "pickup":
			return (
				<Link
					to="/trips/booking/$step"
					params={{ step: "today" }}
					search={{ meeting: "pickup" }}
					className={className}
					onClick={onOpen}
				>
					{content}
				</Link>
			);
		case "review":
			return (
				<Link
					to="/trips/review/$step"
					params={{ step: "invitation" }}
					className={className}
					onClick={onOpen}
				>
					{content}
				</Link>
			);
		case "preferences":
			return (
				<button
					type="button"
					aria-haspopup="dialog"
					className={className}
					onClick={onOpen}
				>
					{content}
				</button>
			);
	}
}

const tabLink =
	"inline-flex min-h-11 items-center gap-2 border-b-2 border-transparent text-sm text-[#506582] hover:text-ocean aria-[current=page]:border-ocean aria-[current=page]:font-semibold aria-[current=page]:text-ocean";

export default function Notifications({
	email,
	unreadOnly,
	emptyPreview = false,
}: {
	email: string;
	unreadOnly: boolean;
	emptyPreview?: boolean;
}) {
	const key = `journey-forge:notifications:${email}`;
	const [read, setRead] = useState(
		() =>
			readTabValue(
				key,
				(value): value is string[] =>
					Array.isArray(value) && value.every((id) => typeof id === "string"),
			) ?? ["preferences"],
	);
	const [feedback, setFeedback] = useState("");
	const dialog = useRef<HTMLDialogElement>(null);
	const inbox = emptyPreview ? [] : notices;
	const search = emptyPreview ? { preview: "empty" as const } : {};
	const unread = inbox.filter(({ id }) => !read.includes(id));
	const visible = unreadOnly ? unread : inbox;

	function update(next: string[], message: string) {
		setRead(next);
		setFeedback(
			writeTabValue(key, next)
				? message
				: `${message} Read status couldn’t be saved in this tab.`,
		);
	}

	function mark(item: Notice, nextRead: boolean) {
		if (read.includes(item.id) === nextRead) return;
		update(
			nextRead ? [...read, item.id] : read.filter((id) => id !== item.id),
			nextRead
				? "Notification marked as read."
				: "Notification marked as unread.",
		);
	}

	return (
		<main className="mx-auto max-w-[100rem] px-4 pt-6 pb-14 tablet:px-8">
			<div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#dbeaff] bg-[#f3f8ff] px-4 py-3 text-xs">
				<p className="flex items-center gap-2">
					<Icon name="info" className="size-4 text-ocean" />
					Sample preview
				</p>
				<p className={muted}>No live account changes</p>
			</div>
			<header className="mt-7">
				<h1 className="text-[clamp(2.5rem,4.2vw,3.6rem)] leading-tight font-semibold tracking-[-0.05em]">
					Your notifications.
				</h1>
				<p className={`${muted} mt-3 text-lg`}>
					The latest on your plans and days away.
				</p>
			</header>

			<section
				className={`${box} mt-8 p-3.5 tablet:p-5`}
				aria-label="Notification inbox"
			>
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dbeaff] pb-3">
					<nav
						aria-label="Filter notifications"
						className="flex items-center gap-5"
					>
						<Link
							to="/notifications"
							search={search}
							activeOptions={{ exact: true }}
							className={tabLink}
						>
							All{" "}
							<span className="rounded-full bg-[#e9f3ff] px-2 py-1 text-xs">
								{inbox.length}
							</span>
						</Link>
						<Link
							to="/notifications/unread"
							search={search}
							className={tabLink}
						>
							Unread{" "}
							<span className="rounded-full bg-[#e9f3ff] px-2 py-1 text-xs">
								{unread.length}
							</span>
						</Link>
					</nav>
					<button
						type="button"
						className={`${lightButton} disabled:cursor-not-allowed disabled:opacity-50`}
						disabled={!unread.length}
						onClick={() =>
							update(
								inbox.map(({ id }) => id),
								"All notifications marked as read.",
							)
						}
					>
						Mark all as read
					</button>
				</div>
				<p className="sr-only" role="status">
					{feedback}
				</p>
				{visible.length ? (
					<ul className="mt-3 space-y-1.5">
						{visible.map((item) => {
							const isRead = read.includes(item.id);
							return (
								<li
									key={item.id}
									className={`flex flex-wrap items-start gap-3 rounded-xl border px-4 py-5 tablet:gap-4 ${isRead ? "border-[#dbeaff] bg-white" : "border-transparent bg-[#edf5ff]"}`}
								>
									<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-ocean">
										<Icon name={item.icon} className="size-5" />
									</span>
									<div className="min-w-[11rem] flex-1">
										<p
											className={`text-xs ${isRead ? muted : "font-semibold text-ocean"}`}
										>
											{!isRead && <span aria-hidden="true">• </span>}
											{isRead ? "Read" : "Unread"}
										</p>
										<h2 className="mt-1 text-base font-semibold tracking-tight">
											{item.title}
										</h2>
										<p className={`${muted} mt-2 text-sm leading-relaxed`}>
											{item.body}
										</p>
										<p className={`${muted} mt-2 text-xs`}>
											{item.date} · Sample
										</p>
									</div>
									<div className="flex w-full flex-wrap items-center justify-between gap-3 pl-13 tablet:w-auto tablet:flex-col tablet:items-end tablet:gap-4 tablet:pl-0">
										<NoticeAction
											item={item}
											onOpen={() => {
												mark(item, true);
												if (item.id === "preferences")
													dialog.current?.showModal();
											}}
										/>
										<button
											type="button"
											className={`${muted} text-xs underline underline-offset-2 hover:text-ocean`}
											aria-label={`Mark ${item.title} as ${isRead ? "unread" : "read"}`}
											onClick={() => mark(item, isRead)}
										>
											{isRead ? "Mark unread" : "Mark read"}
										</button>
									</div>
								</li>
							);
						})}
					</ul>
				) : (
					<div className="grid justify-items-center gap-4 px-4 py-10 text-center tablet:py-14">
						<span className="grid size-16 place-items-center rounded-full bg-[#e9f3ff] text-ocean">
							<Icon name="check" className="size-8" />
						</span>
						<h2 className="text-2xl font-semibold tracking-tight">
							{inbox.length ? "You’re all caught up." : "Nothing here yet."}
						</h2>
						<p className={`${muted} text-sm`}>
							{inbox.length
								? "You have no unread notifications."
								: "Updates about your trips will appear here."}
						</p>
						<Link
							to={inbox.length ? "/notifications" : "/dashboard"}
							className={lightButton}
						>
							{inbox.length ? "View all notifications" : "Back to home"}
						</Link>
					</div>
				)}
			</section>
			<Link
				to={unreadOnly ? "/notifications/unread" : "/notifications"}
				search={emptyPreview ? {} : { preview: "empty" }}
				className={`${textLink} mt-5 inline-block`}
			>
				{emptyPreview ? "Show sample notifications" : "Preview empty inbox"}
			</Link>
			<dialog
				ref={dialog}
				aria-labelledby="notification-title"
				className="m-auto max-h-[90svh] w-[min(34rem,calc(100%-2rem))] overflow-auto rounded-2xl border border-[#dbeaff] bg-white p-6 text-[#102040] shadow-xl backdrop:bg-[#172345]/40"
			>
				<form
					method="dialog"
					className="mb-4 flex items-center justify-between gap-4"
				>
					<h2
						id="notification-title"
						className="text-xl font-semibold tracking-tight"
					>
						Your preferences were updated
					</h2>
					<button
						type="submit"
						aria-label="Close"
						className="grid size-9 shrink-0 place-items-center rounded-lg text-2xl hover:bg-[#e9f3ff]"
					>
						×
					</button>
				</form>
				<p className={`${muted} text-sm leading-relaxed`}>
					This sample notice shows how a profile update could appear. Your demo
					preferences can be reviewed in Profile.
				</p>
				<Link
					to="/profile/$tab"
					params={{ tab: "personal" }}
					className={`${lightButton} mt-5`}
				>
					Open profile
				</Link>
			</dialog>
		</main>
	);
}
