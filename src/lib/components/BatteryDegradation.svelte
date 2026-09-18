<script>
	// The lower the visitor's real battery is, the more "corrupted" the UI
	// looks — a constant film-grain layer that gets grainier, plus random
	// "shaped" elements (cards, buttons, anything with a visible border or
	// rounded corner) briefly losing their edges — the outline wobbles into
	// a jagged clip-path and settles back. Deliberately NOT touching text:
	// an earlier version flickered random words into scrambled code, but
	// that briefly makes the words unreadable, which reads as broken rather
	// than "low power" — noise should degrade the chrome, not the content
	// someone's trying to read.
	//
	// Charging shows a small literal battery+bolt badge in the corner with
	// an animated charging fill, instead of an ambient effect. Two ambient
	// attempts (a cyan glow pulse on random cards, then green bubbles
	// rising like carbonation) were both too abstract to actually read as
	// "charging" rather than just "something is happening" — sometimes the
	// obvious literal icon is the right call over a cleverer abstraction.
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

		function startChargeBadge() {
			if (chargeAnimRunning || !chargeBadge) return;
			chargeAnimRunning = true;
			chargeBadge.classList.add('battery-charge-badge-visible');
			const found = chargeBadge.querySelector('.battery-charge-fill');
			if (!found) return;
			const fillEl = found;
			const maxWidth = 20;
			const cycleDuration = 1700;
			const start = performance.now();

			/** @param {number} now */
			function tick(now) {
				if (!chargeAnimRunning) return;
				const elapsed = (now - start) % cycleDuration;
				const p = elapsed / cycleDuration;
				// Fills over the first 70% of each cycle, holds briefly full,
				// then the next cycle's modulo wrap reads as a quick reset —
				// the familiar "charging" icon animation shape.
				const fillP = Math.min(1, p / 0.7);
				fillEl.setAttribute('width', String(maxWidth * fillP));
				requestAnimationFrame(tick);
			}
			requestAnimationFrame(tick);
		}

		function stopChargeBadge() {
			chargeAnimRunning = false;
			chargeBadge?.classList.remove('battery-charge-badge-visible');
			const fillEl = chargeBadge?.querySelector('.battery-charge-fill');
			fillEl?.setAttribute('width', '0');
		}

		function update() {
			const wasCharging = charging;
			charging = battery.charging;
			intensity = computeIntensity(battery.level, charging);
			document.documentElement.style.setProperty('--battery-intensity', String(intensity));
			if (charging && !wasCharging) startChargeBadge();
			if (!charging && wasCharging) stopChargeBadge();
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

		function scheduleGlitch() {
			// Healthy + unplugged: just recheck occasionally in case it drops.
			// Otherwise: trigger more often the more intense it gets. Floor
			// kept well above what stress-testing showed was safe, as margin
			// for a mechanism that only gets exercised over a long real
			// session, not a quick manual check. Charging is handled entirely
			// by the charge badge above, not this one.
			const delay = intensity <= 0.02 ? 4000 : Math.max(1500, 5000 - intensity * 4000);
			glitchTimer = setTimeout(() => {
				if (intensity > 0.02 && !charging) jitterRandomShape();
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
			stopChargeBadge();
			if (glitchTimer) clearTimeout(glitchTimer);
			battery?.removeEventListener('levelchange', update);
			battery?.removeEventListener('chargingchange', update);
			document.documentElement.style.removeProperty('--battery-intensity');
		};
	});
</script>

<div class="battery-noise-overlay" aria-hidden="true"></div>

<div class="battery-charge-badge" bind:this={chargeBadge} aria-hidden="true">
	<svg width="30" height="16" viewBox="0 0 30 16" xmlns="http://www.w3.org/2000/svg">
		<rect x="1" y="1" width="24" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.5" />
		<rect x="26" y="5" width="2.5" height="6" rx="1" fill="currentColor" />
		<rect class="battery-charge-fill" x="3.5" y="3.5" width="0" height="9" rx="1.5" fill="#22c55e" />
		<path
			class="battery-charge-bolt"
			d="M14.5 3.5 L10 9 H13 L11.5 12.5 L17 7 H13.5 Z"
			fill="#facc15"
			stroke="#a16207"
			stroke-width="0.4"
		/>
	</svg>
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
		color: rgba(148, 163, 184, 0.9);
		filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.15));
	}

	.battery-charge-badge:global(.battery-charge-badge-visible) {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.battery-noise-overlay,
		.battery-charge-badge {
			display: none;
		}
	}
</style>
