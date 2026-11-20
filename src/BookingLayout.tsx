import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
	type BookingPlan,
	type BookingStep,
	bookingAmounts,
} from "./bookingPreview";
import { Icon, type IconName } from "./DashboardIcon";
import { currency } from "./itineraryModel";

export const box = "rounded-2xl border border-[#dbeaff] bg-white";
export const section = "border-t border-[#dbeaff] pt-5";
export const muted = "text-[#506582]";
export const blueButton =
	"inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-ocean px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0018c9] disabled:cursor-not-allowed disabled:opacity-50";
export const lightButton =
	"inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#c7d7ef] bg-white px-5 py-2.5 text-sm font-semibold hover:bg-[#e9f3ff]";
export const textLink = "text-sm font-medium text-ocean hover:underline";
export const field =
	"block min-h-12 w-full rounded-lg border border-[#92a5c1] bg-white px-3 text-sm placeholder:text-[#506582] aria-invalid:border-red-700";
export const money = (amount: number) => `MUR ${currency.format(amount)}`;

export function Heading({ children }: { children: ReactNode }) {
	return (
		<h2 className="text-[1.6rem] leading-tight font-semibold tracking-tight">
			{children}
		</h2>
	);
}

export function Callout({
	title,
	children,
	warning = false,
}: {
	title?: string;
	children?: ReactNode;
	warning?: boolean;
}) {
	return (
		<div
			className={`flex items-start gap-3 rounded-xl p-4 text-sm leading-relaxed ${warning ? "bg-[#fff5d9] text-[#634507]" : "bg-[#e9f3ff]"}`}
		>
			<span
				aria-hidden="true"
				className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-current text-xs"
			>
				i
			</span>
			<div>
				{title && <p className="font-semibold">{title}</p>}
				{children && (
					<div className={title ? "mt-1" : undefined}>{children}</div>
				)}
			</div>
		</div>
	);
}

export function BookingGrid({
	children,
	aside,
}: {
	children: ReactNode;
	aside: ReactNode;
}) {
	return (
		<div className="mt-7 grid items-start gap-6 desktop:grid-cols-[1.85fr_1fr]">
			<div className={`${box} min-w-0 p-5 tablet:p-7`}>{children}</div>
			{aside}
		</div>
	);
}

export function BookingCard({
	plan,
	children,
}: {
	plan: BookingPlan;
	children: ReactNode;
}) {
	return (
		<aside className={`${box} min-w-0 p-3`} aria-label="Trip summary">
			<img
				src="/dashboard/west-coast.webp"
				alt="Le Morne and the lagoon in Mauritius"
				className="aspect-[1.85] w-full rounded-xl object-cover"
			/>
			<div className="space-y-5 px-4 py-5">
				<div>
					<Heading>{plan.title}</Heading>
					<p className={`${muted} mt-3 text-sm`}>
						{plan.date} · {plan.travellers}
					</p>
					<p className={`${muted} mt-2 text-sm`}>Mauritius</p>
				</div>
				{children}
			</div>
		</aside>
	);
}

export function AmountSummary({
	plan,
	authorisation = false,
}: {
	plan: BookingPlan;
	authorisation?: boolean;
}) {
	const { activities, total } = bookingAmounts(plan);
	const items: { icon: IconName; label: string; value: number }[] = [
		{ icon: "sun", label: "Experiences & meals", value: activities },
		{ icon: "car", label: "Private transport", value: plan.transport },
		{ icon: "people", label: "Journey Forge fee", value: plan.coordination },
	];
	return (
		<>
			<dl className={`${section} grid gap-4 text-sm`}>
				{items.map(({ icon, label, value }) => (
					<div key={label} className="flex items-center justify-between gap-3">
						<dt className="flex items-center gap-2">
							<Icon name={icon} className="size-5 text-ocean" />
							{label}
						</dt>
						<dd className="shrink-0 font-semibold">{money(value)}</dd>
					</div>
				))}
			</dl>
			<div
				className={`${section} flex flex-wrap items-center justify-between gap-2 text-sm`}
			>
				<p>{authorisation ? "Amount to authorise" : "Estimated total"}</p>
				<p className="text-[clamp(1.45rem,2.2vw,2rem)] font-semibold tracking-tight text-ocean">
					{money(total)}
				</p>
			</div>
			{authorisation && (
				<p className={`${muted} flex justify-between gap-3 text-xs`}>
					<span>Payable on the day</span>
					<span>{money(0)}</span>
				</p>
			)}
		</>
	);
}

