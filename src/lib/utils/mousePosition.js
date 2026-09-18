// Tracks the real cursor's last known viewport position so a fake/simulated
// cursor (e.g. ContactForm's typing demo) can start exactly where the
// visitor's actual mouse is, instead of popping in somewhere arbitrary.
// Import this once from somewhere that's always mounted (the root layout)
// so the listener is live well before anything needs to read a position.

let x = 0;
let y = 0;

if (typeof window !== 'undefined') {
	window.addEventListener(
		'mousemove',
		(e) => {
			x = e.clientX;
			y = e.clientY;
		},
		{ passive: true }
	);
}

export function getMousePosition() {
	return { x, y };
}
