<script>
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	// Direct import to avoid SSR issues
	import ExternalLink from 'lucide-svelte/icons/external-link';

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
</script>

<a
	href={project.url}
	target="_blank"
	rel="noopener noreferrer"
	class="project-card group block overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-2"
	style="background: rgba(255, 255, 255, 0.5); backdrop-filter: blur(50px); border: 1px solid rgba(243, 244, 246, 1); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);"
>
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
				class="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50"
			>
				<span class="text-6xl opacity-30">📁</span>
			</div>
		{/if}

		<!-- Category Badge -->
		{#if project.category}
			<div class="absolute left-4 top-4">
				<span
					class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm"
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
				class="flex h-8 w-8 items-center justify-center rounded-full"
				style="background: rgba(255,255,255,0.9);"
			>
				<ExternalLink class="h-4 w-4" style="color: #1D1D1F;" />
			</span>
		</div>
	</div>

	<!-- Content -->
	<div class="p-6">
		<h3 class="mb-2 text-lg font-semibold transition-colors" style="color: #1D1D1F;">
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
			<p class="text-xs" style="color: #8B8B8B;">
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