export function SectionDisclosure({
	title,
	subtitle,
	icon,
	children,
}: {
	title: string;
	subtitle?: string;
	icon?: IconName;
	children: ReactNode;
}) {
	return (
		<details className="group border-t border-[#dbeaff]">
			<summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
				{icon && <Icon name={icon} className="size-5 shrink-0 text-ocean" />}
				<span className="flex-1">
					{title}
					{subtitle && (
						<span className={`${muted} mt-1 block text-xs font-normal`}>
							{subtitle}
						</span>
					)}
				</span>
				<span
					aria-hidden="true"
					className="mr-1 size-2 rotate-45 border-r border-b text-ocean group-open:rotate-[225deg]"
				/>
			</summary>
			<div className={`${muted} pb-4 text-sm leading-relaxed`}>{children}</div>
		</details>
	);
}

export function BookingHeader({
	title,
	subtitle,
	back,
	step,
	request = false,
}: {
	title: string;
	subtitle: string;
	back: ReactNode;
	step?: number;
	request?: boolean;
}) {
	return (
		<header>
			{back}
			<div className="mt-5 flex flex-wrap items-center justify-between gap-5">
				<div>
					<h1 className="text-[clamp(2.25rem,3.75vw,3.65rem)] leading-[1.05] font-semibold tracking-[-0.05em]">
						{title}
					</h1>
					<p
						className={`${muted} mt-3 text-base leading-relaxed tablet:text-lg`}
					>
						{subtitle}
					</p>
				</div>
				{step && (
					<ol
						aria-label="Booking steps"
						className="flex flex-wrap gap-4 text-xs"
					>
						{["Trip details", "Review request", "Payment"].map(
							(item, index) => (
								<li
									key={item}
									aria-current={step === index + 1 ? "step" : undefined}
									className={`flex items-center gap-2 ${index + 1 <= step ? "text-ocean" : muted}`}
								>
									<span
										className={`grid size-7 place-items-center rounded-full border font-semibold ${step === index + 1 ? "border-ocean bg-ocean text-white" : "border-[#92a5c1]"}`}
									>
										{index + 1 < step ? (
											<Icon name="check" className="size-4" />
										) : (
											index + 1
										)}
									</span>
									{item}
								</li>
							),
						)}
					</ol>
				)}
			</div>
			{request && (
				<p
					className={`${muted} mt-5 flex flex-wrap items-center gap-3 text-xs`}
				>
					<span className="font-semibold text-[#102040]">Request JF-DEMO</span>
					<span className="rounded-full bg-[#e9f3ff] px-3 py-1.5 font-semibold text-ocean">
						Preview
					</span>
					No request was sent or money held. Partner updates are illustrative.
				</p>
			)}
		</header>
	);
}

export function BookingBack({
	step,
	children,
}: {
	step?: BookingStep;
	children: ReactNode;
}) {
	const content = (
		<>
			<Icon name="next" className="size-4 rotate-180" />
			{children}
		</>
	);
	const className = `${textLink} inline-flex items-center gap-2`;
	return step ? (
		<Link to="/trips/booking/$step" params={{ step }} className={className}>
			{content}
		</Link>
	) : (
		<Link to="/trips" className={className}>
			{content}
		</Link>
	);
}

export function HelpLink({ children = "Get help" }: { children?: ReactNode }) {
	return (
		<Link to="/" hash="help" className={lightButton}>
			{children}
		</Link>
	);
}
