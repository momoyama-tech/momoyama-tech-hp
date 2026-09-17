<script>
	// One-time "boot sequence" shown on the first page of a browser session
	// (gated by sessionStorage, not localStorage — reappears on a fresh
	// session/tab, not on every navigation within one visit). Pure DOM +
	// CSS/JS-timed text reveal, no View Transitions, no dependency on the
	// navigation lifecycle — plays exactly once regardless of which page
	// the visitor lands on first, then fades away for good this session.
	//
	// The "ENTER を押して開始" prompt requires a REAL click, not a faked
	// cursor animation. An earlier version had a fake cursor auto-travel to
	// the button (matching ichimaru103.com's technique of a real
	// `cursor: url(...)` plus a hidden fake cursor it animates), but that
	// only works if the visitor's actual pointer position is already known
	// — if their real cursor has never entered the viewport (or is on
	// another monitor), there's nothing to animate from and it either
	// teleports from a wrong/default position or starts at (0,0). Requiring
	// a real click sidesteps that entirely: the click event itself gives an
	// exact, guaranteed-on-screen position, which is also why the reference
	// site gates its own "auto" sequences behind an initial click.
	import { tick } from 'svelte';
	import { boot } from '$lib/stores/boot.svelte.js';

	const LINES = [
		'MOMOYAMA TECH SYSTEM v2.0',
		'Booting...',
		'Loading modules... [ OK ]',
		'Connecting to campus network... [ OK ]',
		'Authenticating member... [ OK ]',
		'Ready.'
	];

	const COLS = 16;
	const ROWS = 9;

	const diamonds = Array.from({ length: COLS * ROWS }, (_, i) => {
		const col = i % COLS;
		const row = Math.floor(i / COLS);
		const dx = col - (COLS - 1) / 2;
		const dy = row - (ROWS - 1) / 2;
		const dist = Math.sqrt(dx * dx + dy * dy);
		return { col, row, dist };
	});
	const maxDist = Math.max(...diamonds.map((d) => d.dist));

	let active = $state(false);
	let revealedLines = $state(/** @type {string[]} */ ([]));
	let showPrompt = $state(false);
	let textFadingOut = $state(false);
	let diamondsGone = $state(false);
	let rippleVisible = $state(false);
	let rippleX = $state(0);
	let rippleY = $state(0);

	/** @type {((value?: any) => void) | undefined} */
	let resolveEnterClick;

	/** @param {MouseEvent} e */
	function handleEnterClick(e) {
		rippleX = e.clientX;
		rippleY = e.clientY;
		rippleVisible = true;
		resolveEnterClick?.();
	}

	/** @param {number} ms */
	function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/** @param {string} line */
	async function typeLine(line) {
		let current = '';
		for (const ch of line) {
			current += ch;
			revealedLines[revealedLines.length - 1] = current;
			await sleep(14);
		}
	}

	async function playSequence() {
		for (const line of LINES) {
			revealedLines.push('');
			revealedLines = revealedLines;
			await typeLine(line);
			await sleep(120);
		}
		await sleep(200);
		showPrompt = true;

		await new Promise((resolve) => {
			resolveEnterClick = resolve;
		});

		await sleep(280);
		textFadingOut = true;
		await sleep(220);
		diamondsGone = true;
		await sleep(600);
		active = false;
		try {
			sessionStorage.setItem('momotech-booted', '1');
		} catch {
			// ignore (private browsing / storage disabled)
		}
		boot.markComplete();
	}

	$effect(() => {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let alreadyBooted = true;
		try {
			alreadyBooted = sessionStorage.getItem('momotech-booted') === '1';
		} catch {
			// treat as already-booted if storage is unavailable
		}
		if (reduceMotion || alreadyBooted) {
			boot.markComplete();
			return;
		}

		active = true;
		tick().then(playSequence);
	});
</script>

{#if active}
	<div class="boot-wrap" aria-hidden="true">
		<div class="boot-diamond-grid" style="--cols: {COLS}; --rows: {ROWS};">
			{#each diamonds as d (d.row + '-' + d.col)}
				<div
					class="boot-diamond"
					class:gone={diamondsGone}
					style="transition-delay: {diamondsGone ? (d.dist / maxDist) * 380 : 0}ms;"
				></div>
			{/each}
		</div>

		<div class="boot-panel" class:fading={textFadingOut}>
			<div class="boot-terminal">
				{#each revealedLines as line, i (i)}
					<div class="boot-line">
						<span class="boot-prompt-char">&gt;</span>
						{line}{#if i === revealedLines.length - 1 && !showPrompt}<span class="boot-caret"></span
							>{/if}
					</div>
				{/each}
			</div>

			{#if showPrompt}
				<button type="button" class="boot-enter" onclick={handleEnterClick}>
					<span class="boot-prompt-char">&gt;</span> ENTER を押して開始
				</button>
			{/if}
		</div>

		{#if rippleVisible}
			<div class="boot-ripple" style="left: {rippleX}px; top: {rippleY}px;"></div>
		{/if}
	</div>
{/if}

<style>
	.boot-wrap {
		position: fixed;
		inset: 0;
		z-index: 20000;
	}

	.boot-diamond-grid {
		position: absolute;
		inset: -10%;
		width: 120%;
		height: 120%;
		display: grid;
		grid-template-columns: repeat(var(--cols), 1fr);
		grid-template-rows: repeat(var(--rows), 1fr);
	}

	.boot-diamond {
		background: linear-gradient(135deg, #0a0a0a 0%, #111827 55%, #0a0a0a 100%);
		transform: scale(1.55) rotate(45deg);
		transition: transform 0.45s cubic-bezier(0.6, 0, 0.3, 1), opacity 0.45s ease;
	}

	.boot-diamond.gone {
		transform: scale(0) rotate(45deg);
		opacity: 0;
	}

	.boot-panel {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(520px, 88vw);
		height: 260px;
		transition: opacity 0.2s ease;
	}

	.boot-panel.fading {
		opacity: 0;
	}

	.boot-terminal {
		font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
		font-size: 0.85rem;
		line-height: 1.9;
		color: #67e8f9;
		text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
	}

	.boot-line {
		white-space: pre;
	}

	.boot-prompt-char {
		color: #06b6d4;
		margin-right: 0.5em;
	}

	.boot-caret {
		display: inline-block;
		width: 0.55em;
		height: 1em;
		margin-left: 2px;
		background: #67e8f9;
		vertical-align: -0.15em;
		animation: boot-blink 0.9s steps(1) infinite;
	}

	@keyframes boot-blink {
		0%,
		49% {
			opacity: 1;
		}
		50%,
		100% {
			opacity: 0;
		}
	}

	.boot-enter {
		position: absolute;
		left: 0;
		top: 210px;
		font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
		font-size: 0.85rem;
		color: #e5e7eb;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		opacity: 0;
		animation: boot-prompt-in 0.4s ease forwards;
	}

	.boot-enter:hover,
	.boot-enter:focus-visible {
		color: #67e8f9;
	}

	@keyframes boot-prompt-in {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.boot-ripple {
		position: fixed;
		width: 8px;
		height: 8px;
		margin: -4px 0 0 -4px;
		border-radius: 50%;
		border: 2px solid #67e8f9;
		pointer-events: none;
		animation: boot-ripple-out 0.5s ease-out forwards;
	}

	@keyframes boot-ripple-out {
		from {
			transform: scale(1);
			opacity: 1;
		}
		to {
			transform: scale(6);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.boot-wrap {
			display: none;
		}
	}
</style>
