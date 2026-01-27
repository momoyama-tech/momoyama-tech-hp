/**
 * Action to trigger 3D reveal animation when element enters viewport
 * Adds 'reveal-3d' class initially, and appends 'visible' when intersected.
 * @param {HTMLElement} node
 * @param {{ threshold?: number }} params
 */
export function reveal(node, { threshold = 0.15 } = {}) {
    // Add base class for initial state (opacity 0, transformed)
    node.classList.add('reveal-3d');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    node.classList.add('visible');
                    observer.unobserve(node);
                }
            });
        },
        { threshold }
    );

    observer.observe(node);

    return {
        destroy() {
            observer.disconnect();
        }
    };
}
