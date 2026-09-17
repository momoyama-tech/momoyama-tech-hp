<script>
	// The lower the visitor's real battery is, the more "corrupted" the UI
	// looks — a constant film-grain layer that gets grainier, plus random
	// words periodically flickering into scrambled code (reusing
	// textScramble.js, tying it to the same code-transition aesthetic
	// instead of inventing a second visual language).
	//
	// Battery Status API (navigator.getBattery) is Chromium-only — Firefox
	// and Safari never shipped it (removed from the spec track over
	// fingerprinting concerns). This is a progressive-enhancement showcase
	// feature, not core UX, so unsupported browsers just render normally;
	// everything below no-ops silently if the API or a promise it returns
	// is unavailable.
	//
	// Deliberately NOT here: a full-viewport overlay with a CSS @keyframes
	// "glitch flash" (RGB-split gradient + transform). Tried it first, and
	// restarting that animation repeatedly over a session — exactly what a
	// periodic effect does — reproducibly corrupted this app's paint into
	// a squeezed-into-one-corner render, the same failure class documented
	// in layout.css for the old client-side-navigation bug. Direct text
	// node mutation (scrambleTransition) never reproduced it under the same
	// stress test, so that's the only mechanism used for the repeating part
	// of this effect. The noise overlay below is static (no keyframes) and
	// survived the same stress test cleanly.
	import { onMount } from 'svelte';
	import { scrambleTransition } from '$lib/utils/textScramble.js';

	onMount(() => {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduceMotion || !('getBattery' in navigator)) return;

		let cancelled = false;
		let intensity = 0;
		/** @type {any} */
		let battery;
		/** @type {ReturnType<typeof setTimeout> | undefined} */
		let glitchTimer;

		/** @param {number} level @param {boolean} charging */
		function computeIntensity(level, charging) {
			// No visible effect above 50% battery; ramps to full intensity by
			// the time it hits empty. Charging halves it — a low battery
			// that's actively refilling doesn't need to feel as dire.
			const raw = level >= 0.5 ? 0 : (0.5 - level) / 0.5;
			return charging ? raw * 0.4 : raw;
		}

		function update() {
			intensity = computeIntensity(battery.level, battery.charging);
			document.documentElement.style.setProperty('--battery-intensity', String(intensity));
		}

		function flickerRandomText() {
			const candidates = Array.from(
				document.querySelectorAll('h1, h2, h3, h4, p, button, a')
			).filter((el) => {
				const r = el.getBoundingClientRect();
				return !!el.textContent?.trim() && r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
			});
			if (!candidates.length) return;
			const el = candidates[(Math.random() * candidates.length) | 0];
			scrambleTransition(el, {
				direction: 'toCode',
				duration: 110,
				onDone: () => scrambleTransition(el, { direction: 'toReal', duration: 180 })
			});
		}

		function scheduleGlitch() {
			// Healthy battery: just recheck occasionally in case it drops.
			// Degraded: flicker more often the lower it gets (6s down to ~2s).
			// Floor kept well above what stress-testing showed was safe, as
			// margin for a mechanism that only gets exercised over a long
			// real session, not a quick manual check.
			const delay = intensity <= 0.02 ? 4000 : Math.max(2000, 6000 - intensity * 4000);
			glitchTimer = setTimeout(() => {
				if (intensity > 0.02) flickerRandomText();
				scheduleGlitch();
			}, delay);
		}

		/** @type {any} */ (navigator)
			.getBattery()
			.then((/** @type {any} */ b) => {
				if (cancelled) return;
				battery = b;
				update();
				battery.addEventListener('levelchange', update);
				battery.addEventListener('chargingchange', update);
				scheduleGlitch();
			})
			.catch(() => {
				// Battery API present but rejected (e.g. a privacy-hardened
				// browser) — leave the UI at its normal, non-degraded state.
			});

		return () => {
			cancelled = true;
			if (glitchTimer) clearTimeout(glitchTimer);
			battery?.removeEventListener('levelchange', update);
			battery?.removeEventListener('chargingchange', update);
			document.documentElement.style.removeProperty('--battery-intensity');
		};
	});
</script>

<div class="battery-noise-overlay" aria-hidden="true"></div>

<style>
	:global(:root) {
		--battery-intensity: 0;
	}

	.battery-noise-overlay {
		/* Static background + a plain opacity transition only — no
		   mix-blend-mode, no @keyframes. Both were tried and each
		   reproducibly corrupted this app's paint/compositing under
		   repeated triggering (see the script comment above); this plain
		   version survived the same stress test cleanly. */
		position: fixed;
		inset: 0;
		z-index: 9990;
		pointer-events: none;
		opacity: calc(var(--battery-intensity) * 0.15);
		transition: opacity 0.8s ease;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='batteryNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23batteryNoise)'/%3E%3C/svg%3E");
	}

	@media (prefers-reduced-motion: reduce) {
		.battery-noise-overlay {
			display: none;
		}
	}
</style>
