<script>
	// One-time "boot sequence" shown on the first page of a browser session
	// (gated by sessionStorage, not localStorage — reappears on a fresh
	// session/tab, not on every navigation within one visit). Pure DOM +
	// CSS/JS-timed text reveal, no View Transitions, no dependency on the
	// navigation lifecycle — plays exactly once regardless of which page
	// the visitor lands on first, then fades away for good this session.
	import { onMount } from 'svelte';

	const LINES = [
		'MOMOYAMA TECH SYSTEM v2.0',
		'Booting...',
		'Loading modules... [ OK ]',
		'Connecting to campus network... [ OK ]',
		'Authenticating member... [ OK ]',
		'Ready.'
	];

	let active = $state(false);
	let revealedLines = $state(/** @type {string[]} */ ([]));
	let showPrompt = $state(false);
	let cursorClicking = $state(false);
	let fadingOut = $state(false);

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
		await sleep(650);
		cursorClicking = true;
		await sleep(280);
		fadingOut = true;
		await sleep(450);
		active = false;
		try {
			sessionStorage.setItem('momotech-booted', '1');
		} catch {
			// ignore (private browsing / storage disabled)
		}
	}

	onMount(() => {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let alreadyBooted = true;
		try {
			alreadyBooted = sessionStorage.getItem('momotech-booted') === '1';
		} catch {
			// treat as already-booted if storage is unavailable
		}
		if (reduceMotion || alreadyBooted) return;

		active = true;
		playSequence();
	});
</script>

{#if active}
	<div class="boot-wrap" class:fading={fadingOut} aria-hidden="true">
		<div class="boot-panel">
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
				<div class="boot-enter">
					<span class="boot-prompt-char">&gt;</span> ENTER を押して開始
				</div>
			{/if}

			<div class="boot-cursor" class:click={cursorClicking}></div>
		</div>
	</div>
{/if}

<style>
	.boot-wrap {
		position: fixed;
		inset: 0;
		z-index: 20000;
		background: #0a0a0a;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: opacity 0.45s ease;
	}

	.boot-wrap.fading {
		opacity: 0;
	}

	.boot-panel {
		position: relative;
		width: min(520px, 88vw);
		height: 260px;
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
		position: absolute;
		width: 14px;
		height: 14px;
		border: 2px solid #67e8f9;
		border-radius: 50%;
		box-shadow: 0 0 12px rgba(6, 182, 212, 0.7);
		left: 50%;
		top: 60%;
		transform: translate(-50%, -50%) scale(1);
		opacity: 0;
		animation: boot-cursor-travel 0.9s cubic-bezier(0.65, 0, 0.35, 1) 0.85s forwards;
	}

	.boot-cursor.click {
		animation: none;
		left: 88px;
		top: 218px;
		opacity: 1;
		transform: translate(-50%, -50%) scale(0.6);
		transition: transform 0.15s ease;
	}

	@keyframes boot-cursor-travel {
		0% {
			left: 50%;
			top: 60%;
			opacity: 0;
			transform: translate(-50%, -50%) scale(1);
		}
		15% {
			opacity: 1;
		}
		100% {
			left: 88px;
			top: 218px;
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}
</style>
