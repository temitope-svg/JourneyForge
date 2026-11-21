import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Arrow } from "../Arrow";

export default function PolicyLayout({
	to,
	sections,
	draftSubject,
	children,
}: {
	to: "/terms" | "/privacy" | "/accessibility";
	sections: readonly { id: string; title: string }[];
	draftSubject: "policy text" | "statement";
	children: ReactNode;
}) {
	const hash = useLocation({ select: (location) => location.hash });
	const active = hash || sections[0].id;
	return (
		<section className="bg-paper pt-[clamp(2.5rem,4vw,4.5rem)] pb-section">
			<div className="mx-auto grid w-page items-start gap-8 tablet:grid-cols-[clamp(11rem,20vw,17.5rem)_minmax(0,51.25rem)] tablet:gap-[4.25vw]">
				<nav
					aria-label="On this page"
					className="tablet:border-r tablet:border-ink/15 tablet:pr-6"
				>
					<p className="mb-3 px-3 text-sm font-semibold">On this page</p>
					<ul className="grid gap-1">
						{sections.map(({ id, title }) => (
							<li key={id}>
								<Link
									to={to}
									hash={id}
									activeOptions={{ includeHash: true }}
									aria-current={id === active ? "location" : undefined}
									className={`group flex min-h-12 items-center justify-between gap-3 border-l-4 px-3 py-2.5 text-sm font-semibold ${id === active ? "border-sun bg-ocean text-white" : "border-transparent hover:text-ocean"}`}
								>
									{title}
									<Arrow />
								</Link>
							</li>
						))}
					</ul>
				</nav>
				<div className="min-w-0">
					<p className="bg-sun px-5 py-[1.25rem] text-sm font-semibold">
						Design preview — {draftSubject} awaiting approval
					</p>
					<dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm">
						<div className="flex gap-2">
							<dt className="font-semibold">Effective date</dt>
							<dd>Pending approval</dd>
						</div>
						<div className="flex gap-2">
							<dt className="font-semibold">Version</dt>
							<dd>Draft</dd>
						</div>
					</dl>
					<div className="mt-8 divide-y divide-ink/15 border-b border-ink/15">
						{children}
					</div>
				</div>
			</div>
		</section>
	);
}
