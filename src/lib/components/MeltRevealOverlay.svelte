<script>
	// Full-page-load "liquid melt" reveal: an opaque panel covers the new
	// page, then dissolves as if melting — an SVG feTurbulence +
	// feDisplacementMap filter warps it into increasingly organic ripples
	// while it fades, instead of a flat wipe or crossfade. Pure CSS/SVG,
	// autoplaying on mount (SMIL <animate> tags inside the filter run on
	// their own, no JS timing needed).
	//
	// Runs once per real navigation now that section-to-section links do a
	// full reload (data-sveltekit-reload in app.html) instead of a
	// SvelteKit client-side transition. Mounted in +layout.svelte, which
	// is only re-created on a real page load, not on the residual
	// client-side goto() calls (the /home news-item overlay), so it
	// naturally only plays on real navigations. The filter is applied to
	// an ordinary DOM element, never to a View Transition pseudo-element —
	// don't move this onto ::view-transition-*(root) without re-verifying
	// the GPU compositor bug documented in layout.css is actually gone.
</script>

<svg width="0" height="0" style="position: absolute" aria-hidden="true">
	<defs>
		<filter id="melt-distort" x="-20%" y="-20%" width="140%" height="140%">
			<feTurbulence type="fractalNoise" baseFrequency="0.008 0.03" numOctaves="2" seed="7" result="noise">
				<animate
					attributeName="baseFrequency"
					dur="1s"
					values="0.008 0.03;0.015 0.07;0.03 0.13"
					fill="freeze"
				/>
			</feTurbulence>
			<feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G">
				<animate attributeName="scale" dur="1s" values="0;90;260" fill="freeze" />
			</feDisplacementMap>
		</filter>
	</defs>
</svg>

<div class="melt-reveal" aria-hidden="true">
	<div class="melt-panel"></div>
</div>

<style>
	.melt-reveal {
		position: fixed;
		inset: 0;
		z-index: 10000;
		pointer-events: none;
		overflow: hidden;
	}

	.melt-panel {
		position: absolute;
		inset: -15%;
		background: linear-gradient(135deg, #0a0a0a 0%, #111827 55%, #0a0a0a 100%);
		filter: url(#melt-distort);
		animation: melt-fade 1s cubic-bezier(0.5, 0, 0.3, 1) forwards;
	}

	@keyframes melt-fade {
		0%,
		35% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.melt-reveal {
			display: none;
		}
	}
</style>
