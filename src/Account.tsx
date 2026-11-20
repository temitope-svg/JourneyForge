import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useRef, useState } from "react";
import { z } from "zod";
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

import { demoPassword, registerDemoAccount, signInToDemo } from "./demoAuth";

const credentials = z.object({
	email: emailAddress,
	password: z.string().min(1, "Enter your password."),
	terms: z.boolean().optional(),
});

const registration = credentials.extend({
	password: newPassword,
	terms: z
		.boolean()
		.refine((agreed) => agreed, "Agree to the Terms of service to continue."),
});

export default function Account({
	mode,
}: {
	mode: "sign-in" | "create-account";
}) {
	const navigate = useNavigate();
	const email = useLocation({
		select: (location) => location.state.previewEmail,
	});
	const creating = mode === "create-account";
	const submitLabel = creating ? "Create my account" : "Sign in";
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<{
		email?: string;
		password?: string;
		terms?: string;
	}>({});
	const [notice, setNotice] = useState("");
	const emailRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);
	const termsRef = useRef<HTMLInputElement>(null);

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setNotice("");
		const form = event.currentTarget;
		const values = new FormData(form);
		const result = (creating ? registration : credentials).safeParse({
			email: values.get("email"),
			password: values.get("password"),
			terms: values.has("terms"),
		});

		if (!result.success) {
			const fields = z.flattenError(result.error).fieldErrors;
			setErrors({
				email: fields.email?.[0],
				password: fields.password?.[0],
				terms: fields.terms?.[0],
			});
			(fields.email
				? emailRef
				: fields.password
					? passwordRef
					: termsRef
			).current?.focus();
			return;
		}

		setErrors({});
		const { email, password } = result.data;

		try {
			if (creating) {
				if (!registerDemoAccount(email)) {
					setErrors({
						email:
							"This demo email is already registered. Sign in with it instead.",
					});
					emailRef.current?.focus();
					return;
				}
				void navigate({ to: "/verify-email", state: { previewEmail: email } });
				return;
			}

			const status = signInToDemo(email, password);
			if (status === "pending") {
				void navigate({ to: "/verify-email", state: { previewEmail: email } });
			} else if (status === "signed-in") {
				void navigate({ to: "/dashboard", replace: true });
			} else {
				setNotice(
					"Use a verified demo email from this browser and the demo password shown above.",
				);
			}
		} catch {
			setNotice(
				"Browser storage is unavailable. Enable it to use demo accounts.",
			);
		}
	}

	return (
		<AccountLayout>
			<nav
				className="flex items-center gap-6 border-b border-ink/20 text-sm font-medium"
				aria-label="Account"
			>
				<Link
					to="/sign-in"
					className="-mb-px border-b-[3px] border-transparent pb-3 hover:text-ocean aria-[current=page]:border-ocean aria-[current=page]:text-ocean"
				>
					Sign in
				</Link>
				<Link
					to="/create-account"
					className="-mb-px border-b-[3px] border-transparent pb-3 hover:text-ocean aria-[current=page]:border-ocean aria-[current=page]:text-ocean"
				>
					Create an account
				</Link>
			</nav>
			<h1
				className={`${headingStyle} mt-9 text-[clamp(2.55rem,6vw,3.8rem)] text-ocean desktop:text-[clamp(2.65rem,4.5vw,4.25rem)]`}
			>
				{creating ? "Make room for good days." : "Your next story starts here."}
			</h1>
			<p className="mt-5 text-[0.94rem] leading-relaxed text-ink/75">
				{creating
					? "Save the ideas you love. Make them your next adventure."
					: "Welcome back. Pick up where you left off."}
			</p>

			<p className="mt-4 border-l-2 border-ocean pl-3 text-sm leading-relaxed text-ink/80">
				{creating
					? "Demo account. Use a test email and a throwaway password. To sign in later, use "
					: "Sign in with your demo email and the shared password "}
				<code className="font-semibold text-ink">{demoPassword}</code>.
			</p>

			<form className="mt-8" method="post" onSubmit={submit} noValidate>
				<label
					className="mb-2 block text-sm font-semibold"
					htmlFor="sign-in-email"
				>
					Email address
				</label>
				<input
					ref={emailRef}
					className={inputStyle}
					id="sign-in-email"
					name="email"
					defaultValue={creating ? email : undefined}
					type="email"
					autoComplete="username"
					required
					aria-invalid={Boolean(errors.email)}
					aria-describedby={errors.email ? "sign-in-email-error" : undefined}
				/>
				{errors.email && (
					<p
						id="sign-in-email-error"
						role="alert"
						className="mt-2 text-sm text-red-800"
					>
						{errors.email}
					</p>
				)}

				<label
					className="mt-5 mb-2 block text-sm font-semibold"
					htmlFor="sign-in-password"
				>
					Password
				</label>
				<div className="relative">
					<input
						ref={passwordRef}
						className={`${inputStyle} pr-20`}
						id="sign-in-password"
						name="password"
						type={showPassword ? "text" : "password"}
						autoComplete={creating ? "new-password" : "current-password"}
						required
						aria-invalid={Boolean(errors.password)}
						aria-describedby={
							errors.password
								? "sign-in-password-error"
								: creating
									? "password-hint"
									: undefined
						}
					/>
					<button
						type="button"
						className="absolute inset-y-0 right-0 px-4 text-sm font-semibold text-ocean hover:underline focus-visible:-outline-offset-4"
						aria-controls="sign-in-password"
						onClick={() => setShowPassword(!showPassword)}
					>
						{showPassword ? "Hide" : "Show"}
						<span className="sr-only"> password</span>
					</button>
				</div>
				{errors.password && (
					<p
						id="sign-in-password-error"
						role="alert"
						className="mt-2 text-sm text-red-800"
					>
						{errors.password}
					</p>
				)}
				{creating ? (
					<>
						<p id="password-hint" className="mt-2.5 text-xs text-ink/75">
							At least 8 characters.
						</p>
						<div className="mt-6 flex items-center gap-3 text-sm text-ink/80">
							<input
								ref={termsRef}
								id="account-terms"
								name="terms"
								type="checkbox"
								required
								aria-invalid={Boolean(errors.terms)}
								aria-describedby={
									errors.terms ? "account-terms-error" : undefined
								}
								className="size-[1.125rem] shrink-0 accent-ocean"
							/>
							<div>
								<label htmlFor="account-terms">I agree to the</label>{" "}
								<button
									type="button"
									className={textButton}
									onClick={() =>
										setNotice(
											"Terms of service are unavailable in this preview.",
										)
									}
								>
									Terms of service
								</button>
								.
							</div>
						</div>
						{errors.terms && (
							<p
								id="account-terms-error"
								role="alert"
								className="mt-2 text-sm text-red-800"
							>
								{errors.terms}
							</p>
						)}
					</>
				) : (
					<div className="mt-5 text-right">
						<Link
							to="/password-recovery"
							className={`${textButton} text-sm text-ink/80`}
						>
							Forgot password?
						</Link>
					</div>
				)}
				<button
					type="submit"
					className={`${accountButton} ${creating ? "mt-6" : "mt-9"}`}
				>
					{submitLabel} <Arrow />
				</button>
			</form>

			<p
				role="status"
				className={
					notice ? "mt-4 border border-ink/20 bg-white p-3 text-sm" : "sr-only"
				}
			>
				{notice}
			</p>
			<div className="my-6 flex items-center gap-4 text-xs text-ink/75 before:h-px before:flex-1 before:bg-ink/20 after:h-px after:flex-1 after:bg-ink/20">
				or
			</div>
			<button
				type="button"
				className="flex min-h-14 w-full items-center justify-center gap-2.5 border border-[#87968a] bg-white px-4 py-3 text-[0.94rem] font-medium transition-colors hover:bg-ink/5"
				onClick={() =>
					setNotice("Google sign-in is unavailable in this preview.")
				}
			>
				<img src="/account/google.png" width="24" height="24" alt="" />
				Continue with Google
			</button>
			<p className="mt-7 text-center text-[0.83rem] leading-relaxed">
				Just looking around?{" "}
				<Link
					to="/"
					hash="destinations"
					className="text-ocean underline underline-offset-4"
				>
					Explore without an account
				</Link>
			</p>
		</AccountLayout>
	);
}
