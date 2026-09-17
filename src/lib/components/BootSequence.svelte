<script>
	// One-time "boot sequence" shown on the first page of a browser session
	// (gated by sessionStorage, not localStorage — reappears on a fresh
	// session/tab, not on every navigation within one visit). Pure DOM +
	// CSS/JS-timed text reveal, no View Transitions, no dependency on the
	// navigation lifecycle — plays exactly once regardless of which page
	// the visitor lands on first, then fades away for good this session.
	//
	// The "cursor" is a fake element, not the real OS pointer — no web API
	// can move that. The illusion is sold by hiding the real cursor
	// (cursor: none) over the overlay and starting the fake one from the
	// visitor's actual last known pointer position (tracked via
	// pointermove), so it looks like their own cursor gets taken over
	// rather than a random dot appearing.
	import { onMount, tick } from 'svelte';
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
	let cursorVisible = $state(false);
	let cursorTravel = $state(false);
	let cursorClicking = $state(false);
	let textFadingOut = $state(false);
	let diamondsGone = $state(false);

	let cursorX = $state(0);
	let cursorY = $state(0);

	/** @type {HTMLDivElement | undefined} */
	let enterEl = $state();

	let lastPointerX = 0;
	let lastPointerY = 0;
	/** @param {PointerEvent} e */
	function trackPointer(e) {
		lastPointerX = e.clientX;
		lastPointerY = e.clientY;
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
		await sleep(500);

		// Start the fake cursor exactly where the visitor's real cursor last
		// was, then animate it over to the ENTER prompt.
		cursorX = lastPointerX || window.innerWidth / 2;
		cursorY = lastPointerY || window.innerHeight / 2;
		cursorVisible = true;
		await tick();
		const target = enterEl?.getBoundingClientRect();
		await sleep(30);
		cursorTravel = true;
		if (target) {
			cursorX = target.left + 8;
			cursorY = target.top + target.height / 2;
		}
		await sleep(750);
		cursorClicking = true;
		await sleep(260);

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

	onMount(() => {
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

		window.addEventListener('pointermove', trackPointer);
		active = true;
		playSequence().finally(() => {
			window.removeEventListener('pointermove', trackPointer);
		});

		return () => window.removeEventListener('pointermove', trackPointer);
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
				<div class="boot-enter" bind:this={enterEl}>
					<span class="boot-prompt-char">&gt;</span> ENTER を押して開始
				</div>
			{/if}
		</div>

		{#if cursorVisible}
			<svg
				class="boot-cursor"
				class:travel={cursorTravel}
				class:click={cursorClicking}
				style="left: {cursorX}px; top: {cursorY}px;"
				viewBox="0 0 24 24"
				width="22"
				height="22"
			>
				<path
					d="M4 2 L4 19 L8.3 15.2 L11 21.2 L13.6 20 L11 14 L18 14 Z"
					fill="#ffffff"
					stroke="#0a0a0a"
					stroke-width="1.3"
					stroke-linejoin="round"
				/>
			</svg>
		{/if}
	</div>
{/if}

<style>
	.boot-wrap {
		position: fixed;
		inset: 0;
		z-index: 20000;
		cursor: none;
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
		opacity: 0;
		animation: boot-prompt-in 0.4s ease forwards;
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

	.boot-cursor {
		position: fixed;
		transform: translate(-3px, -2px) scale(1);
		transform-origin: 4px 2px;
		filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 10px rgba(6, 182, 212, 0.6));
		pointer-events: none;
	}

	.boot-cursor.travel {
		transition: left 0.75s cubic-bezier(0.65, 0, 0.35, 1), top 0.75s cubic-bezier(0.65, 0, 0.35, 1);
	}

	.boot-cursor.click {
		transform: translate(-3px, -2px) scale(0.85);
		transition: transform 0.15s ease;
	}

	@media (prefers-reduced-motion: reduce) {
		.boot-wrap {
			display: none;
		}
	}
</style>
