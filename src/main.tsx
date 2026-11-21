import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createRootRoute,
	createRoute,
	createRouter,
	notFound,
	Outlet,
	RouterProvider,
	redirect,
} from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import dashboardData from "../backend/dashboard.json";
import Account from "./Account.tsx";
import {
	PasswordRecovery,
	PasswordResetSuccess,
	RecoveryEmailSent,
	ResetPassword,
	VerifyEmail,
} from "./AccountFlow";
import App from "./App.tsx";
import { bookingSteps } from "./bookingPreview";
import Dashboard from "./Dashboard";
import { getDemoSession } from "./demoAuth";
import Onboarding, { steps } from "./Onboarding";
import { profileTabs } from "./profileModel";
import type { SampleRequest } from "./sampleTrips";
import { tripSetupSteps } from "./tripDraft";
import { reviewSteps } from "./tripReviewModel";
import "./index.css";

const rootRoute = createRootRoute({ component: Outlet });
const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: App,
});

const signInRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/sign-in",
	component: () => <Account mode="sign-in" />,
});

const createAccountRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/create-account",
	component: () => <Account mode="create-account" />,
});

const verifyEmailRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/verify-email",
	component: VerifyEmail,
});

const passwordRecoveryRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/password-recovery",
	component: PasswordRecovery,
});

const recoveryEmailSentRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/recovery-email-sent",
	component: RecoveryEmailSent,
});

const resetPasswordRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/reset-password",
	component: ResetPassword,
});

const passwordResetSuccessRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/password-reset-success",
	component: PasswordResetSuccess,
});

const onboardingRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/onboarding/$step",
	loader: ({ params }) => {
		const step = steps.find((item) => item === params.step);
		if (!step) throw notFound();
		return step;
	},
	component: OnboardingRoute,
});

function OnboardingRoute() {
	const step = onboardingRoute.useLoaderData();
	return <Onboarding step={step} />;
}

const dashboardRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/dashboard",
	beforeLoad: () => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
	},
	component: Dashboard,
});

const exploreRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/explore",
	beforeLoad: () => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
	},
	component: () => <Dashboard exploring />,
});

const experienceRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/experiences/$experienceId",
	beforeLoad: () => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
	},
	loader: ({ params }) => {
		const experience = dashboardData.experiences.find(
			(entry) => entry.id === params.experienceId,
		);
		if (!experience) throw notFound();
		return experience;
	},
	component: ExperienceRoute,
});

function ExperienceRoute() {
	const experience = experienceRoute.useLoaderData();
	return <Dashboard detail={experience} />;
}

const savedRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/saved",
	beforeLoad: () => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
	},
	component: () => <Dashboard savedTab="experiences" />,
});

const savedPlansRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/saved/plans",
	beforeLoad: () => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
	},
	component: () => <Dashboard savedTab="plans" />,
});

const tripsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/trips",
	validateSearch: (search: Record<string, unknown>): { view?: "sample" } =>
		search.view === "sample" ? { view: "sample" } : {},
	beforeLoad: () => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
	},
	component: MyTripsRoute,
});

function MyTripsRoute() {
	const { view } = tripsRoute.useSearch();
	return <Dashboard key={view ?? "default"} tripsView={view ?? "default"} />;
}

const tripPlannerRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/trips/plan",
	beforeLoad: () => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
	},
	component: () => <Dashboard planning />,
});

const tripSetupRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/trips/setup/$step",
	beforeLoad: ({ params }) => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
		const step = tripSetupSteps.find((item) => item === params.step);
		if (!step) throw notFound();
		return { tripSetupStep: step };
	},
	component: TripSetupRoute,
});

function TripSetupRoute() {
	const { tripSetupStep } = tripSetupRoute.useRouteContext();
	return <Dashboard setupStep={tripSetupStep} />;
}

const generatingRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/trips/generating",
	beforeLoad: () => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
	},
	component: () => <Dashboard planStage="generating" />,
});

const planReadyRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/trips/ready",
	beforeLoad: () => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
	},
	component: () => <Dashboard planStage="ready" />,
});

