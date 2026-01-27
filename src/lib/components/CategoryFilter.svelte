<script>
	import { fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	/**
	 * @type {{
	 *   categories: string[];
	 *   selectedCategory: string;
	 *   onSelect: (category: string) => void;
	 * }}
	 */
	let { categories, selectedCategory = 'All', onSelect } = $props();

	const allCategories = $derived(['All', ...categories]);
</script>

<div class="flex flex-wrap justify-center gap-3">
	{#each allCategories as category (category)}
		<button
			class="relative overflow-hidden rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 {selectedCategory ===
			category
				? 'bg-black text-white shadow-lg dark:bg-white dark:text-black'
				: 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'}"
			onclick={() => onSelect(category)}
		>
			<span class="relative z-10">{category}</span>

			<!-- Active indicator dot -->
			{#if selectedCategory === category}
				<span
					class="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white dark:bg-black"
					in:scale={{ duration: 200, easing: cubicOut }}
				></span>
			{/if}
		</button>
	{/each}
</div>
