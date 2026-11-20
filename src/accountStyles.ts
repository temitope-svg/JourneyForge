import { z } from "zod";

export const inputStyle =
	"h-14 w-full border border-[#87968a] bg-white px-3.5 text-base caret-ocean focus-visible:outline-ocean aria-invalid:border-red-700";
export const textButton = "underline underline-offset-4 hover:text-ocean";
export const headingStyle = "leading-[1.045] font-[750] tracking-[-0.06em]";
export const accountButton =
	"group flex min-h-14 w-full items-center justify-between bg-ocean px-5 py-3 text-left text-sm font-bold text-white transition-colors hover:bg-[#0018c9]";
export const emailAddress = z
	.string()
	.trim()
	.min(1, "Enter your email address.")
	.pipe(z.email("Enter a valid email address."));
export const newPassword = z.string().min(8, "Use at least 8 characters.");
