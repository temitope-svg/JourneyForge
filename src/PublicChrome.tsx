import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Arrow } from "./Arrow";
import { getDemoSession, signOutOfDemo } from "./demoAuth";

const navigationItem =
	"flex min-h-10 items-center border-r border-white/17 px-[0.55rem] text-[0.78rem] font-[650] tablet:min-h-[3.375rem] tablet:px-[clamp(0.65rem,1.4vw,1.35rem)] tablet:text-[0.81rem]";

const asset = (name: string) => `/home/${name}`;

export function PublicHeader({ helpActive = false }: { helpActive?: boolean }) {
	const [demoSession, setDemoSession] = useState(getDemoSession);

	function signOut() {
		signOutOfDemo();
		setDemoSession(null);
	}

	return (
		<header
			className="absolute top-4 left-1/2 z-1 flex w-page -translate-x-1/2 items-center justify-between gap-[0.65rem] text-white tablet:top-[1.7rem] tablet:items-start tablet:gap-4"
			id="top"
		>
			<Link to="/" hash="top" aria-label="Journey Forge home">
				<img
					className="h-auto w-[clamp(4.8rem,18vw,6rem)] tablet:w-[clamp(6.3rem,10.6vw,9.45rem)]"
					src={asset("brand-light.png")}
					width="151"
					height="73"
					alt=""
				/>
			</Link>
			<nav
				className="flex flex-wrap justify-end bg-ink [&>:not(:last-child):hover]:bg-[#29443a]"
				aria-label="Main navigation"
			>
				<Link className={navigationItem} to="/" hash="destinations">
					Explore
				</Link>
				<Link
					className={`${navigationItem} aria-[current=page]:underline aria-[current=page]:decoration-sun aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8`}
					to="/how-it-works"
				>
					How it works
				</Link>
				<Link className={navigationItem} to="/" hash="saved">
					Saved &amp; Recents
				</Link>
				<Link
					className={`${navigationItem} ${helpActive ? "underline decoration-sun decoration-2 underline-offset-8" : ""}`}
					to="/help"
				>
					Help
				</Link>
				{demoSession ? (
					<>
						<Link className={navigationItem} to="/dashboard">
							Dashboard
						</Link>
						<button type="button" className={navigationItem} onClick={signOut}>
							Sign out
						</button>
					</>
				) : (
					<Link className={navigationItem} to="/sign-in">
						Sign in
					</Link>
				)}
				<Link
					className={`${navigationItem} group justify-between gap-[0.45rem] bg-sun text-ink hover:bg-[#faf450] desktop:min-w-[10.75rem] tablet:gap-[1.1rem]`}
					to="/"
					hash="plan"
				>
					Plan a trip <Arrow className="text-xs tablet:text-base" />
				</Link>
			</nav>
		</header>
	);
}

const footerLinks = [
	{
		title: "Find your day",
		links: [
			{ label: "Explore destinations", to: "/", hash: "destinations" },
			{ label: "Plan a trip", to: "/", hash: "plan" },
			{ label: "How it works", to: "/how-it-works" },
			{ label: "About us", to: "/about" },
		],
	},
	{
		title: "Here to help",
		links: [
			{ label: "Help & FAQ", to: "/help" },
			{ label: "Contact", to: "/contact" },
			{ label: "Safety", to: "/safety" },
			{ label: "Accessibility", to: "/accessibility" },
		],
	},
	{
		title: "The details",
		links: [
			{ label: "Terms", to: "/terms" },
			{ label: "Privacy", to: "/privacy" },
			{ label: "Browser data" },
			{ label: "Cancellations & refunds", to: "/cancellations" },
		],
	},
] as const;

export function PublicFooter({ onInfo }: { onInfo: (title: string) => void }) {
	return (
		<footer className="bg-footer">
			<div className="mx-auto w-page pt-[clamp(2.5rem,4.7vw,5rem)]">
				<div className="grid grid-cols-2 gap-4 gap-y-[1.45rem] text-[0.9rem] tablet:grid-cols-[2.4fr_repeat(3,1fr)] tablet:gap-y-4">
					<div>
						<Link to="/" hash="top" aria-label="Journey Forge home">
							<img
								className="h-auto w-32 tablet:w-[11.4rem]"
								src={asset("brand-dark.png")}
								width="184"
								height="92"
								alt=""
								loading="lazy"
							/>
						</Link>
						<p className="mt-[1.4rem]">
							For the days you’ll talk about for years.
						</p>
					</div>
					{footerLinks.map(({ title, links }) => (
						<div key={title}>
							<h2 className="mb-3 leading-[1.09] font-[750]">{title}</h2>
							<ul>
								{links.map((entry) => (
									<li
										className="my-[0.95rem] [&_a]:hover:underline [&_button]:hover:underline [&_a]:underline-offset-[0.15em] [&_button]:underline-offset-[0.15em]"
										key={entry.label}
									>
										{"to" in entry ? (
											<Link
												to={entry.to}
												hash={"hash" in entry ? entry.hash : undefined}
											>
												{entry.label}
											</Link>
										) : (
											<button
												type="button"
												className="text-left"
												onClick={() => onInfo(entry.label)}
											>
												{entry.label}
											</button>
										)}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
				<div className="flex items-center justify-between gap-4 pt-[clamp(1.65rem,3.75vw,4rem)] pb-4 text-[0.78rem]">
					<span>© 2026 Journey Forge</span>
					<a
						className="inline-flex items-center gap-3 hover:underline hover:underline-offset-[0.15em]"
						href="#top"
					>
						Back to top <Arrow up />
					</a>
				</div>
			</div>
			<img
				className="h-auto w-full"
				src={asset("footer-landscape.webp")}
				alt=""
				width="1425"
				height="404"
				loading="lazy"
			/>
		</footer>
	);
}
