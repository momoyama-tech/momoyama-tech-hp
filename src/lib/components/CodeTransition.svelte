<script>
	// Page transition: the current screen's own text dissolves into
	// scrambled, code-like characters before navigating away, and the
	// destination's real text "decrypts" back in from the same scrambled
	// state on arrival — one shared character-scramble animator
	// (textScramble.js) driving both halves, just read in reverse.
	//
	// Navigation itself still ends in a real, full `window.location.href`
	// change (not a SvelteKit client-side route change) — same pattern
	// already proven safe by the sphere nav's camera-zoom-then-navigate
	// flow. Repeated *client-side* navigation is what corrupted Chrome's
	// GPU compositor in the past (see layout.css); a delayed but still real
	// full reload doesn't reintroduce that.
	import { onMount } from 'svelte';
	import { scrambleTransition } from '$lib/utils/textScramble.js';

	let busy = false;

	onMount(() => {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduceMotion) return;

		busy = true;
		document.body.classList.add('code-transition-active');
		scrambleTransition(document.body, {
			direction: 'toReal',
			duration: 380,
			onDone: () => {
				document.body.classList.remove('code-transition-active');
				busy = false;
			}
		});

		/** @param {MouseEvent} e */
		function handleClick(e) {
			if (busy || e.defaultPrevented || e.button !== 0) return;
			if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

			const anchor = /** @type {HTMLAnchorElement | null} */ (
				e.target instanceof Element ? e.target.closest('a[href]') : null
			);
			if (!anchor) return;

			const href = anchor.getAttribute('href');
			if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
			if (anchor.hasAttribute('download')) return;
			if (anchor.target && anchor.target !== '_self') return;

			/** @type {URL} */
			let url;
			try {
				url = new URL(href, window.location.href);
			} catch {
				return;
			}
			if (url.origin !== window.location.origin) return;
			if (url.pathname === window.location.pathname && url.search === window.location.search) return;

			e.preventDefault();
			busy = true;
			document.body.classList.add('code-transition-active');
			scrambleTransition(document.body, {
				direction: 'toCode',
				duration: 280,
				onDone: () => {
					window.location.href = url.href;
				}
			});
		}

		document.addEventListener('click', handleClick);
		return () => document.removeEventListener('click', handleClick);
	});
</script>

<style>
	:global(body.code-transition-active),
	:global(body.code-transition-active *) {
		font-family: 'SF Mono', 'Menlo', 'Consolas', monospace !important;
	}
</style>
