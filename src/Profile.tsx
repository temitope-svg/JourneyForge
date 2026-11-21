import { Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useRef, useState } from "react";
import {
	blueButton,
	box,
	field,
	Heading,
	lightButton,
	muted,
	section,
	textLink,
} from "./BookingLayout";
import { Icon, type IconName } from "./DashboardIcon";
import { signOutOfDemo } from "./demoAuth";
import {
	currencies,
	type DemoProfile,
	interests,
	languages,
	type ProfileTab,
	readDemoProfile,
	saveDemoProfile,
	travelStyles,
} from "./profileModel";

const tabs: { id: ProfileTab; label: string; icon: IconName }[] = [
	{ id: "personal", label: "Personal details", icon: "people" },
	{ id: "travel", label: "Travel preferences", icon: "heart" },
	{ id: "notifications", label: "Notifications", icon: "message" },
	{ id: "language", label: "Language & currency", icon: "pin" },
	{ id: "privacy", label: "Privacy & account", icon: "lock" },
];
const previews = {
	Privacy:
		"The demo stores profile changes and trip drafts in this browser. Browser data is separate for each demo sign-in. Use sample information here.",
	Terms:
		"Journey Forge is a design preview. Sample plans do not create agreements, bookings, or payment authorisations.",
	Cancellations:
		"Cancellation terms and refund estimates would be provided for a live booking before confirming a cancellation. This demo does not cancel bookings.",
	"Delete your account":
		"In a live account, deleting it would remove access to your profile and account history. This preview does not delete your demo account or browser data.",
} as const;

