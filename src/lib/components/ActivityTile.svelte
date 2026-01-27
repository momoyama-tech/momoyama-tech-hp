<script>
	import { fly, scale, fade } from 'svelte/transition';
	import { cubicOut, quintOut } from 'svelte/easing';
	// Direct imports to avoid SSR issues
	import Cog from 'lucide-svelte/icons/cog';
	import Palette from 'lucide-svelte/icons/palette';
	import Sparkles from 'lucide-svelte/icons/sparkles';

	/** @type {{ title: string, description: string, iconType?: 'cog' | 'palette' | 'sparkles' }} */
	let { title, description, iconType = 'cog' } = $props();

	let isHovered = $state(false);

	/** @type {Record<string, any>} */
	const icons = {
		cog: Cog,
		palette: Palette,
		sparkles: Sparkles
	};

	/** @type {Record<string, string>} */
	const iconColors = {
		cog: 'bg-blue-100',
		palette: 'bg-purple-100',
		sparkles: 'bg-pink-100'
	};

	const IconComponent = $derived(icons[/** @type {keyof typeof icons} */ (iconType)] || Cog);
	const iconBgColor = $derived(
		iconColors[/** @type {keyof typeof iconColors} */ (iconType)] || 'bg-blue-100'
	);
</script>

<div
	class="activity-tile group relative h-80 w-full cursor-pointer overflow-hidden rounded-3xl p-8 text-left transition-all duration-500 ease-out hover:-translate-y-2"
	style="background: rgba(255, 255, 255, 0.5); backdrop-filter: blur(50px); border: 1px solid rgba(243, 244, 246, 1); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);"
	role="article"
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
>
	<!-- Subtle gradient overlay on hover -->
	<div
		class="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
	></div>

	<!-- Content -->
	<div class="relative z-10 flex h-full flex-col justify-between">
		<div
			class="flex h-14 w-14 items-center justify-center rounded-2xl {iconBgColor} transition-all duration-300 group-hover:scale-110"
		>
			<IconComponent class="h-7 w-7 text-gray-700" />
		</div>

		<div>
			<h3
				class="mb-3 whitespace-pre-line text-2xl font-semibold leading-tight tracking-tight"
				style="color: #1D1D1F;"
			>
				{title}
			</h3>
			{#if isHovered}
				<p
					class="text-sm leading-relaxed"
					style="color: #6B6B6B;"
					in:fly={{ y: 20, duration: 400, easing: quintOut }}
					out:fade={{ duration: 200 }}
				>
					{description}
				</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.activity-tile {
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
		transform-style: preserve-3d;
		will-change: transform;
	}

	.activity-tile:hover {
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
	}
</style>
