/**
 * Parse a time string in HH:mm format to minutes since midnight
 */
export function parseTime(time: string): number {
    const match = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
        throw new Error('Invalid time format. Expected HH:mm');
    }

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error('Invalid time values');
    }

    return hours * 60 + minutes;
}

/**
 * Format minutes since midnight to HH:mm format
 */
export function formatTime(minutes: number): string {
    if (minutes < 0 || minutes >= 1440) {
        throw new Error('Invalid minutes value');
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Check if two time slots overlap
 */
export function hasTimeConflict(
    start1: string,
    end1: string,
    start2: string,
    end2: string
): boolean {
    const s1 = parseTime(start1);
    const e1 = parseTime(end1);
    const s2 = parseTime(start2);
    const e2 = parseTime(end2);

    return (s1 < e2 && e1 > s2);
}

/**
 * Get a range of time slots
 */
export function getTimeSlots(startHour = 9, endHour = 17): string[] {
    const slots: string[] = [];
    for (let hour = startHour; hour <= endHour; hour++) {
        slots.push(`${hour}:00`);
    }
    return slots;
}

/**
 * Format a time slot for display
 */
export function formatTimeSlot(time: string): string {
    const minutes = parseTime(time);
    const hours = Math.floor(minutes / 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours;
    return `${displayHours}:00 ${period}`;
} 