export default function Profile({
	email,
	tab,
}: {
	email: string;
	tab: ProfileTab;
}) {
	const navigate = useNavigate();
	const [saved, setSaved] = useState(() => readDemoProfile(email));
	const [draft, setDraft] = useState(saved);
	const [notice, setNotice] = useState("");
	const [problem, setProblem] = useState(false);
	const [preview, setPreview] = useState<keyof typeof previews>("Privacy");
	const dialog = useRef<HTMLDialogElement>(null);
	const title = tabs.find((item) => item.id === tab)?.label;

	function change<K extends keyof DemoProfile>(key: K, value: DemoProfile[K]) {
		setDraft((current) => ({ ...current, [key]: value }));
		setNotice("");
	}

	function save(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const next = {
			...draft,
			name: draft.name.trim(),
			email: draft.email.trim(),
			phone: draft.phone.trim(),
		};
		if (!next.name) {
			setProblem(true);
			setNotice("Enter a name before saving.");
			return;
		}
		const stored = saveDemoProfile(email, next);
		setProblem(!stored);
		if (stored) {
			setSaved(next);
			setDraft(next);
		}
		setNotice(
			stored
				? "Changes saved in this browser."
				: "Your changes couldn’t be saved. Check that browser storage is available.",
		);
	}

	function show(next: keyof typeof previews) {
		setPreview(next);
		dialog.current?.showModal();
	}

	return (
		<main className="mx-auto max-w-[100rem] px-4 pt-6 pb-14 tablet:px-8">
			<div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#dbeaff] bg-[#f3f8ff] px-4 py-3 text-xs">
				<p className="flex items-center gap-2">
					<span
						aria-hidden="true"
						className="grid size-4 place-items-center rounded-full border border-ocean text-ocean"
					>
						i
					</span>
					Sample preview
				</p>
				<p className={muted}>No live account changes</p>
			</div>
			<header className="mt-7">
				<h1 className="text-[clamp(2.5rem,4.2vw,3.6rem)] leading-tight font-semibold tracking-[-0.05em]">
					Make it yours.
				</h1>
				<p className={`${muted} mt-2 text-lg`}>
					Keep your details up to date for a smoother journey.
				</p>
			</header>
			<div className="mt-8 grid items-start gap-6 tablet:grid-cols-[minmax(11rem,15.5rem)_minmax(0,54rem)]">
				<nav
					aria-label="Profile settings"
					className="flex flex-wrap gap-1 rounded-xl border border-[#dbeaff] bg-[#f3f8ff] p-2 tablet:grid"
				>
					{tabs.map(({ id, label, icon }) => (
						<Link
							key={id}
							to="/profile/$tab"
							params={{ tab: id }}
							className="flex min-h-10 items-center gap-2 rounded-lg border-l-2 border-transparent px-2.5 py-2.5 text-sm hover:bg-[#e9f3ff] aria-[current=page]:border-ocean aria-[current=page]:bg-[#e9f3ff] aria-[current=page]:font-semibold aria-[current=page]:text-ocean"
						>
							<Icon name={icon} className="size-5 shrink-0 text-ocean" />
							{label}
						</Link>
					))}
				</nav>

				<section
					className={`${box} min-w-0 p-5 tablet:p-[clamp(1.75rem,3vw,2.75rem)]`}
					aria-label={title}
				>
					<Heading>{title}</Heading>
					{tab === "privacy" ? (
						<div className="mt-6 space-y-5">
							<div className="grid gap-3 tablet:grid-cols-2">
								{(["Privacy", "Terms", "Cancellations"] as const).map(
									(item) => (
										<button
											key={item}
											type="button"
											onClick={() => show(item)}
											className={lightButton}
										>
											{item}
										</button>
									),
								)}
								<Link
									to="/"
									hash="help"
									className={`${lightButton} text-ocean`}
								>
									Help &amp; support
								</Link>
							</div>
							<div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dbeaff] pb-5 text-sm">
								<p className="flex items-center gap-2">
									<Icon name="wallet" className="size-5" />
									Payment methods
								</p>
								<span
									className={`${muted} rounded-full bg-[#e9f3ff] px-3 py-1.5 text-xs`}
								>
									Not available yet
								</span>
							</div>
							<div className="rounded-xl border border-[#f2c4cb] p-5">
								<p className="font-semibold">Delete your account</p>
								<p className={`${muted} mt-2 text-sm`}>
									Review what this would mean before you decide.
								</p>
								<button
									type="button"
									onClick={() => show("Delete your account")}
									className="mt-4 min-h-11 rounded-lg border border-[#d98491] px-4 text-sm font-semibold text-[#8d1730] hover:bg-[#fff1f2]"
								>
									Delete your account
								</button>
							</div>
							<button
								type="button"
								className={textLink}
								onClick={() => {
									signOutOfDemo();
									void navigate({ to: "/sign-in", replace: true });
								}}
							>
								Sign out
							</button>
						</div>
					) : (
						<form className="mt-7" onSubmit={save}>
							{tab === "personal" && (
								<div className="grid gap-5">
									<label className="text-sm font-semibold">
										Full name
										<input
											className={`${field} mt-2 font-normal`}
											value={draft.name}
											onChange={(event) => change("name", event.target.value)}
											required
											maxLength={120}
											autoComplete="name"
										/>
									</label>
									<label className="text-sm font-semibold">
										Email address
										<input
											type="email"
											className={`${field} mt-2 font-normal`}
											value={draft.email}
											onChange={(event) => change("email", event.target.value)}
											required
											maxLength={254}
											autoComplete="email"
											aria-describedby="profile-email-note"
										/>
										<span
											id="profile-email-note"
											className={`${muted} mt-2 block text-xs font-normal`}
										>
											This is your profile email. Your demo sign-in email is{" "}
											{email}.
										</span>
									</label>
									<label className="text-sm font-semibold">
										Phone number{" "}
										<span className={`${muted} font-normal`}>(optional)</span>
										<input
											type="tel"
											className={`${field} mt-2 font-normal`}
											value={draft.phone}
											onChange={(event) => change("phone", event.target.value)}
											maxLength={40}
											autoComplete="tel"
										/>
									</label>
								</div>
							)}
							{tab === "travel" && (
								<div className="grid gap-5">
									<fieldset>
										<legend className="text-sm font-semibold">
											Your interests
										</legend>
										<div className="mt-3 flex flex-wrap gap-2.5">
											{interests.map((interest) => (
												<button
													type="button"
													key={interest}
													aria-pressed={draft.interests.includes(interest)}
													className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#c7d7ef] px-3.5 text-sm hover:border-ocean aria-pressed:border-[#c3bb13] aria-pressed:bg-sun"
													onClick={() =>
														change(
															"interests",
															draft.interests.includes(interest)
																? draft.interests.filter(
																		(item) => item !== interest,
																	)
																: [...draft.interests, interest],
														)
													}
												>
													{draft.interests.includes(interest) && (
														<Icon name="check" className="size-4" />
													)}
													{interest}
												</button>
											))}
										</div>
									</fieldset>
									<label className="text-sm font-semibold">
										Your travel style
										<select
											value={draft.travelStyle}
											onChange={(event) => {
												const option = travelStyles.find(
													(item) => item === event.target.value,
												);
												change("travelStyle", option ?? "");
											}}
											className={`${field} mt-2 font-normal`}
										>
											<option value="">Choose a travel style</option>
											{travelStyles.map((style) => (
												<option key={style}>{style}</option>
											))}
										</select>
									</label>
									<label className="text-sm font-semibold">
										Dietary needs{" "}
										<span className={`${muted} font-normal`}>(optional)</span>
										<textarea
											value={draft.diet}
											onChange={(event) => change("diet", event.target.value)}
											maxLength={1200}
											className={`${field} mt-2 min-h-28 py-3 font-normal`}
										/>
									</label>
									<label className="text-sm font-semibold">
										Accessibility or mobility needs{" "}
										<span className={`${muted} font-normal`}>(optional)</span>
										<textarea
											value={draft.accessibility}
											onChange={(event) =>
												change("accessibility", event.target.value)
											}
											maxLength={1200}
											className={`${field} mt-2 min-h-28 py-3 font-normal`}
										/>
										<span className={`${muted} mt-2 block text-xs font-normal`}>
											Share only what you’re comfortable sharing.
										</span>
									</label>
								</div>
							)}
							{tab === "notifications" && (
								<div className="divide-y divide-[#dbeaff]">
									<label className="flex items-center justify-between gap-5 pb-5 text-sm">
										<span>
											<span className="flex items-center gap-2 font-semibold">
												<Icon name="lock" className="size-5 text-ocean" />
												Active-trip service alerts
											</span>
											<span className={`${muted} mt-2 block leading-relaxed`}>
												Booking details, pickup reminders and changes to your
												day.
											</span>
											<span className={`${muted} mt-1 block text-xs`}>
												Always on while you have an active trip.
											</span>
										</span>
										<input
											type="checkbox"
											checked
											disabled
											className="size-5 shrink-0 accent-ocean"
										/>
									</label>
									<label className="flex cursor-pointer items-center justify-between gap-5 py-5 text-sm">
										<span>
											<span className="font-semibold">
												Marketing &amp; inspiration
											</span>
											<span className={`${muted} mt-2 block`}>
												Travel ideas and offers. Your choice.
											</span>
										</span>
										<input
											type="checkbox"
											checked={draft.marketing}
											onChange={(event) =>
												change("marketing", event.target.checked)
											}
											className="size-5 shrink-0 accent-ocean"
										/>
									</label>
									<div className="pt-5">
										<Link
											to="/notifications"
											className={`${textLink} inline-flex items-center gap-3`}
										>
											Open your notifications{" "}
											<Icon name="next" className="size-4" />
										</Link>
									</div>
								</div>
							)}
							{tab === "language" && (
								<div className="grid gap-5">
									<label className="text-sm font-semibold">
										Preferred language
										<select
											value={draft.language}
											onChange={(event) => {
												const option = languages.find(
													(item) => item === event.target.value,
												);
												if (option) change("language", option);
											}}
											className={`${field} mt-2 font-normal`}
										>
											{languages.map((language) => (
												<option key={language}>{language}</option>
											))}
										</select>
									</label>
									<label className="text-sm font-semibold">
										Preferred currency
										<select
											value={draft.currency}
											onChange={(event) => {
												const option = currencies.find(
													(item) => item === event.target.value,
												);
												if (option) change("currency", option);
											}}
											className={`${field} mt-2 font-normal`}
										>
											{currencies.map((currency) => (
												<option key={currency}>{currency}</option>
											))}
										</select>
									</label>
									<p className={`${muted} text-sm`}>
										These sample preferences do not translate the site or
										convert prices yet.
									</p>
								</div>
							)}

							<div
								className={`${section} mt-8 flex flex-wrap justify-end gap-3`}
							>
								<button
									type="button"
									onClick={() => {
										setDraft(saved);
										setProblem(false);
										setNotice("Unsaved changes discarded.");
									}}
									className={lightButton}
								>
									Discard changes
								</button>
								<button type="submit" className={blueButton}>
									Save changes
								</button>
							</div>
							{notice && (
								<p
									className={`mt-3 text-right text-sm ${problem ? "text-red-800" : "text-ocean"}`}
									role={problem ? "alert" : "status"}
								>
									{notice}
								</p>
							)}
						</form>
					)}
				</section>
			</div>
			<dialog
				ref={dialog}
				aria-labelledby="profile-preview-title"
				className="m-auto max-h-[90svh] w-[min(34rem,calc(100%-2rem))] overflow-auto rounded-2xl border border-[#dbeaff] bg-white p-6 text-[#102040] shadow-xl backdrop:bg-[#172345]/40 backdrop:backdrop-blur-xs"
			>
				<form
					method="dialog"
					className="mb-4 flex items-center justify-between gap-4"
				>
					<h2
						id="profile-preview-title"
						className="text-2xl font-semibold tracking-tight"
					>
						{preview}
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
					{previews[preview]}
				</p>
			</dialog>
		</main>
	);
}
