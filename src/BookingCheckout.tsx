import { Link } from "@tanstack/react-router";
import {
	cloneElement,
	type FormEvent,
	type ReactElement,
	useId,
	useState,
} from "react";
import {
	AmountSummary,
	BookingBack,
	BookingCard,
	BookingGrid,
	BookingHeader,
	blueButton,
	Callout,
	field,
	Heading,
	lightButton,
	money,
	muted,
	SectionDisclosure,
	section,
	textLink,
} from "./BookingLayout";
import {
	type BookingPreview,
	type BookingStep,
	bookingAmounts,
	type TravellerDetails,
	travellerSchema,
} from "./bookingPreview";
import { Icon, type IconName } from "./DashboardIcon";

type Advance = (step: BookingStep, updates: Partial<BookingPreview>) => void;
const titles: Record<keyof TravellerDetails, string> = {
	name: "Full name",
	dialCode: "Country code",
	phone: "Phone number",
	pickup: "Pickup address or hotel",
	meeting: "Room or meeting notes",
	needs: "Dietary, medical or accessibility needs relevant to this day.",
	otherNames: "Other traveller names",
	emergencyName: "Contact name",
	emergencyPhone: "Contact phone number",
};

function Field({
	label,
	children,
	error,
	optional = false,
}: {
	label: string;
	children: ReactElement<{ id?: string; "aria-describedby"?: string }>;
	error?: string;
	optional?: boolean;
}) {
	const id = useId();
	const errorId = `${id}-error`;
	return (
		<div className="min-w-0 text-sm">
			<label htmlFor={id} className="block font-semibold">
				{label}
				{optional && (
					<span className={`${muted} ml-1 font-normal`}>(optional)</span>
				)}
			</label>
			<div className="mt-2">
				{cloneElement(children, {
					id,
					"aria-describedby": error ? errorId : undefined,
				})}
			</div>
			{error && (
				<p id={errorId} className="mt-2 text-red-800">
					{error}
				</p>
			)}
		</div>
	);
}

function TravellerDetailsPage({
	preview,
	onAdvance,
}: {
	preview: BookingPreview;
	onAdvance: Advance;
}) {
	const [errors, setErrors] = useState<
		Partial<Record<keyof TravellerDetails, string>>
	>({});
	const plan = preview.plan;
	const traveller = preview.traveller;

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const values = new FormData(form);
		const result = travellerSchema.safeParse(
			Object.fromEntries(
				Object.keys(titles).map((key) => [key, values.get(key) ?? ""]),
			),
		);
		if (!result.success) {
			const problems = zErrors(result.error.issues);
			setErrors(problems);
			const first = Object.keys(problems)[0];
			const control = form.elements.namedItem(first);
			if (
				control instanceof HTMLElement &&
				!control.closest("details:not([open])")
			)
				control.focus();
			return;
		}
		onAdvance("review-request", {
			traveller: result.data,
			reviewed: false,
			authorised: false,
			decision: "pending",
		});
	}

	function entry(
		name: keyof TravellerDetails,
		placeholder: string,
		optional = false,
	) {
		const type = name === "phone" || name === "emergencyPhone" ? "tel" : "text";
		return (
			<Field label={titles[name]} optional={optional} error={errors[name]}>
				<input
					className={field}
					name={name}
					type={type}
					autoComplete="off"
					required={!optional}
					maxLength={name === "dialCode" ? 5 : 160}
					aria-invalid={Boolean(errors[name])}
					placeholder={placeholder}
					defaultValue={
						traveller?.[name] ??
						(name === "dialCode" ? "+230" : name === "pickup" ? plan.start : "")
					}
				/>
			</Field>
		);
	}

	return (
		<>
			<BookingHeader
				title="A few details. Then you’re set."
				subtitle="The essentials for a day that runs smoothly."
				step={1}
				back={
					<Link
						to="/trips/single-day"
						search={{ day: plan.dayKey }}
						className={`${textLink} inline-flex items-center gap-2`}
					>
						<Icon name="next" className="size-4 rotate-180" />
						Back to your plan
					</Link>
				}
			/>
			<BookingGrid
				aside={
					<BookingCard plan={plan}>
						<AmountSummary plan={plan} />
						<Callout title="Your plan, your pace.">
							You can still go back and make changes.
						</Callout>
					</BookingCard>
				}
			>
				<form
					onSubmit={submit}
					noValidate
					className="space-y-5"
					autoComplete="off"
				>
					<section>
						<Heading>Who’s leading the way?</Heading>
						<div className="mt-4 grid gap-3 tablet:grid-cols-2">
							{entry("name", "As shown on your booking")}
							<fieldset aria-label="Mobile or WhatsApp" className="min-w-0">
								<legend className="text-sm font-semibold">
									Mobile / WhatsApp
								</legend>
								<div className="grid grid-cols-[5rem_1fr] gap-2">
									{entry("dialCode", "+230")}
									{entry("phone", "Phone number")}
								</div>
							</fieldset>
						</div>
					</section>
					<section className={section}>
						<Heading>Where should we meet you?</Heading>
						<div className="mt-4 grid gap-4">
							{entry("pickup", "Your hotel or address")}
							{entry("meeting", "For example, the main entrance", true)}
						</div>
					</section>
					<section className={section}>
						<Heading>Anything we should know?</Heading>
						<div className="mt-4">
							<Field label={titles.needs} optional error={errors.needs}>
								<textarea
									name="needs"
									maxLength={600}
									defaultValue={traveller?.needs}
									placeholder="Share only what helps us arrange your trip."
									className={`${field} min-h-20 py-3`}
								/>
							</Field>
						</div>
						<p className={`${muted} mt-3 text-xs leading-relaxed`}>
							Preview only. Use sample details. Entries stay in this tab and
							aren’t sent.
						</p>
					</section>
					<div>
						<SectionDisclosure
							title="Other travellers"
							subtitle="Names only if needed by a partner"
							icon="people"
						>
							{entry("otherNames", "Example names", true)}
						</SectionDisclosure>
						<SectionDisclosure
							title="Emergency contact"
							subtitle="Optional"
							icon="people"
						>
							<div className="grid gap-3 tablet:grid-cols-2">
								{entry("emergencyName", "Example name", true)}
								{entry("emergencyPhone", "Example phone number", true)}
							</div>
						</SectionDisclosure>
					</div>
					<div className={`${section} flex flex-wrap justify-between gap-3`}>
						<Link
							to="/trips/single-day"
							search={{ day: plan.dayKey }}
							className={lightButton}
						>
							Back
						</Link>
						<button type="submit" className={blueButton}>
							Review my request <Icon name="next" className="size-4" />
						</button>
					</div>
					<p className={`${muted} text-right text-xs`}>
						Nothing is booked or sent.
					</p>
				</form>
			</BookingGrid>
		</>
	);
}

