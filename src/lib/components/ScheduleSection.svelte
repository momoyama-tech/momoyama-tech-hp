<script>
	import ScheduleTimeline from './ScheduleTimeline.svelte';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	// Direct imports to avoid SSR issues
	import Calendar from 'lucide-svelte/icons/calendar';
	import MapPin from 'lucide-svelte/icons/map-pin';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import Rocket from 'lucide-svelte/icons/rocket';
	import Clock from 'lucide-svelte/icons/clock';

	/**
	 * @type {{
	 *   scheduleData: {
	 *     nextEvent: any;
	 *     upcomingEvents: any[];
	 *   };
	 *   pastEventsByMonth: Array<any>;
	 * }}
	 */
	let { scheduleData, pastEventsByMonth } = $props();

	let showHistory = $state(false);

	/**
	 * @param {string} dateStr
	 */
	function formatDate(dateStr) {
		if (!dateStr) return 'TBD';
		const date = new Date(dateStr);
		return date.toLocaleDateString('ja-JP', {
			month: 'short',
			day: 'numeric',
			weekday: 'short'
		});
	}

	/**
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

	// Helper for pastel dots
	/**
	 * @param {string} type
	 */
	function getStatusColor(type) {
		if (type?.includes('ハッカソン')) return 'bg-purple-400';
		if (type?.includes('イベント')) return 'bg-blue-400';
		if (type?.includes('合宿')) return 'bg-green-400';
		if (type?.includes('MTG')) return 'bg-yellow-400';
		return 'bg-gray-400';
	}
</script>

