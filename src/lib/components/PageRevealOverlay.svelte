<script>
	// Full-page-load "tile flip" reveal. Runs once per real navigation now
	// that section-to-section links do a full reload (data-sveltekit-reload
	// in app.html) instead of a SvelteKit client-side transition.
	//
	// Deliberately NOT driven by onNavigate/View Transitions — this is a
	// pure CSS animation that autoplays on mount. Because +layout.svelte
	// (where this is mounted) is only re-created on a real page load, not
	// on the residual client-side goto() calls (the /home news-item
	// overlay), it naturally only plays on real navigations and can't
	// accumulate state across them — each play is a fresh document with a
	// fresh compositor, which is the whole point of the reload-based fix
	// in layout.css. Each tile uses perspective + rotateY on an ordinary
	// DOM element, the same pattern already proven safe (.reveal-3d),
	// never on a View Transition pseudo-element.
	import logo from '$lib/assets/logo.png';

	const COLS = 10;
	const ROWS = 6;
	const STAGGER_MS = 16;

	const tiles = Array.from({ length: COLS * ROWS }, (_, i) => {
		const col = i % COLS;
		const row = Math.floor(i / COLS);
		return { col, row, delay: (row + col) * STAGGER_MS };
	});
</script>

<div class="reveal-wrap" aria-hidden="true">
	<div class="reveal-grid" style="--cols: {COLS}; --rows: {ROWS};">
		{#each tiles as tile (tile.row + '-' + tile.col)}
			<div class="reveal-tile" style="animation-delay: {tile.delay}ms;"></div>
		{/each}
	</div>
	<img src={logo} alt="" class="reveal-logo" />
</div>

<style>
	.reveal-wrap {
		position: fixed;
		inset: 0;
		z-index: 10000;
		pointer-events: none;
	}

	.reveal-grid {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-columns: repeat(var(--cols), 1fr);
		grid-template-rows: repeat(var(--rows), 1fr);
		perspective: 900px;
	}

	.reveal-tile {
		background: linear-gradient(135deg, #0a0a0a 0%, #111827 55%, #0a0a0a 100%);
		backface-visibility: hidden;
		transform-origin: 50% 50%;
		animation-name: tile-flip;
		animation-duration: 0.4s;
		animation-timing-function: cubic-bezier(0.6, 0, 0.3, 1);
		animation-fill-mode: forwards;
	}

	@keyframes tile-flip {
		from {
			transform: rotateY(0deg);
			opacity: 1;
		}
		to {
			transform: rotateY(100deg);
			opacity: 0;
		}
	}

	.reveal-logo {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 56px;
		height: 56px;
		opacity: 0.9;
		filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.5));
		animation: logo-fade 0.55s cubic-bezier(0.65, 0, 0.35, 1) forwards;
	}

	@keyframes logo-fade {
		0% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 0.9;
		}
		45% {
			transform: translate(-50%, -50%) scale(1.08);
			opacity: 0.9;
		}
		100% {
			transform: translate(-50%, -50%) scale(0.7);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.reveal-wrap {
			display: none;
		}
	}
</style>
