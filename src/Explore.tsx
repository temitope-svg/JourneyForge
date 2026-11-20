import { Link } from "@tanstack/react-router";
import { type FormEvent, useRef, useState } from "react";
import data from "../backend/dashboard.json";
import { Icon, type IconName } from "./DashboardIcon";

import ExperienceCard from "./ExperienceCard";

type SortOrder = "recommended" | "price-asc" | "price-desc";

const control =
	"min-h-12 rounded-[0.65rem] border border-[#dbeaff] bg-white px-3 text-sm text-[#102040]";
const chip =
	"flex min-h-11 items-center gap-2.5 rounded-full border border-[#dbeaff] px-4 text-sm hover:border-ocean/40 aria-pressed:border-ocean aria-pressed:bg-ocean aria-pressed:text-white";

const emptyFilters = { region: "", maxPrice: "", duration: "" };
const regions = [...new Set(data.experiences.map((entry) => entry.place))];
const durations = [...new Set(data.experiences.map((entry) => entry.duration))];

export default function Explore({
	saved,
	onToggleSaved,
}: {
	saved: string[];
	onToggleSaved: (id: string) => void;
}) {
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState("");
	const [filters, setFilters] = useState(emptyFilters);
	const [draftFilters, setDraftFilters] = useState(emptyFilters);
	const filterDialog = useRef<HTMLDialogElement>(null);
	const activeFilterCount = Object.values(filters).filter(Boolean).length;
	const [sort, setSort] = useState<SortOrder>("recommended");

	const searchTerms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
	const results = data.experiences.filter((entry) => {
		const searchable = [
			entry.title,
			entry.description,
			entry.place,
			...entry.categories,
		]
			.join(" ")
			.toLowerCase();
		return (
			(!category || entry.categories.includes(category)) &&
			(!filters.region || entry.place === filters.region) &&
			(!filters.maxPrice || entry.price <= Number(filters.maxPrice)) &&
			(!filters.duration || entry.duration === filters.duration) &&
			searchTerms.every((term) => searchable.includes(term))
		);
	});

	if (sort === "price-asc")
		results.sort((first, second) => first.price - second.price);
	if (sort === "price-desc")
		results.sort((first, second) => second.price - first.price);

	function openFilters() {
		setDraftFilters(filters);
		filterDialog.current?.showModal();
	}

	function applyFilters(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFilters(draftFilters);
		filterDialog.current?.close();
	}

	return (
		<main className="mx-auto max-w-[100rem] px-4 pt-6 pb-14 tablet:px-[clamp(2rem,4.05vw,4.25rem)] tablet:pt-9">
			<nav aria-label="Breadcrumb" className="text-sm text-[#506582]">
				<Link
					to="/dashboard"
					className="text-ocean underline underline-offset-2"
				>
					Home
				</Link>
				<span aria-hidden="true"> / </span>
				<span aria-current="page">Explore</span>
			</nav>

			<header className="mt-8">
				<p className="flex items-center gap-2.5 text-xs font-bold tracking-wider uppercase before:h-1 before:w-6 before:bg-sun">
					Explore the island
				</p>
				<h1 className="mt-4 text-[clamp(2.25rem,4vw,3.3rem)] leading-[1.05] font-semibold tracking-[-0.045em]">
					Find your kind of Mauritius.
				</h1>
				<p className="mt-4 leading-relaxed text-[#506582]">
					Slow mornings. Wild afternoons. Something that feels like you.
				</p>
			</header>

			<div className="mt-8 flex flex-wrap items-end gap-3">
				<div className="min-w-52 flex-1">
					<label
						htmlFor="experience-search"
						className="mb-2 block text-sm font-medium"
					>
						Search experiences or places
					</label>
					<input
						id="experience-search"
						type="search"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Try a sunset, Chamarel or a market"
						className={`${control} w-full placeholder:text-[#506582]`}
					/>
				</div>
				<button
					type="button"
					aria-haspopup="dialog"
					onClick={openFilters}
					className={`${control} flex items-center gap-4 border-[#c7d7ef] px-5 font-semibold hover:border-ocean/50`}
				>
					Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
					<span
						aria-hidden="true"
						className="size-2 -translate-y-0.5 rotate-45 border-r border-b"
					/>
				</button>
			</div>

			<fieldset
				aria-label="Experience categories"
				className="mt-5 flex flex-wrap gap-3"
			>
				<button
					type="button"
					aria-pressed={!category}
					className={chip}
					onClick={() => setCategory("")}
				>
					All experiences
				</button>
				{data.categories.map(({ label, icon }) => (
					<button
						type="button"
						key={label}
						aria-pressed={category === label}
						onClick={() => setCategory(category === label ? "" : label)}
						className={chip}
					>
						<Icon name={icon as IconName} className="size-5" />
						{label}
					</button>
				))}
			</fieldset>

			<div className="mt-7 flex flex-wrap items-center justify-between gap-3 text-sm">
				<p role="status">
					{results.length} {results.length === 1 ? "experience" : "experiences"}
				</p>
				<label className="flex items-center gap-2">
					Sort:
					<select
						className={`${control} min-h-11 pr-2`}
						value={sort}
						onChange={(event) => setSort(event.target.value as SortOrder)}
					>
						<option value="recommended">Recommended</option>
						<option value="price-asc">Price: low to high</option>
						<option value="price-desc">Price: high to low</option>
					</select>
				</label>
			</div>

			{results.length ? (
				<div className="mt-4 grid gap-5 tablet:grid-cols-2 desktop:grid-cols-3">
					{results.map((entry) => (
						<ExperienceCard
							key={entry.id}
							entry={entry}
							bookmarked={saved.includes(entry.id)}
							onToggleSaved={() => onToggleSaved(entry.id)}
						/>
					))}
				</div>
			) : (
				<div className="mt-4 rounded-2xl border border-[#dbeaff] bg-white p-8 text-center">
					<p className="font-semibold">No experiences match your search.</p>
					<button
						type="button"
						className="mt-3 text-sm text-ocean underline underline-offset-4"
						onClick={() => {
							setQuery("");
							setCategory("");
							setFilters(emptyFilters);
						}}
					>
						Clear search and filters
					</button>
				</div>
			)}
			<p className="mt-6 text-xs leading-relaxed text-[#506582]">
				Illustrative experiences and prices. Dates, guests and availability are
				checked later in your planning request.
			</p>
			<dialog
				ref={filterDialog}
				aria-labelledby="explore-filters-title"
				className="m-auto max-h-[calc(100%-2rem)] w-[min(35rem,calc(100%-2rem))] overflow-y-auto rounded-2xl border border-[#dbeaff] bg-white p-6 text-[#102040] shadow-xl backdrop:bg-[#172345]/42 backdrop:backdrop-blur-xs motion-safe:open:animate-response-arrival tablet:p-8"
			>
				<div className="mb-7 flex items-start justify-between gap-4">
					<h2
						id="explore-filters-title"
						className="text-[1.7rem] leading-tight font-semibold tracking-tight"
					>
						Filters
					</h2>
					<button
						type="button"
						aria-label="Close filters"
						onClick={() => filterDialog.current?.close()}
						className="grid size-8 shrink-0 place-items-center rounded-md leading-none hover:bg-[#e9f3ff]"
					>
						<span aria-hidden="true" className="text-2xl">
							×
						</span>
					</button>
				</div>

				<form onSubmit={applyFilters} className="space-y-5">
					<label className="block text-sm font-medium">
						Region
						<select
							className={`${control} mt-2 block w-full`}
							value={draftFilters.region}
							onChange={(event) =>
								setDraftFilters({ ...draftFilters, region: event.target.value })
							}
						>
							<option value="">Anywhere in Mauritius</option>
							{regions.map((region) => (
								<option key={region}>{region}</option>
							))}
						</select>
					</label>
					<label className="block text-sm font-medium">
						Maximum indicative price per person (MUR)
						<input
							type="number"
							min={0}
							step={1}
							inputMode="numeric"
							className={`${control} mt-2 block w-full placeholder:text-[#506582]`}
							placeholder="Any budget"
							value={draftFilters.maxPrice}
							onChange={(event) =>
								setDraftFilters({
									...draftFilters,
									maxPrice: event.target.value,
								})
							}
						/>
					</label>
					<label className="block text-sm font-medium">
						Duration
						<select
							className={`${control} mt-2 block w-full`}
							value={draftFilters.duration}
							onChange={(event) =>
								setDraftFilters({
									...draftFilters,
									duration: event.target.value,
								})
							}
						>
							<option value="">Any duration</option>
							{durations.map((duration) => (
								<option key={duration}>{duration}</option>
							))}
						</select>
					</label>
					<div className="flex flex-wrap gap-3.5 pt-2">
						<button
							type="button"
							onClick={() => setDraftFilters(emptyFilters)}
							className={`${control} px-4 hover:bg-[#e9f3ff]`}
						>
							Reset all
						</button>
						<button
							type="submit"
							className="min-h-12 rounded-[0.65rem] bg-ocean px-4 text-sm font-medium text-white hover:bg-[#0018c9]"
						>
							Show experiences
						</button>
					</div>
				</form>
			</dialog>
		</main>
	);
}
