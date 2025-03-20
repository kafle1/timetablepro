// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { User } from '$lib/types';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User | null;
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
