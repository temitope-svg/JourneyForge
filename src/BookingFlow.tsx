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
import ChangeTrip from "./ChangeTrip";
import {
	findPaymentSample,
	type SampleRequest,
	sampleBooking,
	sampleBookingAccount,
} from "./sampleTrips";
import TravelDay from "./TravelDay";

export default function BookingFlow({
	step,
	email,
	sample,
	meeting,
}: {
	step: BookingStep;
	email: string;
	sample?: SampleRequest;
	meeting?: "pickup";
}) {
	const navigate = useNavigate();
	const storageAccount = sample ? sampleBookingAccount(email, sample) : email;
	const [preview, setPreview] = useState(
		() =>
			readBookingPreview(storageAccount) ??
			(sample ? sampleBooking(sample) : undefined),
	);
	const [notice, setNotice] = useState("");

	function advance(next: BookingStep, changes: Partial<BookingPreview>) {
		if (!preview) return;
		const updated = { ...preview, ...changes };
		if (!writeBookingPreview(storageAccount, updated)) {
			setNotice(
				"This tab couldn’t save the demo state. Enable browser storage to continue.",
			);
			return;
		}
		setPreview(updated);
		setNotice("");
		void navigate({
			to: "/trips/booking/$step",
			params: { step: next },
			search: { sample },
		});
	}

	if (step === "change-trip" || step === "cancel-trip")
		return <ChangeTrip email={email} cancel={step === "cancel-trip"} />;
	if (step === "today" || step === "trip-update" || step === "trip-help")
		return <TravelDay step={step} email={email} meeting={meeting} />;

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

	if (
		(!sample || sample === "checkout" || findPaymentSample(sample)) &&
		preview &&
		step !== "confirmed-trip"
	) {
		if (step !== "traveller-details" && !preview.traveller) {
			return (
				<Navigate
					to="/trips/booking/$step"
					params={{ step: "traveller-details" }}
					search={{ sample }}
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
					search={{ sample }}
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
					search={{ sample }}
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
					<BookingCheckout
						step={step}
						preview={preview}
						onAdvance={advance}
						sample={sample}
					/>
				)
			) : (
				<BookingStatus
					step={step}
					preview={preview}
					onAdvance={advance}
					sample={sample}
				/>
			)}
		</main>
	);
}
