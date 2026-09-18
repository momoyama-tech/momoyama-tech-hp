<script>
	import { onMount } from 'svelte';

	/** @type {number | null} */
	let count = $state(null);
	/** @type {string[]} */
	let displayDigits = $state([]);

	onMount(async () => {
		try {
			const res = await fetch('/api/visitor-count');
			if (!res.ok) return;
			const data = await res.json();
			if (typeof data.count !== 'number') return;
			count = data.count;
			runOdometer(String(count));
		} catch {
			// Network failure — just don't show the counter rather than a
			// broken/stuck state.
		}
	});

	// Airport-departure-board style reveal: every digit spins through
	// random values, each one settling on its real digit slightly after
	// the last (left to right), instead of the number just appearing.
	// Driven by direct state writes inside requestAnimationFrame — no
	// CSS @keyframes, no transform — same reasoning as the rest of this
	// codebase's animated effects (see BatteryDegradation.svelte).
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
	<div class="visitor-counter" aria-live="polite">
		<span>あなたは</span>
		<span class="vc-digits"
			>{#each displayDigits as d, i (i)}<span class="vc-digit">{d}</span>{/each}</span
		>
		<span>人目の訪問者です</span>
	</div>
{/if}

<style>
	.visitor-counter {
		display: inline-flex;
		align-items: baseline;
		gap: 0.35em;
		font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
		font-size: 12px;
		letter-spacing: 0.02em;
		color: rgba(161, 161, 170, 0.9);
	}

	.vc-digits {
		display: inline-flex;
		color: #4ade80;
		font-weight: 600;
	}

	.vc-digit {
		display: inline-block;
		min-width: 0.65em;
		text-align: center;
	}
</style>
