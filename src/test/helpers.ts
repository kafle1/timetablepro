import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import type { SvelteComponent } from 'svelte';
import { vi } from 'vitest';

export function setup<Props extends Record<string, any>>(
    Component: new (...args: any[]) => SvelteComponent,
    props?: Props
) {
    const user = userEvent.setup();
    return {
        user,
        ...render(Component, { props })
    };
}

export function mockMatchMedia(matches: boolean) {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn()
        }))
    });
}

export function mockIntersectionObserver() {
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null
    });
    window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver;
    return mockIntersectionObserver;
}

export function mockResizeObserver() {
    const mockResizeObserver = vi.fn();
    mockResizeObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null
    });
    window.ResizeObserver = mockResizeObserver as unknown as typeof ResizeObserver;
    return mockResizeObserver;
}

export function mockDialog() {
    HTMLDialogElement.prototype.show = vi.fn();
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
}

export function createEvent(type: string, detail?: any): CustomEvent {
    return new CustomEvent(type, { detail });
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
} 