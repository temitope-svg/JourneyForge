import { Link } from "@tanstack/react-router";
import { Icon } from "./DashboardIcon";
import ExperienceCard, { type Experience } from "./ExperienceCard";

export type SavedTab = "experiences" | "plans";

const tabLink =
	"min-h-12 border-b-2 border-transparent px-4 py-4 text-sm text-ocean hover:bg-[#e9f3ff] aria-[current=page]:border-ocean aria-[current=page]:font-bold";
const primary =
	"inline-flex min-h-11 items-center justify-center gap-3 rounded-lg bg-ocean px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0018c9]";
const planLink = { to: "/trips/plan" } as const;

export default function Saved({
	tab,
	singleDay,
	experiences,
	draft,
	onToggleSaved,
}: {
	tab: SavedTab;
	singleDay: boolean;
	experiences: Experience[];
	draft: string;
	onToggleSaved: (id: string) => void;
}) {
	return (
		<main className="mx-auto max-w-[100rem] px-4 pt-6 pb-16 tablet:px-[clamp(2rem,4.05vw,4.25rem)] tablet:pt-9">
			<header>
				<p className="flex items-center gap-2.5 text-xs font-bold tracking-wider uppercase before:h-1 before:w-6 before:bg-sun">
					Your saved collection
				</p>
				<h1 className="mt-4 text-[clamp(2.25rem,4vw,3.3rem)] leading-[1.05] font-semibold tracking-[-0.045em]">
					Good ideas. Kept close.
				</h1>
				<p className="mt-4 leading-relaxed text-[#506582]">
					Places to go, days to shape. Pick up where you left off.
				</p>
			</header>

			<nav
				aria-label="Saved collection"
				className="mt-8 flex gap-1.5 border-b border-[#dbeaff]"
			>
				<Link to="/saved" activeOptions={{ exact: true }} className={tabLink}>
					Experiences · {experiences.length}
				</Link>
				<Link to="/saved/plans" className={tabLink}>
					Draft plans · {draft ? 1 : 0}
				</Link>
			</nav>

			<div className="mt-7">
				{tab === "experiences" && experiences.length > 0 ? (
					<div className="grid gap-5 tablet:grid-cols-2 desktop:grid-cols-3">
						{experiences.map((entry) => (
							<ExperienceCard
								key={entry.id}
								entry={entry}
								bookmarked
								onToggleSaved={() => onToggleSaved(entry.id)}
							/>
						))}
					</div>
				) : tab === "plans" && draft ? (
					<article className="max-w-xl rounded-2xl border border-[#dbeaff] bg-white p-6">
						<h2 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight">
							<Icon name="bookmark" className="size-5 text-ocean" />
							Your trip draft
						</h2>
						<p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap wrap-anywhere text-[#506582]">
							{draft}
						</p>
						<Link {...planLink} className={`${primary} mt-5`}>
							Continue planning <Icon name="next" className="size-4" />
						</Link>
						<Link
							to={singleDay ? "/trips/single-day" : "/trips/itinerary"}
							className="mt-5 ml-4 inline-block text-sm text-ocean underline underline-offset-2"
						>
							View itinerary
						</Link>
					</article>
				) : (
					<div className="grid min-h-[20rem] place-items-center rounded-2xl border border-[#dbeaff] bg-white p-7 text-center">
						<div>
							<Icon name="bookmark" className="mx-auto size-11 text-ocean" />
							<h2 className="mt-5 text-2xl font-semibold tracking-tight">
								A little room for a new idea.
							</h2>
							<p className="mt-3 text-sm text-[#506582]">
								{tab === "plans"
									? "Your saved draft plan will appear here."
									: "Bookmark an experience to find it here."}
							</p>
							{tab === "plans" ? (
								<Link {...planLink} className={`${primary} mt-6`}>
									Plan a trip
								</Link>
							) : (
								<Link to="/explore" className={`${primary} mt-6`}>
									Explore experiences
								</Link>
							)}
						</div>
					</div>
				)}
			</div>

			<section className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#e9f3ff] p-5">
				<div>
					<h2 className="text-2xl font-semibold tracking-tight">
						There’s more island to discover.
					</h2>
					<p className="mt-1 text-sm text-[#506582]">
						Find something that feels like you.
					</p>
				</div>
				<Link
					to="/explore"
					className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg border border-[#c7d7ef] bg-white px-4 text-sm font-semibold text-ocean hover:bg-[#f5faff]"
				>
					Explore experiences <Icon name="next" className="size-4" />
				</Link>
			</section>
			<p className="mt-6 text-xs text-[#506582]">
				Saved in this browser. Account sync is not connected.
			</p>
		</main>
	);
}
