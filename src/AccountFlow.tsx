import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { type FormEvent, type ReactNode, useRef, useState } from "react";
import AccountLayout from "./AccountLayout";
import { Arrow } from "./Arrow";
import {
	accountButton,
	emailAddress,
	headingStyle,
	inputStyle,
	newPassword,
	textButton,
} from "./accountStyles";

import { verifyDemoAccount } from "./demoAuth";

declare module "@tanstack/react-router" {
	interface HistoryState {
		previewEmail?: string;
	}
}

const secondaryLink = `${textButton} text-sm text-ink/80`;

const resetLinkStates = {
	expired: {
		title: ["That link has", "had its day."],
		description:
			"Your reset link has expired. Request a new one to keep going.",
		label: "Expired",
	},
	invalid: {
		title: ["Let’s try", "another link."],
		description: "We can’t verify this reset link. Request a new one below.",
		label: "Invalid",
	},
	used: {
		title: ["One link.", "One fresh start."],
		description:
			"This reset link has already been used. Sign in, or request another link.",
		label: "Already used",
	},
} as const;

export type ResetLinkState = keyof typeof resetLinkStates;

export function validateResetSearch(search: Record<string, unknown>): {
	status?: ResetLinkState;
} {
	const { status } = search;
	if (status === undefined) return {};
	return {
		status: status === "expired" || status === "used" ? status : "invalid",
	};
}

function Heading({
	children,
	description,
}: {
	children: ReactNode;
	description: string;
}) {
	return (
		<>
			<h1
				className={`${headingStyle} text-[clamp(2.55rem,6vw,3.8rem)] text-ocean desktop:text-[clamp(2.65rem,4.5vw,4.25rem)]`}
			>
				{children}
			</h1>
			<p className="mt-5 text-[0.94rem] leading-relaxed text-ink/75">
				{description}
			</p>
		</>
	);
}

function BackToSignIn() {
	return (
		<Link to="/sign-in" className={`${secondaryLink} mt-8 inline-block`}>
			Back to sign in
		</Link>
	);
}

function PreviewNotice({ children }: { children: ReactNode }) {
	return (
		<p className="border-l-2 border-[#906b24] bg-[#fff3cf] px-4 py-3.5 text-sm leading-relaxed">
			{children}
		</p>
	);
}

function EmailSummary({
	email,
	children,
}: {
	email?: string;
	children?: ReactNode;
}) {
	return (
		<div className="my-7 border-y border-ink/20 py-5">
			<p className="mb-3 text-xs text-ink/75">Email address</p>
			<div className="flex items-center justify-between gap-4">
				<p className="min-w-0 text-base font-semibold wrap-anywhere">
					{email ??
						(children ? "Add your email address" : "No address entered")}
				</p>
				{children}
			</div>
		</div>
	);
}

export function VerifyEmail() {
	const email = useLocation({
		select: (location) => location.state.previewEmail,
	});
	const [notice, setNotice] = useState("");
	const navigate = useNavigate();

	function verify() {
		if (!email) return;
		try {
			if (!verifyDemoAccount(email)) {
				setNotice(
					"This demo account is unavailable in this browser. Create the account again to continue.",
				);
				return;
			}
			void navigate({
				to: "/onboarding/$step",
				params: { step: "interests" },
				replace: true,
			});
		} catch {
			setNotice(
				"Browser storage is unavailable. Enable it to verify your demo account.",
			);
		}
	}
	return (
		<AccountLayout flow>
			<Heading description="Verify your email to keep your plans close.">
				A quick check.
				<br />
				Then adventure.
			</Heading>
			<EmailSummary email={email}>
				<Link
					to="/create-account"
					state={{ previewEmail: email }}
					className="shrink-0 text-sm font-semibold text-ocean underline underline-offset-4"
				>
					{email ? "Edit email" : "Add email"}
				</Link>
			</EmailSummary>
			<p className="mb-5 text-sm leading-relaxed text-ink/80">
				Confirm your email below to simulate verification and continue to setup.
			</p>
			<button
				type="button"
				disabled={!email}
				onClick={verify}
				className={`${accountButton} disabled:cursor-not-allowed disabled:bg-[#c8d0c9] disabled:text-ink/75`}
			>
				I’ve verified my email <Arrow />
			</button>
			<div className="mt-6 flex justify-between gap-4 border-b border-ink/20 pb-7 text-sm text-ink/80">
				<p>Verification is simulated in this demo.</p>
				<button
					type="button"
					className="shrink-0 hover:underline disabled:cursor-not-allowed disabled:opacity-70"
					disabled={!email}
					onClick={() =>
						setNotice(
							"Email delivery is unavailable in this preview. No verification email was sent.",
						)
					}
				>
					Resend email
				</button>
			</div>
			{email && (
				<p className="mt-5 text-sm leading-relaxed text-ink/80" role="status">
					{notice ||
						"Email delivery is unavailable in this preview. No verification email was sent."}
				</p>
			)}
			<BackToSignIn />
		</AccountLayout>
	);
}

