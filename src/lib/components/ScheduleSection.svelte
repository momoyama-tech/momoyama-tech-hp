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
		if (!dateStr) return t.schedule.tbd;
		const date = new Date(dateStr);
		const locale = language.current === 'JP' ? 'ja-JP' : 'en-US';
		return date.toLocaleDateString(locale, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			weekday: language.current === 'JP' ? 'short' : undefined
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

	import { language } from '$lib/stores/language.svelte.js';
	import { translations } from '$lib/i18n/translations.js';

	let t = $derived(translations[/** @type {'JP'|'EN'} */ (language.current)]);
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
				{#key language.current}
					<span in:fade={{ duration: 300 }}>
						{t.schedule.title}
					</span>
				{/key}
			</h2>
			<p
				class="text-lg font-medium tracking-tight"
				style="font-family: 'Inter', sans-serif; font-weight: 500; color: #86868B; letter-spacing: -0.02em;"
				in:fly={{ y: 30, delay: 100, duration: 600, easing: cubicOut }}
			>
				{#key language.current}
					<span in:fade={{ duration: 300 }}>
						{t.schedule.subTitle}
					</span>
				{/key}
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
						{#key language.current}
							<span in:fade={{ duration: 300 }}>
								{t.schedule.next}
							</span>
						{/key}
					</h3>

					<div
						class="relative overflow-hidden rounded-[16px] border border-gray-100 bg-white p-8 md:p-12 shadow-[0_2px_40px_rgba(0,0,0,0.04)] transition-transform hover:translate-y-[-2px]"
						in:fly={{ y: 30, duration: 600, easing: cubicOut }}
					>
						<div class="flex flex-col md:flex-row md:items-center md:gap-8">
							<!-- Date & Count -->
							<div class="flex shrink-0 flex-col items-center justify-center p-2 md:p-4">
								<!-- Calendar Icon Container -->
								<div
									class="flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 aspect-square w-32 md:w-36 lg:w-40 p-4 mb-5 relative overflow-hidden"
									style="box-shadow: 0 4px 20px rgba(0,0,0,0.03);"
								>
									<!-- Red Top Bar Accent -->
									<div class="absolute top-0 left-0 right-0 h-1.5 bg-[#FF3B30]"></div>

									<div class="flex flex-col items-center leading-none mt-2">
										<!-- Month -->
										<span
											class="text-lg font-bold text-[#FF3B30] tracking-widest mb-0.5"
											style="font-family: 'Inter', sans-serif;"
										>
											{#if language.current === 'JP'}
												{new Date(event.date).getMonth() + 1}月
											{:else}
												{String(new Date(event.date).getMonth() + 1).padStart(2, '0')}
											{/if}
										</span>
										<!-- Day -->
										<span
											class="text-6xl md:text-7xl font-black text-[#1A1A1A] tracking-tighter"
											style="font-family: 'Inter', sans-serif; letter-spacing: -0.07em;"
										>
											{String(new Date(event.date).getDate()).padStart(2, '0')}
										</span>
									</div>
								</div>

								{#if daysUntil !== null && daysUntil >= 0}
									<div
										class="px-4 py-2 text-xs font-bold tracking-widest uppercase bg-[#F5F5F7] text-[#1A1A1A] rounded-lg"
										style="font-family: 'Inter', sans-serif;"
									>
										{#key language.current}
											<span in:fade={{ duration: 300 }}>
												{#if daysUntil === 0}
													{t.schedule.today}
												{:else}
													{t.schedule.inDays(daysUntil)}
												{/if}
											</span>
										{/key}
									</div>
								{/if}
							</div>

							<!-- Content -->
							<div class="mt-8 flex-1 text-center md:mt-0 md:text-left">
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
					<p class="text-[#86868B]">{t.schedule.empty}</p>
				</div>
			{/if}

			<!-- 2. Upcoming Section (Future Plans List) -->
			{#if scheduleData.upcomingEvents.length > 0}
				<div class="space-y-8 opacity-100">
					<h3
						class="text-sm font-black tracking-widest text-[#1A1A1A] uppercase pl-4 border-l-[3px] border-[#1A1A1A]"
						style="font-family: 'Inter', sans-serif; font-weight: 900;"
					>
						{#key language.current}
							<span in:fade={{ duration: 300 }}>
								{t.schedule.upcoming}
							</span>
						{/key}
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
										>
										{#if event.date}
											{formatDate(event.date)}
										{:else}
											{t.schedule.tbd}
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
						{#key language.current}
							<span in:fade={{ duration: 300 }}>
								{showHistory ? t.schedule.hidePast : t.schedule.showPast}
							</span>
						{/key}
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
