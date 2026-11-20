export function Arrow({
	up = false,
	className = "",
}: {
	up?: boolean;
	className?: string;
}) {
	return (
		<span
			className={`relative inline-block size-[1em] shrink-0 [--arrow-stroke:1.5px] before:absolute before:top-[49%] before:-left-[3%] before:w-[105%] before:-rotate-45 before:border-t-(length:--arrow-stroke) after:absolute after:top-[4%] after:right-[4%] after:size-[58%] after:border-t-(length:--arrow-stroke) after:border-r-(length:--arrow-stroke) motion-safe:transition-[translate] motion-safe:duration-[210ms] motion-safe:ease-arrival motion-safe:group-hover:translate-x-[3px] motion-safe:group-hover:-translate-y-[3px] motion-safe:group-focus-visible:translate-x-[3px] motion-safe:group-focus-visible:-translate-y-[3px] ${up ? "-rotate-45" : ""} ${className}`}
			aria-hidden="true"
		/>
	);
}
