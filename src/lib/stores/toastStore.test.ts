import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { toasts } from './toastStore';

describe('Toast Store', () => {
    beforeEach(() => {
        toasts.clear();
        vi.useFakeTimers();
    });

    it('should start with an empty array', () => {
        expect(get(toasts)).toEqual([]);
    });

    describe('success', () => {
        it('should add a success toast', () => {
            const id = toasts.success('Test success');
            const state = get(toasts);
            expect(state).toHaveLength(1);
            expect(state[0]).toEqual({
                id,
                type: 'success',
                message: 'Test success',
                duration: undefined
            });
        });

        it('should remove toast after duration', () => {
            toasts.success('Test success', 1000);
            expect(get(toasts)).toHaveLength(1);

            vi.advanceTimersByTime(1000);
            expect(get(toasts)).toHaveLength(0);
        });

        it('should not remove toast if duration is 0', () => {
            toasts.success('Test success', 0);
            expect(get(toasts)).toHaveLength(1);

            vi.advanceTimersByTime(5000);
            expect(get(toasts)).toHaveLength(1);
        });
    });

    describe('error', () => {
        it('should add an error toast', () => {
            const id = toasts.error('Test error');
            const state = get(toasts);
            expect(state).toHaveLength(1);
            expect(state[0]).toEqual({
                id,
                type: 'error',
                message: 'Test error',
                duration: undefined
            });
        });
    });

    describe('info', () => {
        it('should add an info toast', () => {
            const id = toasts.info('Test info');
            const state = get(toasts);
            expect(state).toHaveLength(1);
            expect(state[0]).toEqual({
                id,
                type: 'info',
                message: 'Test info',
                duration: undefined
            });
        });
    });

    describe('warning', () => {
        it('should add a warning toast', () => {
            const id = toasts.warning('Test warning');
            const state = get(toasts);
            expect(state).toHaveLength(1);
            expect(state[0]).toEqual({
                id,
                type: 'warning',
                message: 'Test warning',
                duration: undefined
            });
        });
    });

    describe('remove', () => {
        it('should remove a specific toast', () => {
            const id = toasts.success('Test success');
            expect(get(toasts)).toHaveLength(1);

            toasts.remove(id);
            expect(get(toasts)).toHaveLength(0);
        });

        it('should not remove other toasts', () => {
            const id1 = toasts.success('Test 1');
            const id2 = toasts.success('Test 2');
            expect(get(toasts)).toHaveLength(2);

            toasts.remove(id1);
            const state = get(toasts);
            expect(state).toHaveLength(1);
            expect(state[0].id).toBe(id2);
        });
    });

    describe('clear', () => {
        it('should remove all toasts', () => {
            toasts.success('Test 1');
            toasts.error('Test 2');
            toasts.info('Test 3');
            expect(get(toasts)).toHaveLength(3);

            toasts.clear();
            expect(get(toasts)).toHaveLength(0);
        });
    });
}); 