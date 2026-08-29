/**
 * Svelte action for Mouse-following Spotlight effect on cards.
 * Sets CSS custom properties `--mouse-x` and `--mouse-y` in pixels relative to the card.
 * @param {HTMLElement} node
 */
export function spotlight(node) {
	/** @param {MouseEvent} e */
	function handleMouseMove(e) {
		const rect = node.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		node.style.setProperty('--mouse-x', `${x}px`);
		node.style.setProperty('--mouse-y', `${y}px`);
	}

	node.addEventListener('mousemove', handleMouseMove);

	return {
		destroy() {
			node.removeEventListener('mousemove', handleMouseMove);
		}
	};
}
