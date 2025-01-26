import { describe, it, expect } from 'vitest';
import { parseTime, formatTime, hasTimeConflict } from './time';

describe('Time utilities', () => {
    describe('parseTime', () => {
        it('should parse time string to minutes', () => {
            expect(parseTime('9:00')).toBe(540);
            expect(parseTime('13:30')).toBe(810);
            expect(parseTime('17:00')).toBe(1020);
        });

        it('should handle invalid time strings', () => {
            expect(() => parseTime('invalid')).toThrow();
            expect(() => parseTime('25:00')).toThrow();
            expect(() => parseTime('12:60')).toThrow();
        });
    });

    describe('formatTime', () => {
        it('should format minutes to time string', () => {
            expect(formatTime(540)).toBe('9:00');
            expect(formatTime(810)).toBe('13:30');
            expect(formatTime(1020)).toBe('17:00');
        });

        it('should handle invalid minutes', () => {
            expect(() => formatTime(-1)).toThrow();
            expect(() => formatTime(1440)).toThrow();
        });
    });

    describe('hasTimeConflict', () => {
        it('should detect overlapping time slots', () => {
            expect(hasTimeConflict('9:00', '10:00', '9:30', '10:30')).toBe(true);
            expect(hasTimeConflict('9:00', '10:00', '10:00', '11:00')).toBe(false);
            expect(hasTimeConflict('9:00', '11:00', '10:00', '10:30')).toBe(true);
        });

        it('should handle equal start and end times', () => {
            expect(hasTimeConflict('9:00', '10:00', '10:00', '11:00')).toBe(false);
            expect(hasTimeConflict('9:00', '10:00', '8:00', '9:00')).toBe(false);
        });
    });
}); 