function validateItinerarySearch(search: Record<string, unknown>): {
	day?: string;
} {
	return { day: typeof search.day === "string" ? search.day : undefined };
}

const tripItineraryRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/trips/itinerary",
	validateSearch: validateItinerarySearch,
	beforeLoad: () => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
	},
	component: MultiDayRoute,
});

function MultiDayRoute() {
	const { day } = tripItineraryRoute.useSearch();
	return <Dashboard planStage="itinerary" selectedDay={day} />;
}

const singleDayRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/trips/single-day",
	validateSearch: validateItinerarySearch,
	beforeLoad: () => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
	},
	component: SingleDayRoute,
});

function SingleDayRoute() {
	const { day } = singleDayRoute.useSearch();
	return <Dashboard planStage="single-day" selectedDay={day} />;
}

const bookingRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/trips/booking/$step",
	validateSearch: (
		search: Record<string, unknown>,
	): { sample?: SampleRequest; meeting?: "pickup" } => {
		const { sample, meeting } = search;
		return {
			sample:
				sample === "sunset" || sample === "market" || sample === "checkout"
					? sample
					: undefined,
			meeting: meeting === "pickup" ? meeting : undefined,
		};
	},
	beforeLoad: ({ params }) => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
		const step = bookingSteps.find((item) => item === params.step);
		if (!step) throw notFound();
		return { bookingStep: step };
	},
	component: BookingRoute,
});

function BookingRoute() {
	const { bookingStep } = bookingRoute.useRouteContext();
	const { sample, meeting } = bookingRoute.useSearch();
	const isSampleStage =
		bookingStep === "confirmation-progress" ||
		bookingStep === "change-approval";
	return (
		<Dashboard
			bookingStep={bookingStep}
			bookingSample={
				isSampleStage || sample === "checkout" ? sample : undefined
			}
			bookingMeeting={bookingStep === "today" ? meeting : undefined}
		/>
	);
}

const tripReviewRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/trips/review/$step",
	beforeLoad: ({ params }) => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
		const step = reviewSteps.find((item) => item === params.step);
		if (!step) throw notFound();
		return { reviewStep: step };
	},
	component: TripReviewRoute,
});

function TripReviewRoute() {
	const { reviewStep } = tripReviewRoute.useRouteContext();
	return <Dashboard reviewStep={reviewStep} />;
}

const profileIndexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/profile",
	beforeLoad: () => {
		throw redirect({ to: "/profile/$tab", params: { tab: "personal" } });
	},
});

const profileRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/profile/$tab",
	beforeLoad: ({ params }) => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
		const tab = profileTabs.find((item) => item === params.tab);
		if (!tab) throw notFound();
		return { profileTab: tab };
	},
	component: ProfileRoute,
});

function ProfileRoute() {
	const { profileTab } = profileRoute.useRouteContext();
	return <Dashboard profileTab={profileTab} />;
}

const notificationsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/notifications",
	beforeLoad: () => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
	},
	component: () => <Dashboard notificationView="all" />,
});

const unreadNotificationsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/notifications/unread",
	beforeLoad: () => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
	},
	component: () => <Dashboard notificationView="unread" />,
});

const router = createRouter({
	routeTree: rootRoute.addChildren([
		indexRoute,
		signInRoute,
		createAccountRoute,
		verifyEmailRoute,
		passwordRecoveryRoute,
		recoveryEmailSentRoute,
		resetPasswordRoute,
		passwordResetSuccessRoute,
		onboardingRoute,
		dashboardRoute,
		exploreRoute,
		experienceRoute,
		savedRoute,
		savedPlansRoute,
		tripsRoute,
		tripPlannerRoute,
		tripSetupRoute,
		generatingRoute,
		planReadyRoute,
		tripItineraryRoute,
		singleDayRoute,
		bookingRoute,
		tripReviewRoute,
		profileIndexRoute,
		profileRoute,
		notificationsRoute,
		unreadNotificationsRoute,
	]),
	scrollRestoration: true,
});
const queryClient = new QueryClient();

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const root = document.getElementById("root");
if (!root) {
	throw new Error("Missing root element");
}

createRoot(root).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</StrictMode>,
);
