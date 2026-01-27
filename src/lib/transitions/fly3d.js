import { cubicOut } from 'svelte/easing';

/**
 * Animate elements entering with a 3D effect (translate Z and Rotate)
 * @param {HTMLElement} node
 * @param {{
 *   delay?: number,
 *   duration?: number,
 *   easing?: function(number): number,
 *   x?: number,
 *   y?: number,
 *   z?: number,
 *   rotateX?: number,
 *   rotateY?: number,
 *   opacity?: number
 * }} params
 */
export function fly3d(node, {
    delay = 0,
    duration = 800,
    easing = cubicOut,
    x = 0,
    y = 0,
    z = 100,
    rotateX = 0,
    rotateY = 0,
    opacity = 0
} = {}) {
    const style = getComputedStyle(node);
    const target_opacity = +style.opacity;
    const transform = style.transform === 'none' ? '' : style.transform;

    return {
        delay,
        duration,
        easing,
        /**
         * @param {number} t
         * @param {number} u
         */
        css: (t, u) => `
			transform: ${transform} 
                translate3d(${(1 - t) * x}px, ${(1 - t) * y}px, ${(1 - t) * z}px) 
                rotateX(${(1 - t) * rotateX}deg) 
                rotateY(${(1 - t) * rotateY}deg);
			opacity: ${target_opacity - (target_opacity - opacity) * u}
		`
    };
}
