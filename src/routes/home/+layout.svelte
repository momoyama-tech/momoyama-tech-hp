<script>
	import { language } from '$lib/stores/language.svelte.js';
	import { translations } from '$lib/i18n/translations.js';
	import { onMount, onDestroy, untrack } from 'svelte';
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
	import SecretPalette from '$lib/components/SecretPalette.svelte';
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
	let displayScheduleData = $state(untrack(() => data.scheduleData));

	const filteredProjects = $derived(
		selectedCategory === 'All'
			? displayProjects
			: displayProjects.filter((p) => p.category === selectedCategory)
	);

	const categories = $derived([
		...new Set(data.projects.map((/** @type {any} */ p) => p.category).filter(Boolean))
	]);

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
	let innerWidth = $state(0);
	let innerHeight = $state(0);
	let isMobile = $derived(innerWidth <= 1024);

	// Mobile Auto-Scan Animation (CSS based now)
	let spotlightEl = $state();
	/* Eliminated JS Sync Loop for Mobile/iPad to use pure CSS */

	/** @param {MouseEvent} e */
	function handleMouseMove(e) {
		if (isMobile) return;
		mouseX = e.clientX;
		mouseY = e.clientY;
	}

	let scrollY = $state(0);
	let t = $derived(translations[/** @type {'JP'|'EN'} */ (language.current)]);

	// Translation Logic for News List
	import { translationStore } from '$lib/stores/translation.svelte.js';
	import { theme } from '$lib/stores/theme.svelte.js';

	/** @type {any[]} */
	let translatedNews = $state([]);

	$effect(() => {
		async function updateTranslations() {
			if (language.current === 'EN') {
				// News Translation
				const newsPromise = Promise.all(
					data.news.map(async (/** @type {any} */ item) => {
						const translatedTitle = await translationStore.get(item.title);
						return { ...item, title: translatedTitle };
					})
				);

				// Projects Translation
				const projectsPromise = Promise.all(
					data.projects.map(async (/** @type {any} */ item) => {
						const [tTitle, tDesc] = await Promise.all([
							translationStore.get(item.title),
							translationStore.get(item.description)
						]);
						return { ...item, title: tTitle, description: tDesc };
					})
				);

				// Schedule Data Translation (Next & Upcoming)
				const translateEvent = async (/** @type {any} */ event) => {
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

	// Hero Mask Logic
	let heroContainer = $state();
	let heroMaskPos = $state({ x: -1000, y: -1000 });

	$effect(() => {
		// Dependency on scrollY is required to update rect calculation on scroll
		const _s = scrollY;
		if (isMobile) return;

		if (heroContainer) {
			const rect = heroContainer.getBoundingClientRect();
			heroMaskPos = {
				x: mouseX - rect.left,
				y: mouseY - rect.top
			};
		}
	});

	// Reactive Light Detection for Headings
	let projectsTitle = $state();
	let newsTitle = $state();
	let isProjectsLit = $state(false);
	let isNewsLit = $state(false);

	$effect(() => {
		if (theme.isSpotlightEnabled) {
			// removed isDark check to ensure logic runs even if user toggles, though mostly for dark mode
			if (projectsTitle) {
				const rect = projectsTitle.getBoundingClientRect();
				const centerX = rect.left + rect.width / 2;
				const centerY = rect.top + rect.height / 2;
				const dist = Math.hypot(mouseX - centerX, mouseY - centerY);
				isProjectsLit = dist < 300;
			}
			if (newsTitle) {
				const rect = newsTitle.getBoundingClientRect();
				const centerX = rect.left + rect.width / 2;
				const centerY = rect.top + rect.height / 2;
				const dist = Math.hypot(mouseX - centerX, mouseY - centerY);
				isNewsLit = dist < 300;
			}
		} else {
			isProjectsLit = false;
			isNewsLit = false;
		}
	});

	let displayNews = $derived(
		language.current === 'EN' && translatedNews.length > 0 ? translatedNews : data.news
	);
</script>

<svelte:window onmousemove={handleMouseMove} bind:scrollY bind:innerWidth bind:innerHeight />

<!-- Global Ambient Background & Spotlight -->
<!-- Global Ambient Background & Spotlight -->
<div
	class="fixed inset-0 z-[9999] overflow-hidden pointer-events-none"
	style="mix-blend-mode: normal;"
>
	<div
		bind:this={spotlightEl}
		class="spotlight-base absolute rounded-full transition-transform duration-75 ease-out will-change-transform flex items-center justify-center placeholder:overflow-hidden"
		style="
			/* Force NO transform/style on mobile from JS to avoid conflict */
			transform: {isMobile ? '' : `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`};
			background: transparent;
			backdrop-filter: brightness(1.5) contrast(1.5);
			opacity: {theme.isDark && theme.isSpotlightEnabled ? 1 : 0};
			transition: opacity 0.3s ease, transform 0.2s ease-out;
		"
	>
		<!-- Grid Overlay inside Spotlight -->
		<div
			class="absolute inset-0 w-full h-full"
			style="
				background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
				background-size: 20px 20px;
				mask-image: {isMobile
				? 'radial-gradient(circle closest-side, black, transparent 60%)'
				: 'radial-gradient(circle closest-side, black, transparent 80%)'};
				-webkit-mask-image: {isMobile
				? 'radial-gradient(circle closest-side, black, transparent 60%)'
				: 'radial-gradient(circle closest-side, black, transparent 80%)'};
			"
		></div>
	</div>
</div>
<div
	class="fixed inset-0 -z-50 overflow-hidden pointer-events-none transition-colors duration-500 bg-[#FAFAFA] dark:bg-black"
>
	<div
		class="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
		style="background-image: url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E&quot;);"
	></div>
</div>

<!-- Main Content (Background for Modal) -->
<section class="hero-section relative min-h-screen w-full overflow-hidden">
	<div
		class="relative z-10 w-full h-full mx-auto min-h-screen flex flex-col justify-center py-32 px-6 md:px-12 lg:px-20"
	>
		<div class="w-full max-w-[1200px] mx-auto">
			<div class="flex flex-col md:flex-row items-end w-full gap-12 md:gap-0">
				<!-- Hero Text Container (Base + Lit layers) -->
				<div
					class="relative w-full md:w-[70%] flex flex-col gap-1 md:gap-1"
					style="min-height: 25rem;"
				>
					<!-- Layer 1: Text (Visual Foundation) -->
					<!-- Standard text styling, no tricks. In Dark Mode, this will be dimmed by the overlay. -->
					<div
						class="flex flex-col gap-1 md:gap-1"
						style="
							opacity: {theme.isDark && !theme.isSpotlightEnabled ? 0 : 1};
							transition: opacity 0.5s ease;
						"
					>
						{#each heroTextEN as line, i}
							<div class="overflow-hidden" style="min-height: clamp(2rem, 6vw, 4.5rem);">
								<span
									class="block text-black leading-[1.1] tracking-tighter break-words antialiased transition-colors duration-300 dark:text-white"
									style="
										font-family: 'Inter', sans-serif; 
										font-size: clamp(2rem, 6vw, 4.5rem); 
										font-weight: 800; 
										letter-spacing: -0.05em; 
										-webkit-font-smoothing: antialiased; 
										-moz-osx-font-smoothing: grayscale;
									"
								>
									{typedLines[i] ||
										''}{#if cursorPosition.line === i && cursorPosition.visible}<span
											style="color: {theme.isDark
												? '#FFF'
												: '#000'}; font-weight: 800; margin-left: 4px; display: inline-block; width: 4px;"
											>|</span
										>{/if}
								</span>
							</div>
						{/each}
					</div>

					<!-- Layer 2: Darkness Overlay + Spotlight Hole -->
					<div
						bind:this={heroContainer}
						class="hero-mask-overlay absolute inset-0 z-20 pointer-events-none"
						style="
							background-color: #000000;
							opacity: {theme.isDark && theme.isSpotlightEnabled ? 1 : 0};
							transition: opacity 0.5s ease;
							mask-image: radial-gradient(circle 200px at var(--mask-x, var(--x)) var(--mask-y, var(--y)), rgba(0,0,0,0.1) 20%, black 80%);
							-webkit-mask-image: radial-gradient(circle 200px at var(--mask-x, var(--x)) var(--mask-y, var(--y)), rgba(0,0,0,0.1) 20%, black 80%);
							--x: {heroMaskPos.x}px;
							--y: {heroMaskPos.y}px;
						"
					></div>
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
						bind:this={projectsTitle}
						class="mb-4 text-4xl font-semibold tracking-tight md:text-5xl transition-all duration-300 text-[#1A1A1A] dark:text-white"
					>
						{t.projects.title}
					</h2>
					<p class="text-lg transition-colors dark:text-zinc-400" style="color: #6B6B6B;">
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
			<div
				class="empty-state rounded-3xl bg-white p-16 text-center dark:bg-zinc-900/20"
				in:fade={{ duration: 200 }}
			>
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
			<h2
				bind:this={newsTitle}
				class="mb-4 text-4xl font-semibold tracking-tight md:text-5xl transition-all duration-300 text-[#1A1A1A] dark:text-white"
			>
				{t.news.title}
			</h2>
			<p class="text-lg transition-colors dark:text-zinc-400" style="color: #6b6b6b;">
				{t.news.desc}
			</p>
		</div>

		<div class="grid gap-8 md:grid-cols-2">
			{#each displayNews as item, i}
				<button
					type="button"
					class="news-card group relative flex w-full flex-col overflow-hidden rounded-3xl text-left transition-all duration-500 hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-zinc-900/40 dark:border-white/10 dark:backdrop-blur-xl dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
					class:border-glow={theme.isScanLineActive}
					style="backdrop-filter: blur(50px); border: 1px solid rgba(243, 244, 246, 1); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); {theme.isDark
						? ''
						: 'background: rgba(255, 255, 255, 0.5);'}"
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
							<div
								class="flex h-full w-full items-center justify-center bg-gray-50 dark:bg-zinc-900"
							>
								<span class="text-4xl opacity-20 dark:opacity-50 dark:text-cyan-400">📰</span>
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
							class="mb-3 text-2xl font-semibold leading-tight text-[#1d1d1f] group-hover:text-blue-600 transition-colors dark:text-zinc-100 dark:text-glow dark:group-hover:text-cyan-400"
						>
							{item.title}
						</h3>
						<div
							class="mt-auto flex items-center gap-2 text-sm font-medium text-blue-500 dark:text-cyan-400"
						>
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

<!-- Hidden Terminal Message (Interactive Playground) -->
<div
	class="relative flex h-32 w-full items-center justify-center overflow-hidden py-10"
	role="presentation"
>
	<!-- Terminal Content: Visible only when spotlight (mask) is over it -->
	<div
		class="pointer-events-none sticky z-20 flex flex-col items-start justify-center gap-1 font-mono text-sm"
		style="
			mask-image: radial-gradient(circle 150px at {mouseX}px {mouseY}px, black, transparent 100%);
			-webkit-mask-image: radial-gradient(circle 150px at {mouseX}px {mouseY}px, black, transparent 100%);
			mask-attachment: fixed;
			-webkit-mask-attachment: fixed;
		"
	>
		<div
			class="flex flex-col items-start gap-1 p-4 text-green-500 font-bold tracking-wider"
			style="text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);"
		>
			<p class="overflow-hidden whitespace-nowrap animate-typing-1 border-r-2 border-green-500/0">
				root@momoyama-tech:~$ access_granted...
			</p>
			<p class="overflow-hidden whitespace-nowrap animate-typing-2 opacity-0">
				system_status: optimal
			</p>
			<p class="overflow-hidden whitespace-nowrap animate-typing-3 opacity-0">
				hidden_message: "Innovation starts from the dark."
			</p>
		</div>
	</div>
</div>

<!-- Modal Insertion -->
{@render children()}

<!-- Secret Easter Egg -->
<SecretPalette />

<style>
	@keyframes typing {
		from {
			width: 0;
			border-color: transparent;
		}
		1% {
			border-color: rgba(34, 197, 94, 0.8);
		}
		to {
			width: 100%;
			border-color: transparent;
		}
	}
	@keyframes fade-in {
		to {
			opacity: 1;
		}
	}

	.animate-typing-1 {
		animation: typing 2s steps(40, end) forwards;
		width: 0;
	}
	.animate-typing-2 {
		animation:
			typing 2s steps(40, end) forwards 2s,
			fade-in 0.1s forwards 2s;
		width: 0;
	}
	.animate-typing-3 {
		animation:
			typing 3s steps(40, end) forwards 4s,
			fade-in 0.1s forwards 4s;
		width: 0;
	}

	.news-card {
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
	}
	.news-card:hover {
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
	}

	/* Base Spotlight Styles */
	.spotlight-base {
		width: 600px;
		height: 600px;
		left: 0;
		top: 0;
		display: flex;
		opacity: 0;
		transition:
			opacity 0.3s ease,
			transform 0.2s ease-out;
	}
	:global(.dark) .spotlight-base {
		opacity: 1;
	}

	@property --gx {
		syntax: '<length-percentage>';
		inherits: false;
		initial-value: 50%;
	}
	@property --gy {
		syntax: '<length-percentage>';
		inherits: false;
		initial-value: 50%;
	}

	/* Synchronized Roaming for Mobile/iPad */
	@keyframes roam-cycle {
		0% {
			--gx: 50vw;
			--gy: 50vh;
		}
		20% {
			--gx: 20vw;
			--gy: 30vh;
		} /* Top Left */
		40% {
			--gx: 80vw;
			--gy: 20vh;
		} /* Top Right */
		60% {
			--gx: 70vw;
			--gy: 80vh;
		} /* Bottom Right */
		80% {
			--gx: 30vw;
			--gy: 70vh;
		} /* Bottom Left */
		100% {
			--gx: 50vw;
			--gy: 50vh;
		}
	}

	/* Mobile/iPad (<= 1024px) */
	@media (max-width: 1024px) {
		.spotlight-base {
			position: fixed !important;
			left: 0 !important;
			top: 0 !important;
			/* Use shared variables for position */
			transform: translate(var(--gx), var(--gy)) translate(-50%, -50%) !important;
			animation: roam-cycle 15s infinite ease-in-out !important;
			will-change: transform;
			pointer-events: none;
			width: 400px !important;
			height: 400px !important;
		}

		.hero-mask-overlay {
			/* Force Fixed to match viewport coordinates exactly */
			position: fixed !important;
			inset: 0 !important;
			width: 100vw !important;
			height: 100vh !important;
			z-index: 20 !important;

			/* Animate variables same as spotlight */
			animation: roam-cycle 15s infinite ease-in-out !important;

			/* Use variables for mask position */
			--mask-pos: var(--gx) var(--gy);
			mask-image: radial-gradient(
				circle 200px at var(--mask-pos),
				rgba(0, 0, 0, 0.1) 20%,
				black 80%
			) !important;
			-webkit-mask-image: radial-gradient(
				circle 200px at var(--mask-pos),
				rgba(0, 0, 0, 0.1) 20%,
				black 80%
			) !important;
		}
	}
</style>
