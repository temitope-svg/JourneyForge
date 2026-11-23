import { Link } from "@tanstack/react-router";
import { Icon } from "./DashboardIcon";
import StatusLayout from "./layout/StatusLayout";

export default function UnavailablePage() {
	return (
		<StatusLayout>
			<div>
				<p className="text-sm font-semibold tracking-wider text-ocean">
					SERVICE UNAVAILABLE
				</p>
				<h1 className="mt-8 text-[clamp(3rem,5.45vw,5.5rem)] leading-none font-[750] tracking-[-0.06em]">
					A pause,
					<br /> not the end.
				</h1>
				<p className="mt-8 text-[clamp(1.15rem,1.65vw,1.65rem)] text-ink/75">
					We can’t load this right now. Try again.
				</p>
				<div className="mt-[clamp(2rem,5.4vw,5.5rem)] flex flex-wrap items-center gap-5 tablet:gap-8">
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="group inline-flex min-h-12 min-w-36 items-center justify-between gap-6 rounded-[3px] bg-ocean px-5 py-3 text-sm font-semibold text-white hover:bg-[#0018c9] tablet:min-w-52"
					>
						Try again{" "}
						<Icon
							name="retry"
							className="size-5 motion-safe:transition-transform motion-safe:group-hover:rotate-45"
						/>
					</button>
					<Link
						to="/help"
						className="inline-flex min-h-12 items-center gap-4 text-sm font-semibold text-ocean hover:underline"
					>
						Help centre <Icon name="next" className="size-5" />
					</Link>
				</div>
				<p className="mt-5 max-w-[65ch] text-xs text-ink/75">
					Design preview. This screen does not establish a live service, booking
					or account status.
				</p>
			</div>
			<svg
				viewBox="0 0 190 220"
				fill="none"
				aria-hidden="true"
				className="w-[clamp(8rem,17vw,16rem)] justify-self-end tablet:mr-4"
			>
				<g
					stroke="#0b1723"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<rect x="4" y="40" width="182" height="156" rx="9" />
					<path d="M4 67h182" />
					<circle cx="18" cy="53.5" r="2" fill="#0b1723" />
					<circle cx="30" cy="53.5" r="2" fill="#0b1723" />
					<circle cx="42" cy="53.5" r="2" fill="#0b1723" />
					<circle cx="95" cy="113" r="26" className="fill-sun" />
					<path d="M95 99v16m0 9v1" />
					<path d="M51 159h88m-74 15h60" className="stroke-ink/35" />
				</g>
			</svg>
		</StatusLayout>
	);
}
