import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Icon } from "../DashboardIcon";
import { getDemoSession } from "../demoAuth";

const utilityLink = "inline-flex min-h-11 items-center hover:text-ocean";

export default function StatusLayout({ children }: { children: ReactNode }) {
	const session = getDemoSession();

	return (
		<div className="min-h-svh bg-paper text-ink">
			<div className="mx-auto w-page max-w-[73.5rem] pt-[clamp(2rem,7vw,7rem)]">
				<header className="flex items-center justify-between gap-4 border-b border-ink/15 pb-[clamp(1.25rem,2.2vw,2.25rem)]">
					<Link to="/" aria-label="Journey Forge home">
						<img
							src="/home/brand-dark.png"
							alt=""
							width={151}
							height={73}
							className="h-auto w-[clamp(5.5rem,10vw,9.45rem)]"
						/>
					</Link>
					<nav
						aria-label="Support and account"
						className="flex items-center gap-3 text-sm tablet:gap-6"
					>
						<Link to="/help" className={utilityLink}>
							Help
						</Link>
						<Link
							to={session ? "/profile" : "/sign-in"}
							className={`${utilityLink} gap-2 border-l border-ink/15 pl-3 tablet:pl-6`}
						>
							<Icon name="account" className="size-5" />
							Account
						</Link>
					</nav>
				</header>

				<main className="grid items-start gap-10 pt-[clamp(3rem,6.3vw,6.5rem)] pb-[clamp(3rem,8.8vw,8.75rem)] tablet:grid-cols-[1fr_auto]">
					{children}
				</main>

				<footer className="flex flex-wrap items-center justify-between gap-x-6 border-t border-ink/15 pt-3 pb-8 text-sm text-ink/75 tablet:pt-5">
					<nav aria-label="Footer" className="flex flex-wrap gap-x-6">
						<Link to="/privacy" className={utilityLink}>
							Privacy
						</Link>
						<Link to="/terms" className={utilityLink}>
							Terms
						</Link>
						<Link to="/help" className={utilityLink}>
							Help
						</Link>
					</nav>
					<p>© 2026 Journey Forge</p>
				</footer>
			</div>
		</div>
	);
}
