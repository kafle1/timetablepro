// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				id: string;
				email: string;
				name: string;
				role: 'admin' | 'teacher' | 'student';
			} | null;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

declare module '$env/static/private' {
	export const APPWRITE_PROJECT_ID: string;
	export const APPWRITE_API_KEY: string;
}

declare module '$env/static/public' {
	export const PUBLIC_APPWRITE_PROJECT_ID: string;
}

export {};
