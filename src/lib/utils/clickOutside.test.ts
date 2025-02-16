import { describe, it, expect, vi } from 'vitest';
import { clickOutside } from './clickOutside';

describe('Click Outside Directive', () => {
    let node: HTMLElement;
    let handler: () => void;
    let action: { destroy: () => void };

    beforeEach(() => {
        node = document.createElement('div');
        handler = vi.fn();
        action = clickOutside(node, handler);
        document.body.appendChild(node);
    });

    afterEach(() => {
        document.body.removeChild(node);
        action.destroy();
        vi.resetAllMocks();
    });

    it('should call handler when clicking outside', () => {
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true
        });
        document.body.dispatchEvent(event);
        expect(handler).toHaveBeenCalled();
    });

    it('should not call handler when clicking inside', () => {
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true
        });
        node.dispatchEvent(event);
        expect(handler).not.toHaveBeenCalled();
    });

    it('should not call handler when clicking on child element', () => {
        const child = document.createElement('div');
        node.appendChild(child);
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true
        });
        child.dispatchEvent(event);
        expect(handler).not.toHaveBeenCalled();
    });

    it('should remove event listener on destroy', () => {
        const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
        action.destroy();
        expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), true);
    });
}); 