<section id="schedule" class="py-32 relative overflow-hidden bg-white">
	<div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
		<!-- Section Header -->
		<div class="mb-24 text-center relative">
			<span
				class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[6rem] sm:text-[9rem] md:text-[12rem] font-bold text-gray-50 -z-10 select-none pointer-events-none leading-none tracking-tighter"
				style="font-family: 'Inter', sans-serif;">SCHEDULE</span
			>
			<h2
				class="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl"
				style="font-family: 'Inter', sans-serif; font-weight: 800; color: #1A1A1A;"
				in:fly={{ y: 30, duration: 600, easing: cubicOut }}
			>
				Schedule
			</h2>
			<p
				class="text-lg font-medium tracking-tight"
				style="font-family: 'Inter', sans-serif; font-weight: 500; color: #86868B; letter-spacing: -0.02em;"
				in:fly={{ y: 30, delay: 100, duration: 600, easing: cubicOut }}
			>
				今後の活動予定と記録
			</p>
		</div>

		<div class="space-y-20">
			<!-- 1. Next Up Section (Prominent Card - Minimalist) -->
			{#if scheduleData.nextEvent}
				{@const event = scheduleData.nextEvent}
				{@const daysUntil = getDaysUntil(event.date)}
				<div class="space-y-6">
					<h3
						class="text-sm font-black tracking-widest text-[#86868B] uppercase pl-4"
						style="font-family: 'Inter', sans-serif; font-weight: 900; letter-spacing: 0.05em;"
					>
						NEXT EVENT
					</h3>

					<div
						class="relative overflow-hidden rounded-[16px] border border-gray-100 bg-white p-8 md:p-12 shadow-[0_2px_40px_rgba(0,0,0,0.04)] transition-transform hover:translate-y-[-2px]"
						in:fly={{ y: 30, duration: 600, easing: cubicOut }}
					>
						<div class="flex flex-col md:flex-row md:items-start md:gap-16">
							<!-- Date & Count -->
							<div class="flex shrink-0 flex-col items-center md:items-start pl-2">
								<span class="text-sm font-medium uppercase tracking-wider text-[#86868B]">
									{new Date(event.date).getFullYear()}
								</span>
								<div class="flex items-baseline gap-2 my-2">
									<span
										class="text-7xl font-black text-[#1A1A1A] tracking-tighter"
										style="font-family: 'Inter', sans-serif; letter-spacing: -0.05em; line-height: 1;"
									>
										{new Date(event.date).getDate()}
									</span>
									<span
										class="text-2xl font-bold text-[#86868B] uppercase tracking-tighter"
										style="font-family: 'Inter', sans-serif;"
									>
										{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
									</span>
								</div>
								{#if daysUntil !== null && daysUntil >= 0}
									<div
										class="mt-4 px-4 py-1.5 text-xs font-black tracking-widest uppercase border border-[#1A1A1A] text-[#1A1A1A] rounded-full"
										style="font-family: 'Inter', sans-serif;"
									>
										{#if daysUntil === 0}
											TODAY
										{:else}
											IN {daysUntil} DAYS
										{/if}
									</div>
								{/if}
							</div>

							<!-- Content -->
							<div class="mt-8 flex-1 text-center md:mt-2 md:text-left">
								<h4
									class="mb-6 text-3xl md:text-5xl font-black text-[#1A1A1A] leading-tight tracking-tighter"
									style="font-family: 'Inter', sans-serif; letter-spacing: -0.05em; line-height: 1.1;"
								>
									{event.title}
								</h4>
								<div
									class="flex flex-col gap-4 md:flex-row md:items-center md:flex-wrap text-[#86868B] text-sm"
								>
									{#if event.location}
										<div class="flex items-center justify-center md:justify-start gap-2">
											<MapPin class="h-4 w-4" />
											{event.location}
										</div>
									{/if}
									{#if event.description}
										<div class="hidden md:block h-px w-8 bg-gray-200"></div>
										<span
											class="px-3 py-1 bg-gray-50 rounded text-[#1A1A1A] text-xs font-medium border border-gray-100"
										>
											{event.description}
										</span>
									{/if}
								</div>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div class="text-center py-20 border-y border-gray-50">
					<p class="text-[#86868B]">No upcoming events scheduled.</p>
				</div>
			{/if}

			<!-- 2. Upcoming Section (Future Plans List) -->
			{#if scheduleData.upcomingEvents.length > 0}
				<div class="space-y-8 opacity-100">
					<h3
						class="text-sm font-black tracking-widest text-[#1A1A1A] uppercase pl-4 border-l-[3px] border-[#1A1A1A]"
						style="font-family: 'Inter', sans-serif; font-weight: 900;"
					>
						UPCOMING
					</h3>

					<div class="space-y-4 border-t border-gray-100 pt-8">
						{#each scheduleData.upcomingEvents as event, i}
							<div
								class="group flex flex-col sm:flex-row items-baseline gap-6 py-6 px-6 bg-gray-50/50 hover:bg-gray-100/80 transition-all duration-300 rounded-[16px]"
								in:fly={{ y: 20, delay: i * 50 + 200, duration: 500, easing: cubicOut }}
							>
								<!-- Status Dot & Date -->
								<div class="flex items-baseline gap-4 w-48 shrink-0">
									<span class="text-[#1A1A1A] text-[8px] relative -top-0.5 scale-125">●</span>
									<span
										class="text-xl font-bold text-[#1A1A1A] tracking-tighter"
										style="font-family: 'Inter', sans-serif; letter-spacing: -0.02em;"
									>
										{#if event.date}
											{new Date(event.date).toLocaleDateString('en-US', {
												year: 'numeric'
											})}.{new Date(event.date).toLocaleDateString('en-US', {
												month: '2-digit'
											})}.{new Date(event.date).toLocaleDateString('en-US', { day: '2-digit' })}
										{:else}
											TBA
										{/if}
									</span>
								</div>

								<!-- Title -->
								<div class="flex-1">
									<h4
										class="text-2xl font-black text-[#1A1A1A] mb-2 group-hover:opacity-70 transition-opacity tracking-tight"
										style="font-family: 'Inter', sans-serif; letter-spacing: -0.03em;"
									>
										{event.title}
									</h4>
									{#if event.description || event.location}
										<div
											class="flex gap-4 text-xs font-medium text-[#86868B] uppercase tracking-wide"
										>
											{#if event.description}<span>{event.description}</span>{/if}
											{#if event.location}<span>@ {event.location}</span>{/if}
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- 3. History Section (Opacity 0.4) -->
			<div
				class="pt-16 border-t border-gray-100 opacity-40 hover:opacity-100 transition-opacity duration-500"
			>
				<div class="text-center mb-12">
					<button
						onclick={() => (showHistory = !showHistory)}
						class="inline-flex items-center gap-3 px-8 py-3 rounded-full border border-gray-200 text-[#1A1A1A] font-bold text-sm hover:bg-gray-50 transition-colors bg-white tracking-wide"
						style="font-family: 'Inter', sans-serif;"
					>
						<span>{showHistory ? 'Hide Past Activities' : 'Show Past Activities'}</span>
						<ChevronDown
							class="h-4 w-4 transition-transform duration-300 {showHistory ? 'rotate-180' : ''}"
						/>
					</button>
				</div>

				{#if showHistory}
					<div in:fly={{ y: -20, duration: 400 }}>
						<ScheduleTimeline monthGroups={pastEventsByMonth} />
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>
