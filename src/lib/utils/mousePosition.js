// Tracks the real cursor's last known viewport position so a fake/simulated
// cursor (e.g. ContactForm's typing demo) can start exactly where the
// visitor's actual mouse is, instead of popping in somewhere arbitrary.
// Import this once from somewhere that's always mounted (the root layout)
// so the listener is live well before anything needs to read a position.

let x = 0;
let y = 0;

if (typeof window !== 'undefined') {
	/** @param {MouseEvent} e */
	const record = (e) => {
		x = e.clientX;
		y = e.clientY;
	};
	// mousemove alone can miss the very first interaction on a page — if the
	// visitor's mouse was already resting over a button and they click it
	// without moving first, no mousemove ever fires and a reader would fall
	// back to the (0, 0) default, nowhere near the real cursor. pointerdown
	// fires on that same click and carries the real coordinates too.
	window.addEventListener('mousemove', record, { passive: true });
	window.addEventListener('pointerdown', record, { passive: true, capture: true });
}

export function getMousePosition() {
	return { x, y };
}
