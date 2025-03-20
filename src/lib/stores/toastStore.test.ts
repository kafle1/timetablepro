import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { toastStore } from './toastStore';

describe('toastStore', () => {
    beforeEach(() => {
        // Clear toasts before each test
        toastStore.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should add a success toast', () => {
        const id = 'test-id';
        vi.spyOn(Math, 'random').mockReturnValue(0.123);
        vi.spyOn(Date, 'now').mockReturnValue(123);

        toastStore.success('Success message');
        const state = get(toastStore);

        expect(state.toasts).toHaveLength(1);
        expect(state.toasts[0]).toEqual({
            id: expect.any(String),
            message: 'Success message',
            type: 'success',
            timeout: 5000
        });
    });

    it('should add an error toast', () => {
        const id = 'test-id';
        vi.spyOn(Math, 'random').mockReturnValue(0.123);
        vi.spyOn(Date, 'now').mockReturnValue(123);

        toastStore.error('Error message');
        const state = get(toastStore);

        expect(state.toasts).toHaveLength(1);
        expect(state.toasts[0]).toEqual({
            id: expect.any(String),
            message: 'Error message',
            type: 'error',
            timeout: 5000
        });
    });

    it('should add a warning toast', () => {
        const id = 'test-id';
        vi.spyOn(Math, 'random').mockReturnValue(0.123);
        vi.spyOn(Date, 'now').mockReturnValue(123);

        toastStore.warning('Warning message');
        const state = get(toastStore);

        expect(state.toasts).toHaveLength(1);
        expect(state.toasts[0]).toEqual({
            id: expect.any(String),
            message: 'Warning message',
            type: 'warning',
            timeout: 5000
        });
    });

    it('should add an info toast', () => {
        const id = 'test-id';
        vi.spyOn(Math, 'random').mockReturnValue(0.123);
        vi.spyOn(Date, 'now').mockReturnValue(123);

        toastStore.info('Info message');
        const state = get(toastStore);

        expect(state.toasts).toHaveLength(1);
        expect(state.toasts[0]).toEqual({
            id: expect.any(String),
            message: 'Info message',
            type: 'info',
            timeout: 5000
        });
    });

    it('should remove a toast by id', () => {
        const id1 = 'test-id-1';
        const id2 = 'test-id-2';
        
        vi.spyOn(Math, 'random').mockReturnValueOnce(0.1);
        vi.spyOn(Date, 'now').mockReturnValueOnce(111);
        toastStore.success('Success 1');
        
        vi.spyOn(Math, 'random').mockReturnValueOnce(0.2);
        vi.spyOn(Date, 'now').mockReturnValueOnce(222);
        toastStore.success('Success 2');
        
        const state1 = get(toastStore);
        expect(state1.toasts).toHaveLength(2);
        
        const id = state1.toasts[0].id;
        toastStore.remove(id);
        
        const state2 = get(toastStore);
        expect(state2.toasts).toHaveLength(1);
        expect(state2.toasts[0].id).not.toBe(id);
    });

    it('should clear all toasts', () => {
        toastStore.success('Success message');
        toastStore.error('Error message');
        
        const state1 = get(toastStore);
        expect(state1.toasts).toHaveLength(2);
        
        toastStore.clear();
        
        const state2 = get(toastStore);
        expect(state2.toasts).toHaveLength(0);
    });

    it('should auto-dismiss toast after timeout', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.123);
        vi.spyOn(Date, 'now').mockReturnValue(123);
        
        toastStore.success('Success message', 1000);
        
        const state1 = get(toastStore);
        expect(state1.toasts).toHaveLength(1);
        
        vi.advanceTimersByTime(1001);
        
        const state2 = get(toastStore);
        expect(state2.toasts).toHaveLength(0);
    });
}); 