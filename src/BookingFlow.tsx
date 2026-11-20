import { Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import BookingCheckout from "./BookingCheckout";
import { lightButton, muted } from "./BookingLayout";
import BookingStatus from "./BookingStatus";
import {
	type BookingPreview,
	type BookingStep,
	readBookingPreview,
	writeBookingPreview,
} from "./bookingPreview";

export default function BookingFlow({
	step,
	email,
}: {
	step: BookingStep;
	email: string;
}) {
	const navigate = useNavigate();
	const [preview, setPreview] = useState(() => readBookingPreview(email));
	const [notice, setNotice] = useState("");

	function advance(next: BookingStep, changes: Partial<BookingPreview>) {
		if (!preview) return;
		const updated = { ...preview, ...changes };
		if (!writeBookingPreview(email, updated)) {
			setNotice(
				"This tab couldn’t save the demo state. Enable browser storage to continue.",
			);
			return;
		}
		setPreview(updated);
		setNotice("");
		void navigate({ to: "/trips/booking/$step", params: { step: next } });
	}

	if (!preview && step !== "confirmed-trip") {
		return (
			<main className="mx-auto max-w-[100rem] p-8">
				<h1 className="text-3xl font-semibold tracking-tight">
					Choose a day first.
				</h1>
				<p className={`${muted} my-4`}>
					Open your single-day itinerary to start the booking preview.
				</p>
				<Link to="/trips/single-day" className={lightButton}>
					View single-day itinerary
				</Link>
			</main>
		);
	}

	if (preview && step !== "confirmed-trip") {
		if (step !== "traveller-details" && !preview.traveller) {
			return (
				<Navigate
					to="/trips/booking/$step"
					params={{ step: "traveller-details" }}
					replace
				/>
			);
		}
		if (
			step !== "traveller-details" &&
			step !== "review-request" &&
			!preview.reviewed
		) {
			return (
				<Navigate
					to="/trips/booking/$step"
					params={{ step: "review-request" }}
					replace
				/>
			);
		}
		if (
			(step === "request-received" ||
				step === "confirmation-progress" ||
				step === "change-approval") &&
			!preview.authorised
		) {
			return (
				<Navigate
					to="/trips/booking/$step"
					params={{ step: "payment" }}
					replace
				/>
			);
		}
	}

	return (
		<main className="mx-auto max-w-[100rem] px-4 pt-6 pb-14 tablet:px-8 tablet:pt-8">
			{notice && (
				<p
					role="alert"
					className="mb-5 rounded-lg bg-[#fff3d9] p-4 text-sm text-[#634507]"
				>
					{notice}
				</p>
			)}
			{step === "traveller-details" ||
			step === "review-request" ||
			step === "payment" ? (
				preview && (
					<BookingCheckout step={step} preview={preview} onAdvance={advance} />
				)
			) : (
				<BookingStatus step={step} preview={preview} onAdvance={advance} />
			)}
		</main>
	);
}