function zErrors(issues: { path: PropertyKey[]; message: string }[]) {
	return Object.fromEntries(
		issues.map((issue) => [issue.path[0], issue.message]),
	);
}

function ReviewRequest({
	preview,
	onAdvance,
}: {
	preview: BookingPreview;
	onAdvance: Advance;
}) {
	const { plan, traveller } = preview;
	const { total } = bookingAmounts(plan);
	const [acknowledged, setAcknowledged] = useState(preview.reviewed);
	const items: {
		id: string;
		label: string;
		cost: number;
		icon: IconName;
		note?: string;
	}[] = [
		...plan.activities.map((entry) => ({
			id: entry.id,
			label: entry.title,
			cost: entry.cost,
			icon: "sun" as const,
		})),
		{
			id: "booking-transport",
			label: "Private transport",
			cost: plan.transport,
			icon: "car",
		},
		{
			id: "booking-coordination",
			label: "Journey Forge service fee",
			cost: plan.coordination,
			icon: "people",
			note: "Planning and human coordination",
		},
	];
	return (
		<>
			<BookingHeader
				title="Every detail. No surprises."
				subtitle="Take one last look before moving to payment."
				step={2}
				back={
					<BookingBack step="traveller-details">
						Back to trip details
					</BookingBack>
				}
			/>
			<BookingGrid
				aside={
					<BookingCard plan={plan}>
						<div className={section}>
							<div className="flex flex-wrap items-center justify-between gap-2">
								<h3 className="font-semibold">Trip details</h3>
								<Link
									to="/trips/booking/$step"
									params={{ step: "traveller-details" }}
									className={textLink}
								>
									Edit details
								</Link>
							</div>
							<dl className="mt-4 grid gap-3 text-sm">
								<div className="grid grid-cols-[6.5rem_1fr] gap-2">
									<dt className={muted}>Travellers</dt>
									<dd>{plan.travellers}</dd>
								</div>
								<div className="grid grid-cols-[6.5rem_1fr] gap-2">
									<dt className={muted}>Pickup</dt>
									<dd className="wrap-anywhere">
										{traveller?.pickup || "To be decided"}
										{traveller?.meeting ? `, ${traveller.meeting}` : ""}
									</dd>
								</div>
								<div className="grid grid-cols-[6.5rem_1fr] gap-2">
									<dt className={muted}>Transport</dt>
									<dd>
										{plan.transport ? "Private transport" : "Self-arranged"}
									</dd>
								</div>
							</dl>
							<div className="mt-4">
								<SectionDisclosure title="Traveller details">
									<p className="wrap-anywhere">{traveller?.name}</p>
									<p>
										{traveller?.dialCode} {traveller?.phone}
									</p>
									{traveller?.otherNames && (
										<p className="wrap-anywhere">
											Other travellers: {traveller.otherNames}
										</p>
									)}
								</SectionDisclosure>
							</div>
						</div>
						<div className={section}>
							<h3 className="font-semibold">How it works next</h3>
							<ol className="mt-4 grid gap-4 text-sm">
								{[
									"You approve the amount",
									"We confirm the partners",
									"You receive your confirmed trip",
								].map((item, index) => (
									<li key={item} className="flex items-center gap-3">
										<span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#e9f3ff] text-ocean">
											{index + 1}
										</span>
										{item}
									</li>
								))}
							</ol>
						</div>
						<p className={`${muted} text-xs`}>
							Not booked yet. This is a preview.
						</p>
					</BookingCard>
				}
			>
				<div className="flex flex-wrap items-center justify-between gap-2">
					<Heading>Your day, item by item.</Heading>
					<p className={`${muted} text-xs`}>
						For {plan.guestCount} {plan.guestCount === 1 ? "guest" : "guests"}
					</p>
				</div>
				<dl className="mt-4 divide-y divide-[#dbeaff] border-b border-[#dbeaff] text-sm">
					{items.map(({ id, label, cost, icon, note }) => (
						<div
							key={id}
							className="flex items-center justify-between gap-3 py-4"
						>
							<dt className="flex items-center gap-3">
								<Icon name={icon} className="size-5 shrink-0 text-ocean" />
								<span>
									{label}
									{note && (
										<span className={`${muted} mt-1 block text-xs`}>
											{note}
										</span>
									)}
								</span>
							</dt>
							<dd className="shrink-0 font-semibold">
								{cost ? money(cost) : "Free"}
							</dd>
						</div>
					))}
					<div className="flex items-center justify-between gap-3 py-4">
						<dt>Optional extras</dt>
						<dd className={muted}>None selected</dd>
					</div>
				</dl>
				<div className="my-6 flex items-center justify-between gap-3">
					<p className="text-sm">Estimated total</p>
					<p className="text-3xl font-semibold tracking-tight text-ocean">
						{money(total)}
					</p>
				</div>
				<dl className="grid gap-4 rounded-xl bg-[#e9f3ff] p-4 tablet:grid-cols-2">
					<div>
						<dt className={`${muted} text-xs`}>Authorisation now</dt>
						<dd className="mt-1 font-semibold">{money(total)}</dd>
					</div>
					<div>
						<dt className={`${muted} text-xs`}>Payable on the day</dt>
						<dd className="mt-1 font-semibold">{money(0)}</dd>
					</div>
				</dl>
				<p className={`${muted} mt-3 text-xs`}>
					Illustrative payment split. This preview cannot hold or charge money.
				</p>
				<div className={`${section} mt-6`}>
					<h3 className="font-semibold">Before you continue</h3>
					<p className={`${muted} mt-2 mb-4 text-sm`}>
						Availability and final prices still need confirmation. Any increase
						needs your approval.
					</p>
					<SectionDisclosure
						title="Cancellation conditions"
						subtitle="Review the terms before making a booking."
					>
						This demo makes no booking. Cancellation conditions would be shown
						for a live request.
					</SectionDisclosure>
					<SectionDisclosure title="Service terms — preview">
						These sample screens demonstrate the request flow. They do not
						create an agreement or a booking.
					</SectionDisclosure>
				</div>
				<form
					className={section}
					onSubmit={(event) => {
						event.preventDefault();
						if (acknowledged) onAdvance("payment", { reviewed: true });
					}}
				>
					<label className="flex items-start gap-3 text-sm">
						<input
							type="checkbox"
							className="mt-0.5 size-5 shrink-0 accent-ocean"
							checked={acknowledged}
							onChange={(event) => setAcknowledged(event.target.checked)}
							required
						/>
						I’ve reviewed this sample and understand that no booking or payment
						will be made.
					</label>
					<div
						className={`${section} mt-5 flex flex-wrap items-center justify-between gap-3`}
					>
						<BookingBack step="traveller-details">
							Edit trip details
						</BookingBack>
						<button
							type="submit"
							className={blueButton}
							disabled={!acknowledged}
						>
							Continue to payment <Icon name="next" className="size-4" />
						</button>
					</div>
				</form>
			</BookingGrid>
		</>
	);
}

