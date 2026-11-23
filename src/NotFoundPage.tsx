import { Link } from "@tanstack/react-router";
import { Icon } from "./DashboardIcon";
import { getDemoSession } from "./demoAuth";
import StatusLayout from "./layout/StatusLayout";

export default function NotFoundPage() {
	const session = getDemoSession();
	return (
		<StatusLayout>
			<div>
				<p className="text-sm font-semibold tracking-wider text-ocean">404</p>
				<h1 className="mt-8 text-[clamp(3rem,5.45vw,5.5rem)] leading-none font-[750] tracking-[-0.06em]">
					This path
					<br /> ends here.
				</h1>
				<p className="mt-8 text-[clamp(1.15rem,1.65vw,1.65rem)] text-ink/75">
					We can’t find that page.
				</p>
				<div className="mt-[clamp(2rem,5.4vw,5.5rem)] flex flex-wrap gap-4 tablet:gap-6">
					<Link
						to="/"
						className="group inline-flex min-h-12 min-w-36 items-center justify-between gap-6 rounded-[3px] bg-ocean px-5 py-3 text-sm font-semibold text-white hover:bg-[#0018c9] tablet:min-w-52"
					>
						Home{" "}
						<Icon
							name="next"
							className="size-5 motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
						/>
					</Link>
					<Link
						to={session ? "/trips/plan" : "/"}
						hash={session ? undefined : "plan"}
						className="inline-flex min-h-12 items-center rounded-[3px] border border-ink/70 px-5 py-3 text-sm hover:border-ocean hover:text-ocean"
					>
						Plan a trip
					</Link>
				</div>
			</div>

			<svg
				viewBox="0 0 184 220"
				fill="none"
				aria-hidden="true"
				className="w-[clamp(8rem,16vw,16rem)] justify-self-end tablet:mt-4 tablet:mr-6"
			>
				<g
					stroke="#0b1723"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="m100 18 45 9 16 18-16 10-45-8M89 67H22L1 87l21 20h67" />
					<path d="M86 5h15v208H86z" className="fill-paper" />
					<path d="M67 104h79l18 20-18 20H67z" className="fill-sun" />
					<path d="m94 116 18 17m0-17-18 17M14 214h157m-132 0-10-22m10 22 7-36m73 36 7-26m9 26 5-14" />
				</g>
			</svg>
		</StatusLayout>
	);
}
