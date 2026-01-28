<script>
	import { language } from '$lib/stores/language.svelte.js';
	import { translations } from '$lib/i18n/translations.js';
	import { onMount, onDestroy } from 'svelte';
	import { fly, fade, scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { cubicOut, quintOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	// Direct imports to avoid SSR issues
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import XIcon from 'lucide-svelte/icons/x';

	import ActivitySection from '$lib/components/ActivitySection.svelte';
	import ScheduleSection from '$lib/components/ScheduleSection.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import CategoryFilter from '$lib/components/CategoryFilter.svelte';
	import { reveal } from '$lib/actions/reveal.js';

	let { data, children } = $props();

	// Fixed Hero Text
	const heroTextEN = [
		'Think rationally.',
		'Act for others.',
		'Explore thoroughly.',
		'Innovate boldly.',
		'Question constantly.'
	];
	const heroTextJP = [
		'合理的な判断で',
		'利他的な技術を',
		'徹底的な探究から',
		'革新的な未来へ',
		'常に懐疑的な視点を忘れない'
	];

	// Typing animation state
	let typedLines = $state(heroTextEN.map(() => ''));
	let showJapaneseLines = $state(new Array(heroTextJP.length).fill(false));
	let cursorPosition = $state({ line: 0, visible: true });
	let isTyping = $state(true);

	// Typing animation initialization
	/** @type {NodeJS.Timeout} */
	let typingInterval;
	/** @type {NodeJS.Timeout} */
	let blinkInterval;

	onMount(() => {
		// Start Animation Sequence
		const TYPE_SPEED = 35;
		const TYPE_VARIANCE = 15;
		const COMMA_PAUSE = 100;
		const LINE_NEXT_DELAY = 100;
		const LAST_LINE_DELAY = 1000;
		const CURSOR_BLINK_SPEED = 530;

		let lineIdx = 0;
		let charIdx = 0;

		function loop() {
			if (lineIdx >= heroTextEN.length) {
				isTyping = false;
				cursorPosition = { line: heroTextEN.length - 1, visible: true };
				let count = 0;
				blinkInterval = setInterval(() => {
					cursorPosition = { ...cursorPosition, visible: !cursorPosition.visible };
					count++;
					if (count > 6) {
						clearInterval(blinkInterval);
						cursorPosition = { ...cursorPosition, visible: false };
					}
				}, CURSOR_BLINK_SPEED);
				return;
			}

			const targetLine = heroTextEN[lineIdx];

			if (charIdx <= targetLine.length) {
				typedLines[lineIdx] = targetLine.substring(0, charIdx);
				cursorPosition = { line: lineIdx, visible: true };

				let delay = TYPE_SPEED + Math.random() * TYPE_VARIANCE;
				const char = targetLine[charIdx - 1];
				if (char && /[.,!?;:]/.test(char)) {
					delay += COMMA_PAUSE;
				}

				charIdx++;
				typingInterval = setTimeout(loop, delay);
			} else {
				showJapaneseLines[lineIdx] = true;
				const isLastLine = lineIdx === heroTextEN.length - 1;
				const nextDelay = isLastLine ? LAST_LINE_DELAY : LINE_NEXT_DELAY;

				if (isLastLine) {
					lineIdx++;
					typingInterval = setTimeout(loop, nextDelay);
				} else {
					setTimeout(() => {
						lineIdx++;
						charIdx = 0;
						loop();
					}, 300);
				}
			}
		}

		setTimeout(loop, 500);

		return () => {
			if (typingInterval) clearTimeout(typingInterval);
			if (blinkInterval) clearInterval(blinkInterval);
		};
	});

	// Cleanup on destroy
	onDestroy(() => {
		if (typingInterval) clearTimeout(typingInterval);
		if (blinkInterval) clearInterval(blinkInterval);
	});

	// Category & News Logic
	let selectedCategory = $state('All');

	/** @type {any[]} */
	let displayProjects = $state([]);
	let displayScheduleData = $state(data.scheduleData);

	const filteredProjects = $derived(
		selectedCategory === 'All'
			? displayProjects
			: displayProjects.filter((p) => p.category === selectedCategory)
	);

	const categories = $derived([...new Set(data.projects.map((p) => p.category).filter(Boolean))]);

	/** @param {string} category */
	function handleCategorySelect(category) {
		selectedCategory = category;
	}

	/** @param {any} item */
	function navigateToNews(item) {
		goto(`/home/${encodeURIComponent(item.title)}`, { noScroll: true });
	}

	/** @param {any} e */
	function handleImageError(e) {
		e.currentTarget.style.display = 'none';
	}

	let mouseX = $state(0);
	let mouseY = $state(0);
	/** @param {MouseEvent} e */
	function handleMouseMove(e) {
		mouseX = e.clientX;
		mouseY = e.clientY;
	}

	let scrollY = $state(0);
	let t = $derived(translations[/** @type {'JP'|'EN'} */ (language.current)]);

	// Translation Logic for News List
	import { translationStore } from '$lib/stores/translation.svelte.js';

	/** @type {any[]} */
	let translatedNews = $state([]);

	$effect(() => {
		async function updateTranslations() {
			if (language.current === 'EN') {
				// News Translation
				const newsPromise = Promise.all(
					data.news.map(async (item) => {
						const translatedTitle = await translationStore.get(item.title);
						return { ...item, title: translatedTitle };
					})
				);

				// Projects Translation
				const projectsPromise = Promise.all(
					data.projects.map(async (item) => {
						const [tTitle, tDesc] = await Promise.all([
							translationStore.get(item.title),
							translationStore.get(item.description)
						]);
						return { ...item, title: tTitle, description: tDesc };
					})
				);

				// Schedule Data Translation (Next & Upcoming)
				const translateEvent = async (event) => {
					if (!event) return null;
					const [tName, tLocation, tRemarks] = await Promise.all([
						translationStore.get(event.title || event.name),
						translationStore.get(event.location),
						event.remarks ? translationStore.get(event.remarks) : null
					]);
					return {
						...event,
						title: tName,
						location: tLocation,
						remarks: tRemarks || event.remarks
					};
				};

				const nextEventPr = translateEvent(data.scheduleData.nextEvent);
				const upcomingPr = Promise.all(data.scheduleData.upcomingEvents.map(translateEvent));

				const [newsRes, projectsRes, nextEventRes, upcomingRes] = await Promise.all([
					newsPromise,
					projectsPromise,
					nextEventPr,
					upcomingPr
				]);

				translatedNews = newsRes;
				displayProjects = projectsRes;
				displayScheduleData = {
					...data.scheduleData,
					nextEvent: nextEventRes,
					upcomingEvents: upcomingRes
				};
			} else {
				translatedNews = data.news;
				displayProjects = data.projects;
				displayScheduleData = data.scheduleData;
			}
		}

		// Initial/Reset
		if (language.current !== 'EN') {
			translatedNews = data.news;
			displayProjects = data.projects;
			displayScheduleData = data.scheduleData;
		}

		updateTranslations();
	});

	let displayNews = $derived(
		language.current === 'EN' && translatedNews.length > 0 ? translatedNews : data.news
	);
</script>

<svelte:window onmousemove={handleMouseMove} bind:scrollY />

<!-- Global Ambient Background -->
<div class="fixed inset-0 -z-50 overflow-hidden pointer-events-none" style="background: #FAFAFA;">
	<div
		class="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
		style="background-image: url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E&quot;);"
	></div>
	<div
		class="absolute h-[800px] w-[800px] rounded-full bg-white blur-[120px] transition-transform duration-100 ease-out will-change-transform mix-blend-normal opacity-80"
		style="left: -400px; top: -400px; transform: translate({mouseX}px, {mouseY}px);"
	></div>
</div>

<!-- Main Content (Background for Modal) -->
<section class="hero-section relative min-h-screen w-full overflow-hidden">
	<div
		class="relative z-10 w-full h-full mx-auto min-h-screen flex flex-col justify-center py-32 px-6 md:px-12 lg:px-20"
	>
		<div class="w-full max-w-[1200px] mx-auto">
			<div class="flex flex-col md:flex-row items-end w-full gap-12 md:gap-0">
				<div class="w-full md:w-[70%] flex flex-col gap-1 md:gap-1" style="min-height: 25rem;">
					{#each heroTextEN as line, i}
						<div class="overflow-hidden" style="min-height: clamp(2rem, 6vw, 4.5rem);">
							<span
								class="block text-black leading-[1.1] tracking-tighter break-words antialiased"
								style="font-family: 'Inter', sans-serif; font-size: clamp(2rem, 6vw, 4.5rem); font-weight: 800; letter-spacing: -0.05em; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;"
							>
								{typedLines[i] || ''}{#if cursorPosition.line === i && cursorPosition.visible}<span
										style="color: #000000; font-weight: 800; margin-left: 4px; display: inline-block; width: 4px;"
										>|</span
									>{/if}
							</span>
						</div>
					{/each}
				</div>

				<div class="w-full md:w-[30%] flex flex-col gap-4 md:gap-5 text-right pb-1 md:pb-2">
					<div class="flex flex-col gap-2">
						{#each heroTextJP as line, i}
							<p
								class="text-gray-500 font-medium tracking-wide transition-opacity duration-1000 ease-out"
								class:opacity-0={!showJapaneseLines[i]}
								class:opacity-100={showJapaneseLines[i]}
								style="font-family: 'Zen Kaku Gothic New', sans-serif; font-size: clamp(1rem, 1.5vw, 1.25rem);"
							>
								{line}
							</p>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Activity Section -->
<div class="relative py-24 z-40 -mt-24 pt-48" use:reveal={{ threshold: 0.1 }}>
	<div
		class="absolute top-0 left-1/2 -translate-x-1/2 text-[15vw] font-bold text-gray-900 -z-10 select-none pointer-events-none leading-none tracking-tighter opacity-[0.03]"
		style="font-family: 'Inter', sans-serif;"
	>
		ACTIVITIES
	</div>
	<ActivitySection />
</div>

<!-- Projects Section -->
<div
	id="projects"
	class="relative py-24 z-30 -mt-24 pt-48"
	style="scroll-margin-top: 100px;"
	use:reveal={{ threshold: 0.1 }}
>
	<div
		class="absolute top-10 right-10 text-[12vw] font-bold text-gray-900 -z-10 select-none pointer-events-none leading-none tracking-tighter opacity-[0.03] text-right"
		style="font-family: 'Inter', sans-serif;"
	>
		PROJECTS
	</div>

	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
		<div class="mb-12">
			{#key language.current}
				<div in:fade={{ duration: 300 }}>
					<h2
						class="mb-4 text-4xl font-semibold tracking-tight md:text-5xl"
						style="color: #1A1A1A;"
					>
						{t.projects.title}
					</h2>
					<p class="text-lg" style="color: #6B6B6B;">
						{t.projects.desc}
					</p>
				</div>
			{/key}
		</div>

		{#if categories.length > 0}
			<div class="mb-10">
				<CategoryFilter {categories} {selectedCategory} onSelect={handleCategorySelect} />
			</div>
		{/if}

		{#if filteredProjects.length > 0}
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each filteredProjects as project (project.id)}
					<div
						animate:flip={{ duration: 400, easing: cubicOut }}
						in:fly={{ y: 30, duration: 400, easing: cubicOut }}
						out:fade={{ duration: 200 }}
					>
						<ProjectCard {project} />
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state rounded-3xl bg-white p-16 text-center" in:fade={{ duration: 200 }}>
				<p class="text-lg" style="color: #6B6B6B;">
					{selectedCategory === 'All'
						? 'プロジェクトはまだありません'
						: `「${selectedCategory}」カテゴリのプロジェクトはありません`}
				</p>
			</div>
		{/if}
	</div>
</div>

<!-- News Section -->
<div
	id="news"
	class="relative py-24 z-20 -mt-24 pt-48"
	style="scroll-margin-top: 100px;"
	use:reveal={{ threshold: 0.1 }}
>
	<div
		class="absolute top-20 left-10 text-[15vw] font-bold text-gray-900 -z-10 select-none pointer-events-none leading-none tracking-tighter opacity-[0.03]"
		style="font-family: 'Inter', sans-serif;"
	>
		{t.news.watermark}
	</div>

	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
		<div class="mb-16">
			<h2 class="mb-4 text-4xl font-semibold tracking-tight md:text-5xl" style="color: #1A1A1A;">
				{t.news.title}
			</h2>
			<p class="text-lg" style="color: #6b6b6b;">{t.news.desc}</p>
		</div>

		<div class="grid gap-8 md:grid-cols-2">
			{#each displayNews as item, i}
				<button
					type="button"
					class="news-card group relative flex w-full flex-col overflow-hidden rounded-3xl text-left transition-all duration-500 hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-gray-100"
					style="background: rgba(255, 255, 255, 0.5); backdrop-filter: blur(50px); border: 1px solid rgba(243, 244, 246, 1); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);"
					onclick={() => navigateToNews(item)}
					use:reveal={{ threshold: 0.1 }}
				>
					<div class="aspect-[16/9] w-full overflow-hidden" style="background-color: #F5F5F7;">
						{#if item.coverUrl}
							<img
								src={item.coverUrl}
								alt={item.title}
								class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
							/>
						{:else}
							<div class="flex h-full w-full items-center justify-center bg-gray-50">
								<span class="text-4xl opacity-20">📰</span>
							</div>
						{/if}
					</div>

					<div class="flex flex-1 flex-col p-8">
						<div class="mb-4 flex flex-wrap items-center gap-3">
							<time class="text-sm font-medium" style="color: #8b8b8b;"
								>{new Date(item.date).toLocaleDateString('ja-JP', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}</time
							>
							{#if item.tags}
								{#each item.tags as tag}
									<span
										class="rounded-full px-3 py-1 text-xs font-medium"
										style="background: #F5F5F7; color: #1D1D1F;">{tag}</span
									>
								{/each}
							{/if}
						</div>
						<h3
							class="mb-3 text-2xl font-semibold leading-tight text-[#1d1d1f] group-hover:text-blue-600 transition-colors"
						>
							{item.title}
						</h3>
						<div class="mt-auto flex items-center gap-2 text-sm font-medium text-blue-500">
							{t.news.readMore}
							<ArrowRight
								class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
							/>
						</div>
					</div>
				</button>
			{/each}
		</div>
	</div>
</div>

<!-- Schedule Section -->
<div id="schedule" class="relative py-24 z-10 -mt-24 pt-48" style="scroll-margin-top: 100px;">
	<ScheduleSection scheduleData={displayScheduleData} pastEventsByMonth={data.pastEventsByMonth} />
</div>

<!-- Modal Insertion -->
{@render children()}

<style>
	.news-card {
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
	}
	.news-card:hover {
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
	}
</style>