export function PasswordRecovery() {
	const email = useLocation({
		select: (location) => location.state.previewEmail,
	});
	const navigate = useNavigate();
	const input = useRef<HTMLInputElement>(null);
	const [error, setError] = useState("");

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const result = emailAddress.safeParse(
			new FormData(event.currentTarget).get("email"),
		);
		if (!result.success) {
			setError(result.error.issues[0].message);
			input.current?.focus();
			return;
		}
		void navigate({
			to: "/recovery-email-sent",
			state: { previewEmail: result.data },
		});
	}

	return (
		<AccountLayout flow center>
			<Heading description="Enter your email to request a password reset link.">
				Let’s get you
				<br />
				back in.
			</Heading>
			<form className="mt-8" method="post" noValidate onSubmit={submit}>
				<label
					htmlFor="recovery-email"
					className="mb-2 block text-sm font-semibold"
				>
					Email address
				</label>
				<input
					ref={input}
					id="recovery-email"
					name="email"
					type="email"
					autoComplete="email"
					defaultValue={email}
					className={inputStyle}
					required
					aria-invalid={Boolean(error)}
					aria-describedby={error ? "recovery-error" : undefined}
				/>
				{error && (
					<p
						id="recovery-error"
						role="alert"
						className="mt-2 text-sm text-red-800"
					>
						{error}
					</p>
				)}
				<button type="submit" className={`${accountButton} mt-6`}>
					Send reset link <Arrow />
				</button>
			</form>
			<BackToSignIn />
		</AccountLayout>
	);
}

export function RecoveryEmailSent() {
	const email = useLocation({
		select: (location) => location.state.previewEmail,
	});
	const [notice, setNotice] = useState("");
	return (
		<AccountLayout flow>
			<Heading description="If an account matches that email, you’ll receive a password reset link.">
				Check your
				<br />
				inbox.
			</Heading>
			<EmailSummary email={email} />
			<p className="mb-5 text-sm leading-relaxed text-ink/80">
				Check your spam folder too. If nothing arrives, check the address or try
				again.
			</p>
			<PreviewNotice>
				Email delivery isn’t connected in this prototype. No reset email was
				sent.
			</PreviewNotice>
			<Link to="/reset-password" className={`${accountButton} mt-6`}>
				Preview the reset form <Arrow />
			</Link>
			<nav
				aria-label="Reset link previews"
				className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
			>
				<span className="text-ink/75">Preview link states</span>
				{(Object.keys(resetLinkStates) as ResetLinkState[]).map((status) => (
					<Link
						key={status}
						to="/reset-password"
						search={{ status }}
						state={{ previewEmail: email }}
						className={secondaryLink}
					>
						{resetLinkStates[status].label}
					</Link>
				))}
			</nav>
			<div className="mt-5 flex justify-between gap-4 border-b border-ink/20 pb-6 text-sm">
				<Link
					to="/password-recovery"
					className="text-ocean underline underline-offset-4"
				>
					Use another email
				</Link>
				<button
					type="button"
					className="text-ink/80 hover:underline disabled:cursor-not-allowed disabled:opacity-70"
					disabled={!email}
					onClick={() =>
						setNotice("Resend preview complete. No reset email was sent.")
					}
				>
					Resend link
				</button>
			</div>
			{notice && (
				<p className="mt-4 text-sm" role="status">
					{notice}
				</p>
			)}
			<BackToSignIn />
		</AccountLayout>
	);
}

