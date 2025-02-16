import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === "none" ? "" : style.transform;

	const scaleConversion = (
		valueA: number,
		scaleA: [number, number],
		scaleB: [number, number]
	) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (
		style: Record<string, number | string | undefined>
	): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, "");
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}).format(date);
}

export function formatTime(date: Date): string {
	return new Intl.DateTimeFormat('en-US', {
		hour: 'numeric',
		minute: 'numeric',
		hour12: true
	}).format(date);
}

export function formatDateTime(date: Date): string {
	return `${formatDate(date)} at ${formatTime(date)}`;
}

export function getInitials(name: string): string {
	return name
		.split(' ')
		.map(word => word[0])
		.join('')
		.toUpperCase();
}

export function generateTimeSlots(
	startHour: number,
	endHour: number,
	duration: number
): string[] {
	const slots: string[] = [];
	let currentHour = startHour;
	let currentMinute = 0;

	while (currentHour < endHour || (currentHour === endHour && currentMinute === 0)) {
		const hour = currentHour.toString().padStart(2, '0');
		const minute = currentMinute.toString().padStart(2, '0');
		slots.push(`${hour}:${minute}`);

		currentMinute += duration;
		if (currentMinute >= 60) {
			currentHour += Math.floor(currentMinute / 60);
			currentMinute = currentMinute % 60;
		}
	}

	return slots;
}

export function formatTimeAgo(timestamp: string): string {
	const date = new Date(timestamp);
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	
	// Less than a minute
	if (diff < 60000) {
		return 'Just now';
	}
	
	// Less than an hour
	if (diff < 3600000) {
		const minutes = Math.floor(diff / 60000);
		return `${minutes}m ago`;
	}
	
	// Less than a day
	if (diff < 86400000) {
		const hours = Math.floor(diff / 3600000);
		return `${hours}h ago`;
	}
	
	// Less than a week
	if (diff < 604800000) {
		const days = Math.floor(diff / 86400000);
		return `${days}d ago`;
	}
	
	// Format as date
	return date.toLocaleDateString();
}