import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Icon } from "./DashboardIcon";
import type { Experience } from "./ExperienceCard";

const formatPrice = new Intl.NumberFormat("en");
const notes = [
	[
		"What’s included",
		"Inclusions and partner details will be provided before you approve a booking.",
	],
	[
		"Getting there",
		"Your meeting point and transport needs will be confirmed during planning.",
	],
	[
		"Good to know",
		"Tell us about children, dietary needs or mobility requirements. Suitability and weather conditions still need checking.",
	],
];
const outline =
	"inline-flex min-h-12 items-center justify-center gap-3 rounded-[0.65rem] border border-[#c7d7ef] bg-white px-5 py-2.5 text-sm font-semibold hover:border-ocean/50 hover:text-ocean";

export default function ExperienceDetail({
	experience,
	saved,
	onSave,
	onPlan,
}: {
	experience: Experience;
	saved: boolean;
	onSave: () => void;
	onPlan: (openPlanner: boolean) => string;
}) {
	const photo = useRef<HTMLDialogElement>(null);
	const [notice, setNotice] = useState("");

	return (
		<main className="mx-auto max-w-[100rem] px-4 pt-6 pb-16 tablet:px-[clamp(2rem,4.05vw,4.25rem)] tablet:pt-9">
			<nav aria-label="Breadcrumb" className="text-sm text-[#506582]">
				<Link to="/explore" className="text-ocean underline underline-offset-2">
					Explore
				</Link>
				<span aria-hidden="true"> / </span>
				<span aria-current="page">{experience.place}</span>
			</nav>

			<header className="mt-8 flex flex-wrap items-start justify-between gap-4 tablet:mt-11">
				<div>
					<h1 className="text-[clamp(2.45rem,4vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.05em]">
						{experience.title}
					</h1>
					<p className="mt-4 flex items-center gap-1.5 text-sm text-[#506582] tablet:text-base">
						<Icon name="pin" className="size-5 shrink-0" />
						{experience.place}, Mauritius · {experience.duration}
					</p>
				</div>
				<button
					type="button"
					aria-pressed={saved}
					onClick={onSave}
					className={`${outline} aria-pressed:border-ocean aria-pressed:text-ocean`}
				>
					<Icon name="bookmark" className="size-5" />
					{saved ? "Saved" : "Save"}
				</button>
			</header>

			<div className="mt-7 grid gap-3 tablet:grid-cols-[2fr_1fr]">
				<div className="relative overflow-hidden rounded-2xl">
					<img
						src={`/dashboard/${experience.image}.webp`}
						alt={experience.alt}
						className="aspect-[2.1] w-full object-cover tablet:aspect-[2.43]"
					/>
					<button
						type="button"
						aria-haspopup="dialog"
						onClick={() => photo.current?.showModal()}
						className="absolute right-3 bottom-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-medium hover:text-ocean tablet:right-4"
					>
						View photo <Icon name="next" className="size-5" />
					</button>
				</div>
				<img
					src="/dashboard/sunset-coast.webp"
					alt="Turquoise water and the green west coast of Mauritius"
					className="hidden h-full min-h-0 w-full rounded-2xl object-cover tablet:block"
				/>
			</div>

			<div className="mt-8 grid items-start gap-8 tablet:grid-cols-[2fr_1fr] tablet:gap-10">
				<div>
					<h2 className="text-[1.75rem] leading-tight font-semibold tracking-tight">
						{experience.overview}
					</h2>
					<p className="mt-4 text-sm leading-relaxed tablet:text-base">
						{experience.description}
					</p>

					<h2 className="mt-7 text-[1.75rem] leading-tight font-semibold tracking-tight">
						Before you go
					</h2>
					<dl className="mt-5 divide-y divide-[#dbeaff] border-t border-[#dbeaff]">
						{notes.map(([title, description]) => (
							<div key={title} className="py-5">
								<dt className="font-semibold">{title}</dt>
								<dd className="mt-2 text-sm leading-relaxed text-[#506582] tablet:text-base">
									{description}
								</dd>
							</div>
						))}
					</dl>
				</div>

				<aside
					className="rounded-2xl border border-[#dbeaff] bg-[#e9f3ff] p-5 tablet:p-[clamp(1.1rem,2.05vw,2rem)]"
					aria-labelledby="experience-price"
				>
					<p className="flex items-center gap-2.5 text-xs font-bold tracking-wider uppercase before:h-1 before:w-6 before:bg-sun">
						Indicative price
					</p>
					<h2
						id="experience-price"
						className="mt-5 text-[1.8rem] leading-tight font-semibold tracking-tight"
					>
						From MUR {formatPrice.format(experience.price)}
					</h2>
					<p className="mt-1 text-sm">per person</p>
					<p className="mt-5 text-sm leading-relaxed">
						Final price and availability confirmed before booking.
					</p>
					<div className="mt-7 grid gap-3.5">
						<button
							type="button"
							onClick={() => setNotice(onPlan(false))}
							className="inline-flex min-h-12 items-center justify-center gap-3 rounded-[0.65rem] bg-ocean px-4 text-sm font-semibold text-white hover:bg-[#0018c9]"
						>
							Add to my plan <Icon name="next" className="size-4" />
						</button>
						<button
							type="button"
							onClick={() => setNotice(onPlan(true))}
							className={outline}
						>
							Plan a day around this
						</button>
					</div>
					<p
						role="status"
						className={notice ? "mt-3 text-sm font-medium" : "sr-only"}
					>
						{notice}
					</p>
					<p className="mt-4 text-xs leading-relaxed text-[#506582]">
						This experience is a concept. Adding it to your plan creates a
						draft.
					</p>
					<Link
						to="/contact"
						className="mt-4 inline-block text-sm text-ocean underline underline-offset-2"
					>
						Need a hand? Get in touch
					</Link>
				</aside>
			</div>

			<dialog
				ref={photo}
				aria-labelledby="experience-photo-title"
				className="m-auto max-h-[calc(100%-2rem)] w-[min(75rem,calc(100%-2rem))] overflow-y-auto rounded-2xl bg-white p-4 text-[#102040] backdrop:bg-[#172345]/65 motion-safe:open:animate-response-arrival"
			>
				<form
					method="dialog"
					className="mb-3 flex items-center justify-between gap-4"
				>
					<h2 id="experience-photo-title" className="text-lg font-semibold">
						{experience.title}
					</h2>
					<button
						type="submit"
						aria-label="Close photo"
						className="grid size-10 place-items-center rounded-lg text-2xl hover:bg-[#e9f3ff]"
					>
						×
					</button>
				</form>
				<img
					src={`/dashboard/${experience.image}.webp`}
					alt={experience.alt}
					className="w-full rounded-lg"
				/>
			</dialog>
		</main>
	);
}
