<script>
	// Full-page-load "double doors" reveal. Runs once per real navigation
	// now that section-to-section links do a full reload (data-sveltekit-reload
	// in app.html) instead of a SvelteKit client-side transition.
	//
	// Deliberately NOT driven by onNavigate/View Transitions — this is a
	// pure CSS animation that autoplays on mount. Because +layout.svelte
	// (where this is mounted) is only re-created on a real page load, not
	// on the residual client-side goto() calls (the /home news-item
	// overlay), it naturally only plays on real navigations and can't
	// accumulate state across them — each play is a fresh document with a
	// fresh compositor, which is the whole point of the reload-based fix
	// in layout.css. Uses perspective + rotateY on ordinary DOM elements,
	// the same pattern already proven safe (.reveal-3d), never on a View
	// Transition pseudo-element.
	import logo from '$lib/assets/logo.png';
</script>

<div class="reveal-wrap" aria-hidden="true">
	<div class="reveal-door reveal-door-left"></div>
	<div class="reveal-door reveal-door-right"></div>
	<img src={logo} alt="" class="reveal-logo" />
</div>

<style>
	.reveal-wrap {
		position: fixed;
		inset: 0;
		z-index: 10000;
		perspective: 1800px;
		pointer-events: none;
	}

	.reveal-door {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 50%;
		background: linear-gradient(135deg, #0a0a0a 0%, #111827 55%, #0a0a0a 100%);
		backface-visibility: hidden;
		box-shadow: 0 0 80px rgba(0, 0, 0, 0.7);
		animation-duration: 0.85s;
		animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
		animation-fill-mode: forwards;
	}

	.reveal-door-left {
		left: 0;
		transform-origin: 0% 50%;
		animation-name: door-swing-left;
	}

	.reveal-door-right {
		right: 0;
		transform-origin: 100% 50%;
		animation-name: door-swing-right;
	}

	@keyframes door-swing-left {
		from {
			transform: rotateY(0deg);
		}
		to {
			transform: rotateY(-100deg);
		}
	}
	@keyframes door-swing-right {
		from {
			transform: rotateY(0deg);
		}
		to {
			transform: rotateY(100deg);
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
		animation: logo-fade 0.6s cubic-bezier(0.65, 0, 0.35, 1) forwards;
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
