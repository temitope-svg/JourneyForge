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
	validateResetSearch,
} from "./AccountFlow";
import App from "./App.tsx";
import { bookingSteps } from "./bookingPreview";
import Dashboard from "./Dashboard";
import { getDemoSession } from "./demoAuth";
import HowItWorks from "./HowItWorks";
import NotFoundPage from "./NotFoundPage";
import Onboarding, { steps } from "./Onboarding";
import PublicPages from "./PublicPages";
import { profileTabs } from "./profileModel";
import { OfflineSavedExample } from "./SharedStates";
import StatusPage from "./StatusPages";
import { findPaymentSample, type SampleRequest } from "./sampleTrips";
import { tripSetupSteps } from "./tripDraft";
import { reviewSteps } from "./tripReviewModel";
import UnavailablePage from "./UnavailablePage";
import "./index.css";

const rootRoute = createRootRoute({
	component: Outlet,
	notFoundComponent: NotFoundPage,
});
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
	validateSearch: validateResetSearch,
	component: ResetPasswordRoute,
});

function ResetPasswordRoute() {
	const { status } = resetPasswordRoute.useSearch();
	return <ResetPassword status={status} />;
}

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
	validateSearch: (search: Record<string, unknown>): { view?: "today" } =>
		search.view === "today" ? { view: "today" } : {},
	beforeLoad: () => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
	},
	component: DashboardHome,
});

function DashboardHome() {
	const { view } = dashboardRoute.useSearch();
	return <Dashboard dashboardView={view} />;
}

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
					: findPaymentSample(sample)?.id,
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
				isSampleStage || sample === "checkout" || findPaymentSample(sample)
					? sample
					: undefined
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

function validateNotificationSearch(search: Record<string, unknown>): {
	preview?: "empty";
} {
	return search.preview === "empty" ? { preview: "empty" } : {};
}

const notificationsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/notifications",
	validateSearch: validateNotificationSearch,
	beforeLoad: () => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
	},
	component: NotificationsRoute,
});

const unreadNotificationsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/notifications/unread",
	validateSearch: validateNotificationSearch,
	beforeLoad: () => {
		if (!getDemoSession()) throw redirect({ to: "/sign-in" });
	},
	component: UnreadNotificationsRoute,
});

function NotificationsRoute() {
	const { preview } = notificationsRoute.useSearch();
	return (
		<Dashboard
			notificationView="all"
			emptyNotificationPreview={preview === "empty"}
		/>
	);
}

function UnreadNotificationsRoute() {
	const { preview } = unreadNotificationsRoute.useSearch();
	return (
		<Dashboard
			notificationView="unread"
			emptyNotificationPreview={preview === "empty"}
		/>
	);
}

const howItWorksRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/how-it-works",
	component: HowItWorks,
});

const helpRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/help",
	component: () => <PublicPages page="help" />,
});

const aboutRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/about",
	component: () => <PublicPages page="about" />,
});

const contactRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/contact",
	component: () => <PublicPages page="contact" />,
});

const safetyRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/safety",
	component: () => <PublicPages page="safety" />,
});

const cancellationsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/cancellations",
	component: () => <PublicPages page="cancellations" />,
});

const accessibilityRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/accessibility",
	component: () => <PublicPages page="accessibility" />,
});

const privacyRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/privacy",
	component: () => <PublicPages page="privacy" />,
});

const termsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/terms",
	component: () => <PublicPages page="terms" />,
});

const unavailableRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/unavailable",
	component: UnavailablePage,
});

const maintenanceRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/maintenance",
	component: () => <StatusPage status="maintenance" />,
});

const expiredSharedLinkRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/expired-shared-link",
	component: () => <StatusPage status="expired" />,
});

const offlineRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/offline",
	component: () => <StatusPage status="offline" />,
});

const offlineSavedExampleRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/offline/saved-example",
	component: OfflineSavedExample,
});

const accessDeniedRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/access-denied",
	component: () => <StatusPage status="denied" />,
});

const router = createRouter({
	routeTree: rootRoute.addChildren([
		indexRoute,
		unavailableRoute,
		maintenanceRoute,
		expiredSharedLinkRoute,
		offlineRoute,
		offlineSavedExampleRoute,
		accessDeniedRoute,
		howItWorksRoute,
		helpRoute,
		aboutRoute,
		contactRoute,
		safetyRoute,
		cancellationsRoute,
		termsRoute,
		privacyRoute,
		accessibilityRoute,
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
