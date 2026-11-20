import { Link } from "@tanstack/react-router";
import type data from "../backend/dashboard.json";
import { Icon } from "./DashboardIcon";

export type Experience = (typeof data.experiences)[number];
const price = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });

export default function ExperienceCard({
	entry,
	bookmarked,
	onToggleSaved,
}: {
	entry: Experience;
	bookmarked: boolean;
	onToggleSaved: () => void;
}) {
	return (
		<article className="flex flex-col overflow-hidden rounded-2xl border border-[#dbeaff] bg-white">
			<div className="relative">
				<img
					src={`/dashboard/${entry.image}.webp`}
					alt=""
					className="aspect-[1.65] w-full object-cover"
				/>
				<button
					type="button"
					aria-label={`Save ${entry.title}`}
					aria-pressed={bookmarked}
					onClick={onToggleSaved}
					className="absolute top-3 right-3 grid size-11 place-items-center rounded-xl border border-[#dbeaff] bg-white text-ocean hover:bg-[#e9f3ff] aria-pressed:border-ocean aria-pressed:bg-ocean aria-pressed:text-white"
				>
					<Icon name="bookmark" />
				</button>
			</div>
			<div className="flex flex-1 flex-col p-5">
				<h2 className="text-xl leading-tight font-semibold tracking-tight">
					{entry.title}
				</h2>
				<div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#506582]">
					<span className="inline-flex items-center gap-1">
						<Icon name="pin" className="size-4" />
						{entry.place}
					</span>
					<span className="inline-flex items-center gap-1">
						<Icon name="clock" className="size-4" />
						{entry.duration}
					</span>
				</div>
				<p className="mt-3 mb-4 flex-1 text-sm leading-relaxed text-[#506582]">
					{entry.description}
				</p>
				<div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#dbeaff] pt-4 text-sm">
					<p>
						From <strong>MUR {price.format(entry.price)}</strong>
					</p>
					<Link
						to="/experiences/$experienceId"
						params={{ experienceId: entry.id }}
						aria-label={`View experience: ${entry.title}`}
						className="inline-flex items-center gap-1.5 text-ocean hover:underline"
					>
						View experience <Icon name="next" className="size-5" />
					</Link>
				</div>
			</div>
		</article>
	);
}
