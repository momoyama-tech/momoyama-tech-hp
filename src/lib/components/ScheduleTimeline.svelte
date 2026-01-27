<script>
	import { fly, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	// Direct imports to avoid SSR issues
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import Calendar from 'lucide-svelte/icons/calendar';

	/**
	 * @type {{
	 *   monthGroups: Array<{
	 *     month: string;
	 *     label: string;
	 *     events: Array<{
	 *       id: string;
	 *       title: string;
	 *       date: string;
	 *       description: string;
	 *     }>
	 *   }>
	 * }}
	 */
	let { monthGroups } = $props();

	// Use $derived for initial value to fix reactive reference warning
	const initialMonth = $derived(monthGroups[0]?.month);
	let expandedMonths = $state(new Set());

	/**
	 * @param {string} month
	 */
	function toggleMonth(month) {
		if (expandedMonths.has(month)) {
			expandedMonths.delete(month);
		} else {
			expandedMonths.add(month);
		}
		expandedMonths = new Set(expandedMonths);
	}

	/**
	 * Format date for display
	 * @param {string} dateStr
	 */
	function formatDay(dateStr) {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return date.toLocaleDateString('ja-JP', { day: 'numeric' });
	}
</script>

<div class="relative">
	<!-- Timeline line -->
	<div
		class="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-purple-200 via-blue-200 to-transparent"
	></div>

	<div class="space-y-4">
		{#each monthGroups as group, i}
			<div
				class="relative pl-14"
				in:fly={{ x: -20, delay: i * 50, duration: 300, easing: cubicOut }}
			>
				<!-- Timeline dot -->
				<div
					class="absolute left-3.5 top-3.5 h-3 w-3 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 ring-4 ring-white"
				></div>

				<!-- Month header -->
				<button
					class="month-header flex w-full items-center justify-between rounded-xl bg-white px-5 py-4 text-left transition-all duration-300 hover:-translate-y-1"
					onclick={() => toggleMonth(group.month)}
				>
					<span class="font-medium" style="color: #6B6B6B;">
						{group.label}
					</span>
					<span class="flex items-center gap-2 text-sm" style="color: #8B8B8B;">
						<span class="rounded-full bg-purple-100 px-2 py-0.5 text-xs" style="color: #6B6B6B;"
							>{group.events.length}</span
						>
						<ChevronDown
							class="h-4 w-4 transition-transform duration-300"
							style="transform: {expandedMonths.has(group.month) ? 'rotate(180deg)' : 'rotate(0)'}"
						/>
					</span>
				</button>

				<!-- Events - past events with reduced opacity -->
				{#if expandedMonths.has(group.month)}
					<div class="mt-3 space-y-2" transition:slide={{ duration: 250, easing: cubicOut }}>
						{#each group.events as event}
							<div
								class="past-event rounded-xl bg-white p-4 transition-opacity"
								style="opacity: 0.5;"
							>
								<div class="flex items-start gap-3">
									<span
										class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-medium"
										style="color: #6B6B6B;"
									>
										{formatDay(event.date)}
									</span>
									<div>
										<h4 class="font-medium" style="color: #6B6B6B;">
											{event.title}
										</h4>
										{#if event.description}
											<p class="mt-1 text-sm" style="color: #8B8B8B;">
												{event.description}
											</p>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>

	{#if monthGroups.length === 0}
		<div
			class="rounded-3xl bg-white p-12 text-center"
			style="box-shadow: 0 4px 20px rgba(0,0,0,0.06);"
		>
			<div class="mx-auto h-16 w-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
				<Calendar class="h-8 w-8" style="color: #6B6B6B;" />
			</div>
			<p style="color: #6B6B6B;">過去の活動記録はありません</p>
		</div>
	{/if}
</div>

<style>
	.month-header {
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
	}

	.month-header:hover {
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
	}

	.past-event {
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
	}

	.past-event:hover {
		opacity: 0.7 !important;
	}
</style>
