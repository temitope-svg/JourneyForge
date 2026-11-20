export const demoPassword = "journey-demo";
const sessionKey = "journey-forge:demo-session";

function accountKey(email: string) {
	return `journey-forge:demo-account:${email.toLowerCase()}`;
}

export function registerDemoAccount(email: string) {
	const key = accountKey(email);
	if (localStorage.getItem(key) === "verified") return false;
	localStorage.setItem(key, "pending");
	return true;
}

export function verifyDemoAccount(email: string) {
	const key = accountKey(email);
	const status = localStorage.getItem(key);
	if (status !== "pending" && status !== "verified") return false;

	localStorage.setItem(key, "verified");
	sessionStorage.setItem(sessionKey, email.toLowerCase());
	return true;
}

export function signInToDemo(email: string, password: string) {
	const status = localStorage.getItem(accountKey(email));
	if (password !== demoPassword) return "invalid";
	if (status === "pending") return "pending";
	if (status !== "verified") return "invalid";

	sessionStorage.setItem(sessionKey, email.toLowerCase());
	return "signed-in";
}

export function getDemoSession() {
	try {
		return sessionStorage.getItem(sessionKey);
	} catch {
		return null;
	}
}

export function signOutOfDemo() {
	sessionStorage.removeItem(sessionKey);
}
