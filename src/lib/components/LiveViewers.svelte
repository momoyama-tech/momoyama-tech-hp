<script>
	import { onMount, onDestroy } from 'svelte';

	/** @type {number | null} */
	let count = $state(null);
	/** @type {string[]} */
	let displayDigits = $state([]);

	const SESSION_KEY = 'momotech-session-id';
	const HEARTBEAT_INTERVAL_MS = 20_000;

	/** @type {ReturnType<typeof setInterval> | undefined} */
	let heartbeatTimer;

	function getSessionId() {
		try {
			let id = sessionStorage.getItem(SESSION_KEY);
			if (!id) {
				id = crypto.randomUUID();
				sessionStorage.setItem(SESSION_KEY, id);
			}
			return id;
		} catch {
			// sessionStorage blocked (private mode etc.) — a fresh id every
			// load just makes this tab look like a new viewer each time,
			// an acceptable degradation for a decorative counter.
			return crypto.randomUUID();
		}
	}

	/** @param {string} sessionId */
	async function sendHeartbeat(sessionId) {
		try {
			const res = await fetch('/api/presence', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ sessionId })
			});
			if (!res.ok) return;
			const data = await res.json();
			if (typeof data.count !== 'number') return;
			if (data.count !== count) {
				count = data.count;
				runOdometer(String(count));
			}
		} catch {
			// Network failure — keep showing the last known count rather
			// than clearing it to a broken/empty state.
		}
	}

	onMount(() => {
		const sessionId = getSessionId();
		sendHeartbeat(sessionId);
		heartbeatTimer = setInterval(() => sendHeartbeat(sessionId), HEARTBEAT_INTERVAL_MS);
	});

	onDestroy(() => {
		if (heartbeatTimer) clearInterval(heartbeatTimer);
	});

	// Airport-departure-board style reveal: every digit spins through
	// random values, each one settling on its real digit slightly after
	// the last (left to right). Driven by direct state writes inside
	// requestAnimationFrame — no CSS @keyframes, no transform — same
	// reasoning as the rest of this codebase's animated effects (see
	// BatteryDegradation.svelte).
	/** @param {string} finalStr */
	function runOdometer(finalStr) {
		const digits = finalStr.split('');
		displayDigits = digits.map(() => '0');
		const start = performance.now();
		const perDigitStagger = 110;
		const spinDuration = 650;

		/** @param {number} now */
		function tick(now) {
			let allSettled = true;
			for (let i = 0; i < digits.length; i++) {
				const elapsed = now - start - i * perDigitStagger;
				if (elapsed < 0) {
					allSettled = false;
				} else if (elapsed >= spinDuration) {
					displayDigits[i] = digits[i];
				} else {
					allSettled = false;
					displayDigits[i] = String((Math.random() * 10) | 0);
				}
			}
			displayDigits = [...displayDigits];
			if (!allSettled) requestAnimationFrame(tick);
		}
		requestAnimationFrame(tick);
	}
</script>

{#if count !== null}
	<div class="live-viewers" aria-live="polite">
		<span class="live-dot" aria-hidden="true"></span>
		<span class="live-digits"
			>{#each displayDigits as d, i (i)}<span class="live-digit">{d}</span>{/each}</span
		>
		<span>人が閲覧中</span>
	</div>
{/if}

<style>
	/* A fixed corner badge, not a footer line — a line at the very bottom
	   of a long page is something almost nobody scrolls far enough to see.
	   Bottom-LEFT specifically, so it doesn't collide with
	   BatteryDegradation's bottom-right readout. */
	.live-viewers {
		position: fixed;
		left: 16px;
		bottom: 16px;
		z-index: 9993;
		display: inline-flex;
		align-items: baseline;
		gap: 0.4em;
		padding: 5px 9px;
		border-radius: 6px;
		background: rgba(5, 10, 15, 0.55);
		border: 1px solid rgba(255, 255, 255, 0.12);
		backdrop-filter: blur(6px);
		font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
		font-size: 11px;
		letter-spacing: 0.02em;
		color: rgba(161, 161, 170, 0.9);
		pointer-events: none;
	}

	/* One continuous, never-restarted keyframe animation — safe under the
	   GPU-compositor-corruption constraint documented in
	   BatteryDegradation.svelte, which only applies to repeatedly
	   restarted/class-toggled animations. */
	.live-dot {
		align-self: center;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #4ade80;
		box-shadow: 0 0 4px rgba(74, 222, 128, 0.8);
		animation: live-pulse 2s ease-in-out infinite;
	}

	@keyframes live-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.35;
		}
	}

	.live-digits {
		display: inline-flex;
		color: #4ade80;
		font-weight: 600;
	}

	.live-digit {
		display: inline-block;
		min-width: 0.65em;
		text-align: center;
	}

	@media (prefers-reduced-motion: reduce) {
		.live-viewers {
			display: none;
		}
	}
</style>
