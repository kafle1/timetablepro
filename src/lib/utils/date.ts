export function formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function formatDateTime(date: Date | string): string {
    const d = new Date(date);
    return `${formatDate(d)} at ${formatTime(d)}`;
}

export function getTimeSlots(startTime: string = '08:00', endTime: string = '18:00', interval: number = 30): string[] {
    const slots: string[] = [];
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);

    while (start <= end) {
        slots.push(start.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }));
        start.setMinutes(start.getMinutes() + interval);
    }

    return slots;
}

export function getDayOfWeek(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'long' });
}

export function isOverlapping(start1: Date | string, end1: Date | string, start2: Date | string, end2: Date | string): boolean {
    const s1 = new Date(start1).getTime();
    const e1 = new Date(end1).getTime();
    const s2 = new Date(start2).getTime();
    const e2 = new Date(end2).getTime();

    return (s1 < e2 && e1 > s2);
}

export function addMinutes(date: Date | string, minutes: number): Date {
    const d = new Date(date);
    return new Date(d.getTime() + minutes * 60000);
}

export function getWeekDates(date: Date = new Date()): Date[] {
    const week: Date[] = [];
    const current = new Date(date);
    const first = current.getDate() - current.getDay();

    for (let i = 0; i < 7; i++) {
        const day = new Date(current.setDate(first + i));
        week.push(day);
    }

    return week;
}

export function isSameDay(date1: Date | string, date2: Date | string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.toDateString() === d2.toDateString();
}

export function getDateRange(start: Date | string, end: Date | string): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

export function parseTimeString(timeString: string): Date {
    const [time, meridiem] = timeString.split(' ');
    const [hours, minutes] = time.split(':');
    const date = new Date();
    
    let hour = parseInt(hours);
    if (meridiem === 'PM' && hour !== 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
    
    date.setHours(hour, parseInt(minutes), 0, 0);
    return date;
} 