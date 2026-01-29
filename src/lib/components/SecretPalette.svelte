<script>
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let isOpen = $state(false);

	// Terminal State
	/** @type {string[]} */
	let lines = $state([]);
	let showPrompt = $state(false);
	let typedMessage = $state('');
	let showCursor = $state(true);
	let isClosing = $state(false);

	/** @type {NodeJS.Timeout} */
	let typingInterval;
	/** @type {NodeJS.Timeout} */
	let blinkInterval;
	/** @type {NodeJS.Timeout} */
	let sequenceTimeout;
	/** @type {NodeJS.Timeout} */
	let autoCloseTimeout;

	const targetMessage = 'よく見つけましたね。暇人ですか？';

	/** @param {KeyboardEvent} e */
	function handleKeydown(e) {
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault();
			toggleOpen();
		}
		if (e.key === 'Escape' && isOpen) {
			close();
		}
	}

	function toggleOpen() {
		if (isOpen) {
			close();
		} else {
			open();
		}
	}

	function open() {
		if (isOpen) return;
		isOpen = true;
		isClosing = false;
		lines = [];
		showPrompt = false;
		typedMessage = '';

		// Boot Sequence
		sequenceTimeout = setTimeout(() => {
			lines = [...lines, '[SYSTEM CHECKING...]'];
			sequenceTimeout = setTimeout(() => {
				lines = [...lines, '[ACCESS GRANTED]'];
				sequenceTimeout = setTimeout(() => {
					showPrompt = true;
					startTyping();
				}, 400); // Delay before prompt
			}, 600); // Delay before access granted
		}, 600); // Delay after CRT turn on
	}

	function close() {
		if (!isOpen || isClosing) return;
		isClosing = true; // Trigger turn-off animation
		if (typingInterval) clearTimeout(typingInterval);
		if (sequenceTimeout) clearTimeout(sequenceTimeout);
		if (autoCloseTimeout) clearTimeout(autoCloseTimeout);

		// Wait for animation to finish before unmounting
		setTimeout(() => {
			isOpen = false;
			isClosing = false;
			lines = [];
			showPrompt = false;
			typedMessage = '';
		}, 400);
	}

	function startTyping() {
		let index = 0;
		if (typingInterval) clearTimeout(typingInterval);

		function type() {
			if (index < targetMessage.length) {
				typedMessage += targetMessage[index];
				index++;
				// Variable typing speed
				const delay = 50 + Math.random() * 150;
				typingInterval = setTimeout(type, delay);
			} else {
				// Auto-close after 3 seconds
				autoCloseTimeout = setTimeout(() => {
					close();
				}, 3000);
			}
		}
		type();
	}

	onMount(() => {
		blinkInterval = setInterval(() => {
			showCursor = !showCursor;
		}, 500);
	});

	onDestroy(() => {
		if (typingInterval) clearTimeout(typingInterval);
		if (blinkInterval) clearInterval(blinkInterval);
		if (sequenceTimeout) clearTimeout(sequenceTimeout);
		if (autoCloseTimeout) clearTimeout(autoCloseTimeout);
	});

	// Custom transition for CRT Turn On
	/** @param {HTMLElement} node */
	function crtTurnOn(node, { duration = 400 }) {
		return {
			duration,
			css: (/** @type {number} */ t) => {
				const eased = quintOut(t);
				// Unfold width then height
				// t goes 0 -> 1
				// 0-0.5: Scale X small->1, Scale Y very small
				// 0.5-1: Scale Y -> 1

				// Simplified single stage expand for better feel with backdrop
				return `
					transform: scale(${0.01 + 0.99 * eased}, ${0.005 + 0.995 * eased});
					opacity: ${t};
				`;
			}
		};
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm"
		onclick={close}
		onkeydown={(e) => e.key === 'Escape' && close()}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		transition:fade={{ duration: 200 }}
	>
		<!-- CRT Container -->
		<div
			class="relative w-full max-w-2xl overflow-hidden rounded-md bg-black border border-[#00ff00] crt-container"
			class:crt-off={isClosing}
			onclick={(e) => e.stopPropagation()}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Escape' && close()}
			style="box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);"
		>
			<!-- CRT Scanlines Overlay -->
			<div class="pointer-events-none absolute inset-0 z-20 scanlines"></div>

			<!-- Window Chrome (macOS Style but Retro) -->
			<div
				class="relative z-10 flex h-8 items-center border-b border-[#00ff00]/30 bg-[#001100] px-4"
			>
				<div class="flex gap-2">
					<div class="h-3 w-3 rounded-full bg-red-500/80"></div>
					<div class="h-3 w-3 rounded-full bg-yellow-500/80"></div>
					<div class="h-3 w-3 rounded-full bg-green-500/80"></div>
				</div>
				<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
					<span class="font-mono text-xs text-[#00ff00]/60 tracking-widest">TERMINAL - ROOT</span>
				</div>
			</div>

			<!-- Terminal Content -->
			<div class="relative z-10 min-h-[300px] p-6 font-mono text-lg text-[#00ff00]">
				<!-- Boot Sequence -->
				{#each lines as line}
					<div class="mb-1">{line}</div>
				{/each}

				<!-- Prompt area -->
				{#if showPrompt}
					<div class="mb-1 flex flex-wrap break-all">
						<span class="mr-2 text-[#00ff00]">root@momoyama-tech:~$</span>
						<span class="text-[#00ff00] drop-shadow-[0_0_5px_rgba(0,255,0,0.8)]">
							{typedMessage}
							{#if showCursor}
								<span class="inline-block bg-[#00ff00] w-[10px] h-[20px] align-middle blink"></span>
							{:else}
								<span class="inline-block w-[10px] h-[20px] align-middle"></span>
							{/if}
						</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	/* CRT Animation Class logic is mainly handled by transitions or CSS classes triggered by state */
	.crt-container {
		/* Default Open Animation */
		animation: turnOn 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards;
		transform-origin: center;
	}

	.crt-off {
		animation: turnOff 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards;
	}

	@keyframes turnOn {
		0% {
			transform: scale(1, 0.002) skewX(0deg);
			opacity: 0;
		}
		50% {
			transform: scale(1, 0.002) skewX(0deg);
			opacity: 1;
		}
		100% {
			transform: scale(1, 1) skewX(0deg);
			opacity: 1;
		}
	}

	@keyframes turnOff {
		0% {
			transform: scale(1, 1);
			opacity: 1;
		}
		50% {
			transform: scale(1, 0.002);
			opacity: 1;
		}
		100% {
			transform: scale(0, 0);
			opacity: 0;
		}
	}

	.scanlines {
		background: linear-gradient(to bottom, rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
		background-size: 100% 4px;
		animation: scanline 10s linear infinite;
	}

	/* Flicker effect for text glow */
	.blink {
		box-shadow: 0 0 10px #00ff00;
	}
</style>
