export function clickOutside(node: HTMLElement, handler: () => void) {
    const handleClick = (event: MouseEvent) => {
        const target = event.target as Node;
        if (!node.contains(target)) {
            handler();
        }
    };

    document.addEventListener('click', handleClick, true);

    return {
        destroy() {
            document.removeEventListener('click', handleClick, true);
        }
    };
} 