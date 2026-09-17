<script>
	// Full-page-load "liquid wipe" reveal: a dark panel drains away top to
	// bottom like water, its receding edge kept wavy/rippling by an SVG
	// feTurbulence + feDisplacementMap filter (continuously animated via
	// SMIL, not a one-shot ramp), with a glowing line riding that same
	// wavy edge — combining the earlier "scanning light" idea with a
	// genuinely fluid boundary instead of a straight clip-path line. Pure
	// CSS/SVG, autoplaying on mount, no JS timing needed.
	//
	// Runs once per real navigation now that section-to-section links do a
	// full reload (data-sveltekit-reload in app.html) instead of a
	// SvelteKit client-side transition. Mounted in +layout.svelte, which
	// is only re-created on a real page load, not on the residual
	// client-side goto() calls (the /home news-item overlay), so it
	// naturally only plays on real navigations. The filter/mask is applied
	// to ordinary DOM elements, never to a View Transition pseudo-element —
	// don't move this onto ::view-transition-*(root) without re-verifying
	// the GPU compositor bug documented in layout.css is actually gone.
</script>

<svg width="0" height="0" style="position: absolute" aria-hidden="true">
	<defs>
		<filter id="melt-distort" x="-20%" y="-100%" width="140%" height="300%">
			<feTurbulence type="fractalNoise" baseFrequency="0.012 0.06" numOctaves="2" seed="3" result="noise">
				<animate attributeName="seed" values="1;30;1" dur="0.6s" repeatCount="2" fill="freeze" />
			</feTurbulence>
			<feDisplacementMap in="SourceGraphic" in2="noise" scale="55" xChannelSelector="R" yChannelSelector="G" />
		</filter>
	</defs>
</svg>

<div class="melt-reveal" aria-hidden="true">
	<div class="melt-panel"></div>
	<div class="melt-bar"></div>
</div>

<style>
	@property --edge {
		syntax: '<percentage>';
		inherits: true;
		initial-value: 0%;
	}

	.melt-reveal {
		position: fixed;
		inset: 0;
		z-index: 10000;
		pointer-events: none;
		overflow: hidden;
		--edge: 0%;
		animation: melt-edge 1.1s cubic-bezier(0.5, 0, 0.25, 1) forwards;
	}

	@keyframes melt-edge {
		to {
			--edge: 100%;
		}
	}

	.melt-panel {
		position: absolute;
		inset: -15%;
		background: linear-gradient(135deg, #0a0a0a 0%, #111827 55%, #0a0a0a 100%);
		filter: url(#melt-distort);
		-webkit-mask-image: linear-gradient(
			to bottom,
			black 0%,
			black var(--edge),
			transparent calc(var(--edge) + 12%)
		);
		mask-image: linear-gradient(to bottom, black 0%, black var(--edge), transparent calc(var(--edge) + 12%));
	}

	.melt-bar {
		position: absolute;
		left: -10%;
		right: -10%;
		top: var(--edge);
		height: 5px;
		background: linear-gradient(90deg, transparent, #67e8f9 50%, transparent);
		box-shadow: 0 0 24px 6px rgba(6, 182, 212, 0.8), 0 0 60px 16px rgba(6, 182, 212, 0.35);
		filter: url(#melt-distort);
		opacity: 1;
		animation: melt-bar-fade 1.1s ease forwards;
	}

	@keyframes melt-bar-fade {
		0%,
		85% {
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
