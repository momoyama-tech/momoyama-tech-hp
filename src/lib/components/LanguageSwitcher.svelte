<script>
	import { language, setLanguage } from '$lib/stores/language.svelte.js';

	// Prevent toggle from triggering immediately on mount or unintended clicks
	/**
	 * @param {KeyboardEvent} event
	 * @param {'JP' | 'EN'} lang
	 */
	function handleKeydown(event, lang) {
		if (event.key === 'Enter' || event.key === ' ') {
			setLanguage(lang);
		}
	}
</script>

<div class="relative flex h-8 w-32 items-center rounded-full bg-[rgba(0,0,0,0.05)] p-0.5">
	<!-- Animated Background (White Pill) -->
	<div
		class="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]"
		style="left: {language.current === 'JP' ? '2px' : 'calc(50% + 0px)'}"
	></div>

	<!-- JP Button -->
	<button
		onclick={() => setLanguage('JP')}
		class="z-10 flex w-1/2 cursor-pointer justify-center text-[11px] tracking-tight transition-colors duration-200"
		class:font-bold={language.current === 'JP'}
		class:text-[#1D1D1F]={language.current === 'JP'}
		class:font-medium={language.current === 'EN'}
		class:text-[#86868b]={language.current === 'EN'}
		style="font-family: 'Inter', sans-serif;"
	>
		JP
	</button>

	<!-- EN Button -->
	<button
		onclick={() => setLanguage('EN')}
		class="z-10 flex w-1/2 cursor-pointer justify-center text-[11px] tracking-tight transition-colors duration-200"
		class:font-bold={language.current === 'EN'}
		class:text-[#1D1D1F]={language.current === 'EN'}
		class:font-medium={language.current === 'JP'}
		class:text-[#86868b]={language.current === 'JP'}
		style="font-family: 'Inter', sans-serif;"
	>
		EN
	</button>
</div>
