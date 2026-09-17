<script>
	// Full-page-load "scan reveal": an opaque panel covers the new page,
	// clipped away from the top edge downward in sync with a glowing scan
	// line riding the reveal boundary — the page appears to be "scanned
	// into existence" top to bottom. Pure CSS, autoplaying on mount, no JS
	// timing needed.
	//
	// Runs once per real navigation now that section-to-section links do a
	// full reload (data-sveltekit-reload in app.html) instead of a
	// SvelteKit client-side transition. Mounted in +layout.svelte, which
	// is only re-created on a real page load, not on the residual
	// client-side goto() calls (the /home news-item overlay), so it
	// naturally only plays on real navigations. Ordinary DOM element, not
	// a View Transition pseudo-element — never animate transform/clip-path
	// on ::view-transition-*(root) without re-verifying the GPU compositor
	// bug documented in layout.css is actually gone.
</script>

<div class="scan-reveal" aria-hidden="true">
	<div class="scan-panel"></div>
	<div class="scan-bar"></div>
</div>

<style>
	.scan-reveal {
		position: fixed;
		inset: 0;
		z-index: 10000;
		pointer-events: none;
	}

	.scan-panel {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, #0a0a0a 0%, #111827 55%, #0a0a0a 100%);
		clip-path: inset(0% 0 0 0);
		animation: scan-reveal-panel 0.9s cubic-bezier(0.45, 0, 0.2, 1) forwards;
	}

	@keyframes scan-reveal-panel {
		from {
			clip-path: inset(0% 0 0 0);
		}
		to {
			clip-path: inset(100% 0 0 0);
		}
	}

	.scan-bar {
		position: absolute;
		left: 0;
		right: 0;
		top: 0%;
		height: 3px;
		background: linear-gradient(90deg, transparent, #67e8f9 50%, transparent);
		box-shadow: 0 0 24px 6px rgba(6, 182, 212, 0.8), 0 0 60px 16px rgba(6, 182, 212, 0.3);
		animation: scan-reveal-bar 0.9s cubic-bezier(0.45, 0, 0.2, 1) forwards;
	}

	@keyframes scan-reveal-bar {
		from {
			top: 0%;
			opacity: 1;
		}
		92% {
			opacity: 1;
		}
		to {
			top: 100%;
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.scan-reveal {
			display: none;
		}
	}
</style>
