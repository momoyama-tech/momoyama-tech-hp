<script>
	// Page-transition "cube face" overlay — a regular, always-mounted DOM
	// panel (not a View Transition pseudo-element). It hinges in on one
	// edge to fully cover the screen, the actual page swap happens while
	// it's opaque, then it continues rotating through to reveal the new
	// page. Driven entirely by CSS transform on a live element, the same
	// class of animation as the already-safe .reveal-3d scroll effect —
	// deliberately kept off the View Transition pseudo-elements, which
	// reproducibly corrupt Chrome's GPU compositor when animated (see the
	// note in layout.css).
	import logo from '$lib/assets/logo.png';

	/** @type {'hidden' | 'in' | 'mid' | 'out'} */
	let phase = $state('hidden');
	/** @type {'right' | 'left'} */
	let dir = $state('right');

	const DUR = 280;

	/** @param {number} ms */
	function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	function nextFrame() {
		return new Promise((resolve) => requestAnimationFrame(resolve));
	}

	/**
	 * Swing the panel in to fully cover the screen, invoke `onCovered` at
	 * the midpoint (panel opaque — safe to swap the page underneath), then
	 * continue swinging it out to reveal the result.
	 * @param {'right' | 'left'} direction
	 * @param {() => void | Promise<void>} onCovered
	 */
	export async function play(direction, onCovered) {
		dir = direction;
		phase = 'in';
		// Let the browser paint the starting (edge-on) transform before
		// animating to the covered state, so the transition always runs.
		await nextFrame();
		await nextFrame();
		phase = 'mid';
		await sleep(DUR);
		await onCovered?.();
		phase = 'out';
		await sleep(DUR);
		phase = 'hidden';
	}
</script>

{#if phase !== 'hidden'}
	<div class="cube-overlay-wrap">
		<div class="cube-overlay-panel" data-dir={dir} data-phase={phase}>
			<img src={logo} alt="" class="cube-overlay-logo" />
		</div>
	</div>
{/if}

<style>
	.cube-overlay-wrap {
		position: fixed;
		inset: 0;
		z-index: 10000;
		perspective: 1600px;
	}

	.cube-overlay-panel {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #0a0a0a 0%, #111827 55%, #0a0a0a 100%);
		box-shadow: 0 0 80px rgba(0, 0, 0, 0.7);
		backface-visibility: hidden;
		transform: rotateY(0deg);
	}

	.cube-overlay-panel[data-dir='right'] {
		transform-origin: 100% 50%;
	}
	.cube-overlay-panel[data-dir='left'] {
		transform-origin: 0% 50%;
	}

	.cube-overlay-panel[data-phase='in'][data-dir='right'] {
		transform: rotateY(-90deg);
	}
	.cube-overlay-panel[data-phase='in'][data-dir='left'] {
		transform: rotateY(90deg);
	}

	.cube-overlay-panel[data-phase='mid'] {
		transform: rotateY(0deg);
		transition: transform var(--cube-panel-dur, 280ms) cubic-bezier(0.72, 0, 0.28, 1);
	}

	.cube-overlay-panel[data-phase='out'][data-dir='right'] {
		transform: rotateY(90deg);
		transition: transform var(--cube-panel-dur, 280ms) cubic-bezier(0.72, 0, 0.28, 1);
	}
	.cube-overlay-panel[data-phase='out'][data-dir='left'] {
		transform: rotateY(-90deg);
		transition: transform var(--cube-panel-dur, 280ms) cubic-bezier(0.72, 0, 0.28, 1);
	}

	.cube-overlay-logo {
		width: 56px;
		height: 56px;
		opacity: 0.9;
		filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.5));
	}
</style>
