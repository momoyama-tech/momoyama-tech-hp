<script>
	import { fly, scale } from 'svelte/transition';
	import { cubicOut, quintOut } from 'svelte/easing';
	// Direct imports to avoid SSR issues
	import Calendar from 'lucide-svelte/icons/calendar';
	import MapPin from 'lucide-svelte/icons/map-pin';

	/**
	 * @type {{
	 *   featured: {
	 *     id: string;
	 *     title: string;
	 *     date: string;
	 *     description: string;
	 *     location: string;
	 *   } | null;
	 *   upcoming: Array<{
	 *     id: string;
	 *     title: string;
	 *     date: string;
	 *     description: string;
	 *     location: string;
	 *   }>
	 * }}
	 */
	let { featured, upcoming } = $props();

	/**
	 * Format date for display
	 * @param {string} dateStr
	 */
	function formatDate(dateStr) {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return date.toLocaleDateString('ja-JP', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			weekday: 'short'
		});
	}

	/**
	 * Get days until event
	 * @param {string} dateStr
	 */
	function getDaysUntil(dateStr) {
		if (!dateStr) return null;
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const eventDate = new Date(dateStr);
		eventDate.setHours(0, 0, 0, 0);
		const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
		return diff;
	}
</script>

<div class="space-y-6">
	<!-- Featured (1) - Highlighted with gradient -->
	{#if featured}
		{@const daysUntil = getDaysUntil(featured.date)}
		<div
			class="featured-card group relative overflow-hidden rounded-3xl p-8"
			in:fly={{ y: 30, duration: 500, easing: cubicOut }}
		>
			<!-- Gradient Background -->
			<div
				class="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-90"
			></div>

			<!-- Subtle pattern overlay -->
			<div
				class="absolute inset-0 opacity-10"
				style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"
			></div>

			<div class="relative z-10 text-white">
				<!-- Date badge -->
				<div class="mb-5 flex flex-wrap items-center gap-3">
					<span
						class="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm"
					>
						<Calendar class="h-4 w-4" />
						{formatDate(featured.date)}
					</span>
					{#if daysUntil !== null && daysUntil >= 0}
						<span
							class="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-bold"
							style="color: #1D1D1F;"
							in:scale={{ duration: 300, easing: cubicOut }}
						>
							{#if daysUntil === 0}
								🔥 TODAY
							{:else if daysUntil === 1}
								TOMORROW
							{:else}
								あと{daysUntil}日
							{/if}
						</span>
					{/if}
				</div>

				<!-- Title -->
				<h3 class="mb-3 text-2xl font-semibold">{featured.title}</h3>

				<!-- Description -->
				{#if featured.description}
					<p class="mb-4 text-white/80">{featured.description}</p>
				{/if}

				<!-- Location -->
				{#if featured.location}
					<div class="flex items-center gap-2 text-sm text-white/60">
						<MapPin class="h-4 w-4" />
						<span>{featured.location}</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Upcoming (3) - List format with white cards -->
	{#if upcoming.length > 0}
		<div class="space-y-3">
			{#each upcoming as event, i}
				<div
					class="upcoming-card flex items-center gap-6 rounded-2xl bg-white p-5 transition-all duration-300 hover:-translate-y-1"
					in:fly={{ y: 20, delay: 100 + i * 50, duration: 400, easing: cubicOut }}
				>
					<div
						class="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100"
					>
						<div class="text-xl font-bold leading-none" style="color: #1D1D1F;">
							{new Date(event.date).getDate()}
						</div>
						<div class="text-[10px] uppercase tracking-wide" style="color: #6B6B6B;">
							{new Date(event.date).toLocaleDateString('ja-JP', { month: 'short' })}
						</div>
					</div>
					<div class="flex-1 min-w-0">
						<h4 class="font-medium truncate" style="color: #1D1D1F;">{event.title}</h4>
						{#if event.location}
							<p class="flex items-center gap-1 text-sm mt-1" style="color: #6B6B6B;">
								<MapPin class="h-3 w-3" />
								{event.location}
							</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if !featured && upcoming.length === 0}
		<div
			class="rounded-3xl bg-white p-12 text-center"
			style="box-shadow: 0 4px 20px rgba(0,0,0,0.06);"
		>
			<div class="mx-auto h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
				<Calendar class="h-8 w-8" style="color: #6B6B6B;" />
			</div>
			<p style="color: #6B6B6B;">今後の予定はありません</p>
		</div>
	{/if}
</div>

<style>
	.featured-card {
		box-shadow: 0 8px 30px rgba(99, 102, 241, 0.3);
	}

	.upcoming-card {
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
	}

	.upcoming-card:hover {
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
	}
</style>
