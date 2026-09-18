// Adds `.is-revealed` to an element the first time it scrolls into view,
// then stops watching — a reusable trigger for scroll-timed entrances
// across the site. Only detection lives here; each caller defines its own
// `.is-revealed` styling (usually a plain CSS transition from a resting
// "hidden" state), so this action never dictates how something looks,
// just when it should switch.
//
// Deliberately class-based rather than driving JS-computed inline styles:
// the reveal is always a single, one-shot CSS transition (opacity/
// transform), never a repeating or JS-driven animation, so it doesn't
// touch the risk documented in BatteryDegradation.svelte.

/**
 * @param {HTMLElement} node
 * @param {{ delay?: number }} [params] - stagger delay in ms, applied via
 *   setTimeout rather than a CSS transition-delay so it never leaks into
 *   an element's other transitions (e.g. hover states sharing `transition-all`).
 */
export function revealOnScroll(node, params = {}) {
	const delay = params.delay ?? 0;

	if (
		typeof IntersectionObserver === 'undefined' ||
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	) {
		node.classList.add('is-revealed');
		return {};
	}

	const observer = new IntersectionObserver(
		(entries) => {
			if (entries[0]?.isIntersecting) {
				observer.disconnect();
				if (delay > 0) {
					setTimeout(() => node.classList.add('is-revealed'), delay);
				} else {
					node.classList.add('is-revealed');
				}
			}
		},
		{ threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
	);
	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
