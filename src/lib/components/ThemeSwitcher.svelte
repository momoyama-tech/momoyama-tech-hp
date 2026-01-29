<script>
	import { theme } from '$lib/stores/theme.svelte.js';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
</script>

<button
	onclick={theme.toggle}
	class="relative flex h-8 w-16 items-center rounded-full bg-gray-100 p-0.5 shadow-inner transition-colors duration-500 dark:bg-gray-800"
	aria-label="Toggle Theme"
>
	<!-- Toggle Pill -->
	<div
		class="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-white shadow-sm transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] dark:bg-gray-700"
		style="left: {theme.isDark ? 'calc(50% + 0px)' : '2px'}"
	></div>

	<!-- Icons -->
	<div
		class="z-10 flex w-1/2 items-center justify-center transition-opacity duration-300"
		class:opacity-50={theme.isDark}
		class:opacity-100={!theme.isDark}
	>
		<Sun class="h-4 w-4 text-gray-600" />
	</div>
	<div
		class="z-10 flex w-1/2 items-center justify-center transition-opacity duration-300"
		class:opacity-50={!theme.isDark}
		class:opacity-100={theme.isDark}
	>
		<Moon class="h-4 w-4 text-cyan-400" />
	</div>
</button>
