import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Arrow } from "./Arrow";
import { headingStyle, textButton } from "./accountStyles";

export default function AccountLayout({
	children,
	flow = false,
	center = false,
}: {
	children: ReactNode;
	flow?: boolean;
	center?: boolean;
}) {
	return (
		<main className="min-h-svh bg-paper desktop:grid desktop:grid-cols-[52%_48%]">
			<aside
				className="flex min-h-52 flex-col justify-between gap-8 bg-[#0a2229] bg-hero bg-cover bg-center px-inset py-6 text-white desktop:min-h-svh desktop:py-10"
				aria-label="Journey Forge"
			>
				<Link to="/" aria-label="Journey Forge home" className="self-start">
					<img
						src="/home/brand-light.png"
						width="151"
						height="73"
						alt=""
						className="h-auto w-24 desktop:w-[151px]"
					/>
				</Link>
				<div>
					<p
						className={`${headingStyle} text-[clamp(2rem,5.5vw,4rem)] desktop:text-[clamp(3.1rem,5.45vw,5.5rem)]`}
					>
						Good days.
						<br />
						Great stories.
						<br />
						<span className="text-sun">Yours to forge.</span>
					</p>
					<p className="mt-7 hidden text-lg leading-[1.8] desktop:block">
						A little less planning.
						<br />A lot more being there.
					</p>
				</div>
				<Link
					to="/"
					hash="destinations"
					className="group hidden items-center justify-between border-t border-white/40 pt-6 text-sm font-semibold hover:text-sun desktop:flex"
				>
					Keep exploring <Arrow />
				</Link>
			</aside>

			<div
				className={`flex min-w-0 flex-col px-[clamp(1.25rem,5vw,4.5rem)] py-10 ${flow ? "desktop:py-[clamp(4rem,8vw,8rem)]" : "desktop:pt-[clamp(4.5rem,7.15vw,6.4rem)] desktop:pb-10"}`}
			>
				<div
					className={`mx-auto w-full max-w-[28.75rem] ${center ? "desktop:my-auto" : flow ? "desktop:pt-4" : ""}`}
				>
					{children}
				</div>
				<footer
					className={`mx-auto mt-auto flex w-full max-w-[34.75rem] items-center justify-between gap-4 pt-12 text-xs text-ink/75 ${flow ? "" : "desktop:mt-0 desktop:pt-[3.4rem]"}`}
				>
					<span>© 2026 Journey Forge</span>
					<Link to="/help" className={textButton}>
						Need a hand?
					</Link>
				</footer>
			</div>
		</main>
	);
}