function Payment({
	preview,
	onAdvance,
}: {
	preview: BookingPreview;
	onAdvance: Advance;
}) {
	const { plan } = preview;
	const { total } = bookingAmounts(plan);
	const [response, setResponse] = useState<
		"approved" | "declined" | "unavailable"
	>("approved");
	const [notice, setNotice] = useState("");
	const demoField = `${field} bg-[#f5f8fc]! text-[#506582]`;

	function authorise(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (response === "declined") {
			setNotice(
				"The demo card was declined. Choose a successful response to try again.",
			);
		} else if (response === "unavailable") {
			setNotice(
				"The demo payment service is unavailable. Choose a successful response to try again.",
			);
		} else {
			onAdvance("request-received", { authorised: true, decision: "pending" });
		}
	}

	return (
		<>
			<BookingHeader
				title="One step closer to your day."
				subtitle="Preview the payment step before confirming your trip."
				step={3}
				back={
					<BookingBack step="review-request">
						Back to request review
					</BookingBack>
				}
			/>
			<BookingGrid
				aside={
					<BookingCard plan={plan}>
						<AmountSummary plan={plan} authorisation />
						<Callout title="What happens next?">
							Journey Forge would check availability and final pricing. Any
							changes need your approval.
							<p className="mt-3 w-fit rounded-full bg-[#fff5d9] px-3 py-1 text-xs text-[#634507]">
								Demo only · nothing sent
							</p>
						</Callout>
					</BookingCard>
				}
			>
				<form onSubmit={authorise} className="space-y-5">
					<div className="flex items-center justify-between gap-3">
						<Heading>Payment details</Heading>
						<p
							className={`${muted} rounded-lg border border-[#dbeaff] px-3 py-2 text-xs`}
						>
							Demo card
						</p>
					</div>
					<Callout title="A temporary hold, not a charge.">
						That’s the intended live flow. This preview cannot hold or charge
						money.
					</Callout>
					<div className="grid gap-4 tablet:grid-cols-2">
						<div className="tablet:col-span-2">
							<Field label="Name on card">
								<input className={demoField} value="Demo cardholder" readOnly />
							</Field>
						</div>
						<div className="tablet:col-span-2">
							<Field label="Card number">
								<input
									className={demoField}
									value="4242 4242 4242 4242"
									readOnly
								/>
							</Field>
						</div>
						<Field label="Expiry date">
							<input className={demoField} value="MM / YY" readOnly />
						</Field>
						<Field label="Security code">
							<input className={demoField} value="•••" readOnly />
						</Field>
					</div>
					<section className={section}>
						<h3 className="mb-4 font-semibold">Billing details</h3>
						<div className="grid gap-4 tablet:grid-cols-2">
							<Field label="Country or region">
								<input
									className={demoField}
									value="Mauritius (demo)"
									readOnly
								/>
							</Field>
							<Field label="Postal code">
								<input
									className={demoField}
									value="Sample postal code"
									readOnly
								/>
							</Field>
						</div>
						<p className={`${muted} mt-3 text-xs`}>
							Demo fields only. Real card details aren’t collected.
						</p>
					</section>
					<div>
						<button type="submit" className={`${blueButton} w-full`}>
							Preview authorisation · {money(total)}{" "}
							<Icon name="next" className="size-4" />
						</button>
						<p className={`${muted} mt-3 text-center text-xs`}>
							No payment details are collected. Nothing is sent.
						</p>
					</div>
					{notice && (
						<p role="alert" className="text-sm text-red-800">
							{notice}
						</p>
					)}
					<SectionDisclosure title="Try a payment response">
						<Field label="Demo response">
							<select
								value={response}
								className={field}
								onChange={(event) => {
									const value = event.target.value;
									if (
										value === "approved" ||
										value === "declined" ||
										value === "unavailable"
									)
										setResponse(value);
									setNotice("");
								}}
							>
								<option value="approved">Successful authorisation</option>
								<option value="declined">Card declined</option>
								<option value="unavailable">Service unavailable</option>
							</select>
						</Field>
					</SectionDisclosure>
				</form>
			</BookingGrid>
			<Link
				to="/"
				hash="help"
				className={`${textLink} mx-auto mt-6 block w-fit`}
			>
				Need a hand? Contact Journey Forge
			</Link>
		</>
	);
}

export default function BookingCheckout({
	step,
	preview,
	onAdvance,
}: {
	step: "traveller-details" | "review-request" | "payment";
	preview: BookingPreview;
	onAdvance: Advance;
}) {
	if (step === "traveller-details")
		return <TravellerDetailsPage preview={preview} onAdvance={onAdvance} />;
	if (step === "review-request")
		return <ReviewRequest preview={preview} onAdvance={onAdvance} />;
	return <Payment preview={preview} onAdvance={onAdvance} />;
}