function ResetField({
	id,
	label,
	inputRef,
	error,
	hint,
}: {
	id: string;
	label: string;
	inputRef: React.RefObject<HTMLInputElement | null>;
	error?: string;
	hint?: string;
}) {
	const [visible, setVisible] = useState(false);
	return (
		<div>
			<label htmlFor={id} className="mb-2 block text-sm font-semibold">
				{label}
			</label>
			<div className="relative">
				<input
					ref={inputRef}
					id={id}
					name={id}
					type={visible ? "text" : "password"}
					autoComplete="new-password"
					className={`${inputStyle} pr-20`}
					required
					aria-invalid={Boolean(error)}
					aria-describedby={
						error ? `${id}-error` : hint ? `${id}-hint` : undefined
					}
				/>
				<button
					type="button"
					aria-controls={id}
					className="absolute inset-y-0 right-0 px-4 text-sm font-semibold text-ocean hover:underline focus-visible:-outline-offset-4"
					onClick={() => setVisible(!visible)}
				>
					{visible ? "Hide" : "Show"}
					<span className="sr-only"> {label.toLowerCase()}</span>
				</button>
			</div>
			{error ? (
				<p
					id={`${id}-error`}
					role="alert"
					className="mt-2 text-sm text-red-800"
				>
					{error}
				</p>
			) : (
				hint && (
					<p id={`${id}-hint`} className="mt-2.5 text-xs text-ink/75">
						{hint}
					</p>
				)
			)}
		</div>
	);
}

export function ResetPassword({ status }: { status?: ResetLinkState }) {
	const email = useLocation({
		select: (location) => location.state.previewEmail,
	});
	if (!status) return <ResetPasswordForm />;

	const { title, description } = resetLinkStates[status];
	return (
		<AccountLayout flow center>
			<Heading description={description}>
				{title[0]}
				<br />
				{title[1]}
			</Heading>
			<Link
				to="/password-recovery"
				state={{ previewEmail: email }}
				className={`${accountButton} mt-7`}
			>
				Request a new link <Arrow />
			</Link>
			<BackToSignIn />
		</AccountLayout>
	);
}

function ResetPasswordForm() {
	const navigate = useNavigate();
	const password = useRef<HTMLInputElement>(null);
	const confirmation = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<{
		password?: string;
		confirmation?: string;
	}>({});

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const values = new FormData(event.currentTarget);
		const result = newPassword.safeParse(values.get("new-password"));
		if (!result.success) {
			setError({ password: result.error.issues[0].message });
			password.current?.focus();
			return;
		}
		if (result.data !== values.get("confirm-password")) {
			setError({ confirmation: "Passwords must match." });
			confirmation.current?.focus();
			return;
		}
		void navigate({ to: "/password-reset-success", replace: true });
	}

	return (
		<AccountLayout flow>
			<Heading description="Choose a new password to get back to your plans.">
				A fresh start.
				<br />
				Make it yours.
			</Heading>
			<form
				className="mt-8 space-y-5"
				method="post"
				noValidate
				onSubmit={submit}
			>
				<ResetField
					id="new-password"
					label="New password"
					inputRef={password}
					error={error.password}
					hint="At least 8 characters."
				/>
				<ResetField
					id="confirm-password"
					label="Confirm new password"
					inputRef={confirmation}
					error={error.confirmation}
				/>
				<button type="submit" className={accountButton}>
					Reset password <Arrow />
				</button>
			</form>
			<p className="mt-6 text-sm text-ink/80">
				Preview only. No password will be changed.
			</p>
			<BackToSignIn />
		</AccountLayout>
	);
}

export function PasswordResetSuccess() {
	return (
		<AccountLayout flow center>
			<Heading description="Password reset preview complete.">
				Ready for your
				<br />
				next chapter.
			</Heading>
			<div className="my-6">
				<PreviewNotice>
					No password was changed. Account recovery isn’t connected in this
					prototype.
				</PreviewNotice>
			</div>
			<Link to="/sign-in" className={accountButton}>
				Sign in <Arrow />
			</Link>
		</AccountLayout>
	);
}
