<script>
	// The lower the visitor's real battery is, the more "corrupted" the UI
	// looks — a constant film-grain layer that gets grainier, random
	// "shaped" elements (cards, buttons, anything with a visible border or
	// rounded corner) briefly losing their edges (jitterRandomShape), and —
	// less often — an element visibly "browning out": dimming to near-black
	// and flickering back on, like it lost power for a second and rebooted
	// (blackoutRandomShape). The brownout is deliberately unlabeled in the
	// moment (no icon or text pointing at it when it happens) — it's meant
	// to be an experience, not a status report; a version that flashed a
	// small "⚡LOW" marker at the exact spot when it happened felt too
	// on-the-nose. Deliberately NOT touching text: an earlier version
	// flickered random words into scrambled code, but that briefly makes
	// the words unreadable, which reads as broken rather than "low power."
	//
	// The corner readout answers "why," quietly, for whoever looks: an
	// ASCII-style terminal bar (`[▓▓▓▓▓▓▓▓░░] 78%`) that re-decrypts itself
	// from scrambled characters into the real reading whenever the
	// percentage changes — reusing textScramble.js, the same mechanism
	// CodeTransition uses for page transitions. It shows green while
	// charging and amber while draining, using the same element and
	// mechanism for both — just a color and a sign of direction, not two
	// separate widgets. Earlier charging-only attempts: a cyan glow pulse
	// on random cards and green bubbles rising like carbonation both read
	// as vague "something's happening" rather than specifically charging; a
	// battery-shaped icon showed charging but not the level; a plain
	// circular percentage ring showed the level but wasn't very
	// distinctive.
	//
	// Battery Status API (navigator.getBattery) is Chromium-only — Firefox
	// and Safari never shipped it (removed from the spec track over
	// fingerprinting concerns). This is a progressive-enhancement showcase
	// feature, not core UX, so unsupported browsers just render normally;
	// everything below no-ops silently if the API or a promise it returns
	// is unavailable.
	//
	// Deliberately NOT here: a full-viewport overlay with a CSS @keyframes
	// animation (tried a "glitch flash", then a scanning noise band).
	// Restarting a CSS @keyframes animation repeatedly over a session —
	// exactly what a periodic effect does — reproducibly corrupted this
	// app's paint into a squeezed-into-one-corner render, the same failure
	// class documented in layout.css for the old client-side-navigation
	// bug. Direct style/attribute mutation via requestAnimationFrame (no
	// @keyframes, no class-toggle-triggered animation, no `transform`)
	// never reproduced it under the same stress test, so that's the only
	// mechanism used for the repeating parts of this effect, same as
	// textScramble.js.
	import { onMount } from 'svelte';
	import { scrambleTransition } from '$lib/utils/textScramble.js';

	/** @type {HTMLDivElement | undefined} */
	let chargeBadge = $state();

	onMount(() => {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduceMotion || !('getBattery' in navigator)) return;

		let cancelled = false;
		let intensity = 0;
		let charging = false;
		let chargeAnimRunning = false;
		/** @type {any} */
		let battery;
		/** @type {ReturnType<typeof setTimeout> | undefined} */
		let glitchTimer;

		/** @param {number} level @param {boolean} isCharging */
		function computeIntensity(level, isCharging) {
			if (isCharging) {
				// Clearly visible even near a full charge — otherwise the
				// feature basically never shows up on a laptop that spends
				// most of its time plugged in — growing further as the
				// charge being refilled gets lower.
				return Math.min(0.9, 0.4 + (1 - level) * 0.5);
			}
			// Unplugged: no visible effect above 50% battery, ramping to full
			// intensity by the time it hits empty.
			return level >= 0.5 ? 0 : (0.5 - level) / 0.5;
		}

		let lastRenderedPct = -1;
		let cursorOn = true;
		/** @type {ReturnType<typeof setInterval> | undefined} */
		let cursorTimer;

		function renderPercentage(force = false) {
			if (!chargeBadge) return;
			const pct = Math.round(battery.level * 100);
			if (pct === lastRenderedPct && !force) return;
			lastRenderedPct = pct;
			const found = chargeBadge.querySelector('.battery-ascii-readout');
			if (!found) return;
			const textEl = found;
			const barLength = 10;
			const filled = Math.round((pct / 100) * barLength);
			textEl.textContent = `[${'▓'.repeat(filled)}${'░'.repeat(barLength - filled)}] ${pct}%`;
			// Re-decrypts the whole readout from scrambled characters into
			// the real reading — same animator CodeTransition uses, just
			// pointed at this one small element instead of the whole page.
			scrambleTransition(textEl, { direction: 'toReal', duration: 500 });
		}

		function startBadge() {
			if (chargeAnimRunning || !chargeBadge) return;
			chargeAnimRunning = true;
			chargeBadge.classList.add('battery-charge-badge-visible');
			chargeBadge.classList.toggle('battery-charge-badge-low', !charging);
			lastRenderedPct = -1; // force a fresh decrypt-in on every appearance
			renderPercentage(true);

			const cursorEl = chargeBadge.querySelector('.battery-cursor');
			cursorTimer = setInterval(() => {
				cursorOn = !cursorOn;
				if (cursorEl) /** @type {HTMLElement} */ (cursorEl).style.opacity = cursorOn ? '1' : '0';
			}, 530);
		}

		function stopBadge() {
			chargeAnimRunning = false;
			chargeBadge?.classList.remove('battery-charge-badge-visible');
			if (cursorTimer) clearInterval(cursorTimer);
		}

		function update() {
			const wasBadgeShown = charging || intensity > 0.02;
			charging = battery.charging;
			intensity = computeIntensity(battery.level, charging);
			document.documentElement.style.setProperty('--battery-intensity', String(intensity));
			const shouldShowBadge = charging || intensity > 0.02;
			renderPercentage();
			if (chargeBadge) chargeBadge.classList.toggle('battery-charge-badge-low', !charging);
			if (shouldShowBadge && !wasBadgeShown) startBadge();
			if (!shouldShowBadge && wasBadgeShown) stopBadge();
		}

		/** @param {Element} el */
		function looksLikeAShape(el) {
			const cs = getComputedStyle(el);
			const hasRadius = parseFloat(cs.borderTopLeftRadius) > 0;
			const hasBorder = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none';
			return hasRadius || hasBorder;
		}

		function randomShapeElement() {
			const candidates = Array.from(document.querySelectorAll('div, button, a, img')).filter(
				(el) => {
					const r = el.getBoundingClientRect();
					if (r.width < 40 || r.height < 40 || r.width > window.innerWidth * 0.92) return false;
					if (r.bottom <= 0 || r.top >= window.innerHeight) return false;
					return looksLikeAShape(el);
				}
			);
			if (!candidates.length) return undefined;
			return /** @type {HTMLElement} */ (candidates[(Math.random() * candidates.length) | 0]);
		}

		function jitterRandomShape() {
			const found = randomShapeElement();
			if (!found) return;
			const el = found;
			const originalClip = el.style.clipPath;
			const start = performance.now();
			const duration = 380;

			/** @param {number} now */
			function jitter(now) {
				const p = Math.min(1, (now - start) / duration);
				if (p < 1) {
					// Jagged, asymmetric insets that shrink back toward 0 as p
					// approaches 1 — reads as the edge losing its shape and
					// then reassembling, never a hard cut.
					const amt = (1 - p) * 6;
					const side = () => (Math.random() * amt).toFixed(1);
					el.style.clipPath = `inset(${side()}% ${side()}% ${side()}% ${side()}% round ${(Math.random() * 18).toFixed(0)}px)`;
					requestAnimationFrame(jitter);
				} else {
					el.style.clipPath = originalClip;
				}
			}
			requestAnimationFrame(jitter);
		}

		function blackoutRandomShape() {
			const found = randomShapeElement();
			if (!found) return;
			const el = found;
			const originalOpacity = el.style.opacity;
			const start = performance.now();
			const duration = 700;
			// Dim almost to nothing, then stutter back up in uneven steps —
			// reads as a component losing power and rebooting, not a clean
			// fade. Opacity only (no filter/transform), consistent with the
			// rest of this file.
			const steps = [0.06, 0.45, 0.12, 0.65, 0.25, 1];

			/** @param {number} now */
			function flicker(now) {
				const p = Math.min(1, (now - start) / duration);
				if (p < 1) {
					const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
					el.style.opacity = String(steps[idx]);
					requestAnimationFrame(flicker);
				} else {
					el.style.opacity = originalOpacity;
				}
			}
			requestAnimationFrame(flicker);
		}

		function scheduleGlitch() {
			// Healthy + unplugged: just recheck occasionally in case it drops.
			// Otherwise: trigger more often the more intense it gets. Floor
			// kept well above what stress-testing showed was safe, as margin
			// for a mechanism that only gets exercised over a long real
			// session, not a quick manual check. Charging never jitters or
			// browns out — that's a draining-battery thing only.
			const delay = intensity <= 0.02 ? 4000 : Math.max(1500, 5000 - intensity * 4000);
			glitchTimer = setTimeout(() => {
				if (intensity > 0.02 && !charging) {
					// Brownouts are rarer than jitters — an occasional "it just
					// crashed" moment against a steadier background instability.
					if (Math.random() < 0.3) blackoutRandomShape();
					else jitterRandomShape();
				}
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
			stopBadge();
			if (glitchTimer) clearTimeout(glitchTimer);
			battery?.removeEventListener('levelchange', update);
			battery?.removeEventListener('chargingchange', update);
			document.documentElement.style.removeProperty('--battery-intensity');
		};
	});
</script>

<div class="battery-noise-overlay" aria-hidden="true"></div>

<div class="battery-charge-badge" bind:this={chargeBadge} aria-hidden="true">
	<span class="battery-ascii-readout"></span><span class="battery-cursor">_</span>
</div>

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
		opacity: calc(var(--battery-intensity) * 0.22);
		transition: opacity 0.8s ease;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='batteryNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23batteryNoise)'/%3E%3C/svg%3E");
	}

	.battery-charge-badge {
		position: fixed;
		right: 16px;
		bottom: 16px;
		z-index: 9994;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.4s ease;
		padding: 5px 9px;
		border-radius: 6px;
		background: rgba(5, 10, 15, 0.55);
		border: 1px solid rgba(255, 255, 255, 0.12);
		backdrop-filter: blur(6px);
		font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
		font-size: 11px;
		letter-spacing: 0.02em;
		color: #4ade80;
		white-space: pre;
		transition:
			opacity 0.4s ease,
			color 0.6s ease;
	}

	.battery-charge-badge:global(.battery-charge-badge-low) {
		color: #f59e0b;
	}

	.battery-charge-badge:global(.battery-charge-badge-visible) {
		opacity: 1;
	}

	.battery-cursor {
		transition: opacity 0.15s ease;
	}

	@media (prefers-reduced-motion: reduce) {
		.battery-noise-overlay,
		.battery-charge-badge {
			display: none;
		}
	}
</style>
