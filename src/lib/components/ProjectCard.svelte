<script>
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	// Direct import to avoid SSR issues
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import { theme } from '$lib/stores/theme.svelte.js';

	/**
	 * @type {{
	 *   project: {
	 *     id: string;
	 *     title: string;
	 *     description: string;
	 *     category: string;
	 *     coverUrl: string | null;
	 *     tags: string[];
	 *     url: string;
	 *     creator: string;
	 *   }
	 * }}
	 */
	let { project } = $props();

	/**
	 * @param {any} e
	 */
	function handleImageError(e) {
		e.currentTarget.style.display = 'none';
	}

	let parallaxX = $state(0);
	let parallaxY = $state(0);
	/** @type {HTMLElement} */
	let cardElement;

	/** @param {MouseEvent} e */
	function handleMouseMove(e) {
		if (!cardElement) return;
		const rect = cardElement.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		// Inverse movement for depth
		parallaxX = (x - centerX) / 20;
		parallaxY = (y - centerY) / 20;
	}

	function handleMouseLeave() {
		parallaxX = 0;
		parallaxY = 0;
	}
</script>

<a
	href={project.url}
	target="_blank"
	rel="noopener noreferrer"
	bind:this={cardElement}
	onmousemove={handleMouseMove}
	onmouseleave={handleMouseLeave}
	class="project-card group block overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-2 dark:bg-zinc-900/40 dark:border-white/10 dark:backdrop-blur-xl dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] relative"
	class:border-glow={theme.isScanLineActive}
	style="background: rgba(255, 255, 255, 0.5); backdrop-filter: blur(50px); border: 1px solid rgba(243, 244, 246, 1); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);"
>
	<!-- Decorative Parallax Grid (Dark Mode Only) -->
	<div
		class="absolute inset-0 pointer-events-none opacity-0 dark:group-hover:opacity-20 transition-opacity duration-500 z-0 overflow-hidden"
	>
		<div
			class="absolute inset-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:24px_24px]"
			style="transform: translate({-parallaxX}px, {-parallaxY}px); transition: transform 0.1s; will-change: transform;"
		></div>
	</div>

	<!-- Cover Image -->
	<div class="relative aspect-[4/3] overflow-hidden" style="background-color: #F5F5F7;">
		{#if project.coverUrl}
			<img
				src={project.coverUrl}
				alt={project.title}
				loading="lazy"
				onerror={handleImageError}
				class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
			/>
		{:else}
			<div
				class="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-zinc-900 dark:to-black"
			>
				<span
					class="text-6xl opacity-30 dark:opacity-80 dark:text-cyan-400 dark:drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]"
					>📁</span
				>
			</div>
		{/if}

		<!-- Category Badge -->
		{#if project.category}
			<div class="absolute left-4 top-4">
				<span
					class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-500/30"
					style="background: rgba(255,255,255,0.9); color: #1D1D1F;"
				>
					{project.category}
				</span>
			</div>
		{/if}

		<!-- External link indicator -->
		<div
			class="absolute right-4 top-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
		>
			<span
				class="flex h-8 w-8 items-center justify-center rounded-full dark:bg-cyan-500 dark:text-black"
				style="background: rgba(255,255,255,0.9);"
			>
				<ExternalLink class="h-4 w-4" style="color: #1D1D1F;" />
			</span>
		</div>
	</div>

	<!-- Content -->
	<div class="p-6">
		<h3
			class="mb-2 text-lg font-semibold transition-colors dark:text-zinc-100 dark:text-glow"
			style="color: #1D1D1F;"
		>
			{project.title}
		</h3>

		{#if project.description}
			<div
				class="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out group-hover:grid-rows-[1fr]"
			>
				<div class="overflow-hidden">
					<p class="mb-3 pt-2 text-sm" style="color: #6B6B6B;">
						{project.description}
					</p>
				</div>
			</div>
		{/if}

		<!-- Creator -->
		{#if project.creator}
			<p class="text-xs dark:text-zinc-500" style="color: #8B8B8B;">
				by {project.creator}
			</p>
		{/if}

		<!-- Tags -->
		{#if project.tags && project.tags.length > 0}
			<div class="mt-3 flex flex-wrap gap-2">
				{#each project.tags.slice(0, 3) as tag}
					<span
						class="inline-block rounded-full px-2 py-0.5 text-xs"
						style="background: #F0F0F5; color: #6B6B6B;"
					>
						{tag}
					</span>
				{/each}
			</div>
		{/if}
	</div>
</a>

<style>
	.project-card {
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
	}

	.project-card:hover {
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
	}
</style>
