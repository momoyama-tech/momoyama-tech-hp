<script>
	import { onMount } from 'svelte';
	import { fly, fade, scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { cubicOut, quintOut } from 'svelte/easing';
	// Direct imports to avoid SSR issues
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import X from 'lucide-svelte/icons/x';

	import ActivitySection from '$lib/components/ActivitySection.svelte';
	import ScheduleSection from '$lib/components/ScheduleSection.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import CategoryFilter from '$lib/components/CategoryFilter.svelte';
	import { reveal } from '$lib/actions/reveal.js';

	let { data } = $props();

	// Typing animation state
	let typedLines = $state(/** @type {string[]} */ ([]));
	let showJapanese = $state(/** @type {boolean[]} */ ([]));
	let isTypingComplete = $state(false);
	let cursorPosition = $state(
		/** @type {{line: number, visible: boolean}} */ ({ line: -1, visible: false })
	);
	let isTyping = $state(false);

	let selectedCategory = $state('All');

	const filteredProjects = $derived(
		selectedCategory === 'All'
			? data.projects
			: data.projects.filter((p) => p.category === selectedCategory)
	);

	// Get unique categories from projects
	const categories = $derived([...new Set(data.projects.map((p) => p.category).filter(Boolean))]);

	/**
	 * @param {string} category
	 */
	function handleCategorySelect(category) {
		selectedCategory = category;
	}

	/** @type {import('$lib/server/news').NewsItem | null} */
	let selectedNews = $state(null);
	let newsContent = $state('');
	let isLoadingContent = $state(false);

	/**
	 * @param {any} item
	 */
	async function openNews(item) {
		selectedNews = item;
		newsContent = '';
		isLoadingContent = true;

		if (typeof document !== 'undefined') {
			document.body.style.overflow = 'hidden';
		}

		try {
			const res = await fetch(`/api/news/${item.id}`);
			const data = await res.json();
			newsContent = data.content;
		} catch (e) {
			console.error('Failed to fetch news content:', e);
		} finally {
			isLoadingContent = false;
		}
	}

	function closeNews() {
		selectedNews = null;
		if (typeof document !== 'undefined') {
			document.body.style.overflow = '';
		}
	}

	/**
	 * @param {any} e
	 */
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

	// Parallax helper
	/**
	 * @param {number} y
	 * @param {number} speed
	 */
	const parallax = (y, speed) => y * speed;

	const heroLines = [
		{ en: 'Think rationally.', ja: '合理的な判断で' },
		{ en: 'Act for others.', ja: '利他的な技術を' },
		{ en: 'Explore thoroughly.', ja: '徹底的な探究から' },
		{ en: 'Innovate boldly.', ja: '革新的な未来へ' },
		{ en: 'Question constantly.', ja: '常に懐疑的な視点を忘れない' }
	];

	// Typing animation - runs on mount
	onMount(() => {
		const baseTypeSpeed = 40; // base milliseconds per character (2x faster)
		const randomVariation = 30; // random variation range
		const punctuationPause = 200; // pause after punctuation (sharper tempo)
		const lineDelay = 300; // delay before starting next line
		const japaneseFadeDelay = 100; // delay before fading in Japanese (faster)
		const cursorBlinkSpeed = 530; // cursor blink interval

		/**
		 * @param {number} lineIndex
		 */
		function typeLine(lineIndex) {
			if (lineIndex >= heroLines.length) {
				// All lines complete - blink cursor a few times then hide
				isTyping = false;
				cursorPosition = { line: heroLines.length - 1, visible: true };
				setTimeout(() => {
					isTypingComplete = true;
					cursorPosition = { line: -1, visible: false };
				}, 2500); // blink for 2.5 seconds then hide
				return;
			}

			const text = heroLines[lineIndex].en;
			let charIndex = 0;

			// Show cursor at current line and start typing
			isTyping = true;
			cursorPosition = { line: lineIndex, visible: true };

			function typeChar() {
				if (charIndex <= text.length) {
					typedLines[lineIndex] = text.substring(0, charIndex);

					// Calculate delay with randomness
					let delay = baseTypeSpeed + Math.random() * randomVariation;

					// Add pause after punctuation
					const lastChar = text[charIndex - 1];
					if (lastChar && /[.,!?;:]/.test(lastChar)) {
						delay += punctuationPause;
					}

					charIndex++;
					setTimeout(typeChar, delay);
				} else {
					// Line complete - pause, then show Japanese
					isTyping = false;
					setTimeout(() => {
						showJapanese[lineIndex] = true;
						// Start next line
						setTimeout(() => {
							typeLine(lineIndex + 1);
						}, lineDelay);
					}, japaneseFadeDelay);
				}
			}

			typeChar();
		}

		// Cursor blink effect
		const blinkInterval = setInterval(() => {
			if (!isTyping && cursorPosition.line >= 0) {
				cursorPosition = { ...cursorPosition, visible: !cursorPosition.visible };
			}
		}, cursorBlinkSpeed);

		// Initialize arrays
		typedLines = new Array(heroLines.length).fill('');
		showJapanese = new Array(heroLines.length).fill(false);

		// Start typing
		typeLine(0);

		// Cleanup
		return () => clearInterval(blinkInterval);
	});
</script>

<svelte:head>
	<title>桃山学院大学 テック部</title>
	<meta
		name="description"
		content="桃山学院大学テック部は、テクノロジーとデザインの力で新しい価値を創造するクリエイティブ集団です。"
	/>
</svelte:head>

<svelte:window onmousemove={handleMouseMove} bind:scrollY />

<!-- Global Ambient Background - Minimalist Breathing Space -->
<!-- Global Ambient Background - Ultimate Silence -->
<div class="fixed inset-0 -z-50 overflow-hidden pointer-events-none" style="background: #FAFAFA;">
	<!-- Digital Noise Texture (Grain) -->
	<div
		class="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
		style="background-image: url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E&quot;);"
	></div>

	<!-- Spotlight (Mouse Follower) - Pure White on Off-White -->
	<div
		class="absolute h-[800px] w-[800px] rounded-full bg-white blur-[120px] transition-transform duration-100 ease-out will-change-transform mix-blend-normal opacity-80"
		style="left: -400px; top: -400px; transform: translate({mouseX}px, {mouseY}px);"
	></div>
</div>

<!-- Hero Section -->
<!-- Hero Section -->
<!-- Hero Section -->
<!-- Hero Section -->
<section class="hero-section relative min-h-screen w-full overflow-hidden">
	<div
		class="relative z-10 w-full h-full mx-auto min-h-screen flex flex-col justify-center py-32 px-6 md:px-12 lg:px-20"
	>
		<!-- Content Container with Max Width -->
		<div class="w-full max-w-[1200px] mx-auto">
			<!-- Desktop: Flex Row (7:3) / Mobile: Flex Column -->
			<div class="flex flex-col md:flex-row items-end w-full gap-12 md:gap-0">
				<!-- Left: English (70%) -->
				<div class="w-full md:w-[70%] flex flex-col gap-1 md:gap-1">
					{#each heroLines as line, i}
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

				<!-- Right: Japanese (30% - Bottom Aligned) -->
				<div class="w-full md:w-[30%] flex flex-col gap-4 md:gap-5 text-right pb-1 md:pb-2">
					{#each heroLines as line, i}
						<div class="flex justify-end" style="min-height: clamp(0.875rem, 1.1vw, 1.25rem);">
							{#if showJapanese[i]}
								<span
									class="block text-[#555] whitespace-nowrap leading-loose"
									style="font-family: 'Shippori Mincho', serif; letter-spacing: 0.1em; font-size: clamp(0.875rem, 1.1vw, 1.25rem); word-break: keep-all;"
									in:fade={{ duration: 800 }}
								>
									{line.ja}
								</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Activity Section - Transparent Blend -->
<div class="relative py-24 z-40 -mt-24 pt-48" use:reveal={{ threshold: 0.1 }}>
	<!-- Watermark -->
	<div
		class="absolute top-0 left-1/2 -translate-x-1/2 text-[15vw] font-bold text-gray-900 -z-10 select-none pointer-events-none leading-none tracking-tighter opacity-[0.03]"
		style="font-family: 'Inter', sans-serif;"
	>
		ACTIVITIES
	</div>

	<ActivitySection />
</div>

<!-- Projects Section - Transparent Blend -->
<div class="relative py-24 z-30 -mt-24 pt-48" use:reveal={{ threshold: 0.1 }}>
	<div
		class="absolute top-10 right-10 text-[12vw] font-bold text-gray-900 -z-10 select-none pointer-events-none leading-none tracking-tighter opacity-[0.03] text-right"
		style="font-family: 'Inter', sans-serif;"
	>
		PROJECTS
	</div>

	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
		<div class="mb-12">
			<h2 class="mb-4 text-4xl font-semibold tracking-tight md:text-5xl" style="color: #1A1A1A;">
				みんなのプロジェクト
			</h2>
			<p class="text-lg" style="color: #6B6B6B;">部員たちが開発した作品をご紹介します。</p>
		</div>

		<!-- Category Filter -->
		{#if categories.length > 0}
			<div class="mb-10">
				<CategoryFilter {categories} {selectedCategory} onSelect={handleCategorySelect} />
			</div>
		{/if}

		<!-- Projects Grid with flip animation -->
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
				<div class="mx-auto h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
					<span class="text-3xl">📂</span>
				</div>
				<p class="text-lg" style="color: #6B6B6B;">
					{selectedCategory === 'All'
						? 'プロジェクトはまだありません'
						: `「${selectedCategory}」カテゴリのプロジェクトはありません`}
				</p>
			</div>
		{/if}
	</div>
</div>

<!-- News Section - Transparent Blend -->
<div class="relative py-24 z-20 -mt-24 pt-48" use:reveal={{ threshold: 0.1 }}>
	<div
		class="absolute top-20 left-10 text-[15vw] font-bold text-gray-900 -z-10 select-none pointer-events-none leading-none tracking-tighter opacity-[0.03]"
		style="font-family: 'Inter', sans-serif;"
	>
		NEWS ROOM
	</div>

	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
		<div class="mb-16">
			<h2 class="mb-4 text-4xl font-semibold tracking-tight md:text-5xl" style="color: #1A1A1A;">
				Latest News.
			</h2>
			<p class="text-lg" style="color: #6b6b6b;">テック部の最新情報と活動ログ。</p>
		</div>

		<div class="grid gap-8 md:grid-cols-2">
			{#each data.news as item, i}
				<button
					type="button"
					class="news-card group relative flex w-full flex-col overflow-hidden rounded-3xl text-left transition-all duration-500 hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-gray-100"
					style="background: rgba(255, 255, 255, 0.5); backdrop-filter: blur(50px); border: 1px solid rgba(243, 244, 246, 1); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);"
					onclick={() => openNews(item)}
					use:reveal={{ threshold: 0.1 }}
				>
					<!-- Image Container with Zoom Effect -->
					<div class="aspect-[16/9] w-full overflow-hidden" style="background-color: #F5F5F7;">
						{#if item.coverUrl}
							<img
								src={item.coverUrl}
								alt={item.title}
								loading="lazy"
								onerror={handleImageError}
								class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
							/>
						{:else}
							<div
								class="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
							>
								<span class="text-4xl opacity-20">📰</span>
							</div>
						{/if}
					</div>

					<!-- Content -->
					<div class="flex flex-1 flex-col p-8">
						<!-- Meta -->
						<div class="mb-4 flex flex-wrap items-center gap-3">
							<time class="text-sm font-medium" style="color: #8b8b8b;">
								{new Date(item.date).toLocaleDateString('ja-JP', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
							</time>
							{#if item.tags && item.tags.length > 0}
								{#each item.tags as tag}
									<span
										class="rounded-full px-3 py-1 text-xs font-medium"
										style="background: #F5F5F7; color: #1D1D1F;"
									>
										{tag}
									</span>
								{/each}
							{/if}
						</div>

						<!-- Title -->
						<h3
							class="mb-3 text-2xl font-semibold leading-tight transition-colors"
							style="color: #1d1d1f;"
						>
							{item.title}
						</h3>

						<!-- Description (Excerpt) - Reveal on Hover -->
						{#if item.summary}
							<div
								class="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out group-hover:grid-rows-[1fr]"
							>
								<div class="overflow-hidden">
									<p class="mb-6 pt-4 text-sm leading-relaxed" style="color: #6b6b6b;">
										{item.summary}
									</p>
								</div>
							</div>
						{/if}

						<div
							class="mt-auto flex items-center gap-2 text-sm font-medium"
							style="color: #3b82f6;"
						>
							Read more
							<ArrowRight
								class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
							/>
						</div>
					</div>
				</button>
			{/each}
		</div>

		{#if data.news.length === 0}
			<div class="empty-state rounded-3xl bg-white p-16 text-center">
				<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50">
					<span class="text-3xl">📰</span>
				</div>
				<p class="text-lg" style="color: #6B6B6B;">ニュースはまだありません</p>
			</div>
		{:else}
			<div class="mt-16 text-center">
				<a
					href="https://momoyama-tech.notion.site/2f2bbfad8f0880ca9acbfb849c1af87c"
					target="_blank"
					rel="noopener noreferrer"
					class="see-all-link group inline-flex items-center gap-2 rounded-full px-8 py-4 font-medium transition-all duration-300 hover:-translate-y-1"
				>
					すべての記事を見る
					<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
				</a>
			</div>
		{/if}
	</div>
</div>

<!-- Schedule Section -->
<div class="relative py-24 z-10 -mt-24 pt-48 bg-transparent">
	<ScheduleSection scheduleData={data.scheduleData} pastEventsByMonth={data.pastEventsByMonth} />
</div>

{#if selectedNews}
	<!-- Modal Overlay -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
		transition:fade={{ duration: 200 }}
		onclick={closeNews}
		onkeydown={(e) => e.key === 'Escape' && closeNews()}
		tabindex="-1"
		role="dialog"
		aria-modal="true"
	>
		<div class="absolute inset-0 bg-black/30 backdrop-blur-md"></div>

		<!-- Modal Content -->
		<div
			class="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl"
			transition:fly={{ y: 50, duration: 400, easing: cubicOut }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="document"
			tabindex="0"
		>
			<!-- Close Button (Fixed within modal) -->
			<button
				class="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-black shadow-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
				onclick={closeNews}
			>
				<X class="h-5 w-5" />
			</button>

			<!-- Scrollable Content Area -->
			<div class="flex-1 overflow-y-auto overscroll-contain custom-scrollbar">
				<!-- Hero Image -->
				<div class="relative aspect-video w-full" style="background-color: #F5F5F7;">
					{#if selectedNews.coverUrl}
						<img
							src={selectedNews.coverUrl}
							alt={selectedNews.title}
							loading="lazy"
							onerror={handleImageError}
							class="h-full w-full object-cover"
						/>
					{:else}
						<div class="flex h-full w-full items-center justify-center bg-gray-50">
							<span class="text-6xl opacity-20">📰</span>
						</div>
					{/if}
				</div>

				<!-- Body -->
				<div class="p-8 pb-16 sm:p-10">
					<!-- Meta -->
					<div class="mb-6 flex flex-wrap items-center gap-4">
						<time class="text-sm font-medium" style="color: #8b8b8b;">
							{new Date(selectedNews.date).toLocaleDateString('ja-JP', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</time>
						{#if selectedNews.tags && selectedNews.tags.length > 0}
							{#each selectedNews.tags as tag}
								<span
									class="rounded-full px-3 py-1 text-xs font-medium"
									style="background: #F5F5F7; color: #1D1D1F;"
								>
									{tag}
								</span>
							{/each}
						{/if}
					</div>

					<h2 class="mb-6 text-3xl font-bold leading-tight" style="color: #1d1d1f;">
						{selectedNews.title}
					</h2>

					{#if selectedNews.summary}
						<div
							class="mb-8 border-l-4 border-gray-200 pl-4 font-medium text-gray-600 prose prose-lg max-w-none"
						>
							<p>{selectedNews.summary}</p>
						</div>
					{/if}

					<!-- Article Body -->
					<div class="article-body min-h-[200px]">
						{#if isLoadingContent}
							<div class="space-y-6 animate-pulse py-4">
								<div class="space-y-3">
									<div class="h-4 w-full rounded bg-gray-100"></div>
									<div class="h-4 w-5/6 rounded bg-gray-100"></div>
									<div class="h-4 w-4/6 rounded bg-gray-100"></div>
								</div>
								<div class="h-64 w-full rounded-xl bg-gray-100"></div>
								<div class="space-y-3">
									<div class="h-4 w-full rounded bg-gray-100"></div>
									<div class="h-4 w-11/12 rounded bg-gray-100"></div>
									<div class="h-4 w-3/4 rounded bg-gray-100"></div>
								</div>
							</div>
						{:else}
							<div
								class="prose prose-lg max-w-none text-gray-800 hover:prose-a:text-blue-500 prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-blue-600 prose-img:rounded-xl"
							>
								{@html newsContent}
							</div>
						{/if}
					</div>

					<div class="mt-12 border-t border-gray-100 pt-8 text-center">
						<a
							href={selectedNews.url}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 font-medium text-white transition-transform hover:scale-105"
						>
							Notionで開く <ArrowUpRight class="h-4 w-4" />
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Custom Scrollbar for Modal */
	.custom-scrollbar::-webkit-scrollbar {
		width: 0px;
		background: transparent;
	}
	.custom-scrollbar {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	/* Hero Section Base */
	/* Background handled globally */

	/* Mesh Gradient Container */

	/* News Card */
	.news-card {
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
	}

	.news-card:hover {
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
	}

	/* See All Link */
	.see-all-link {
		color: #1d1d1f;
		background: white;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
	}

	.see-all-link:hover {
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
	}

	.empty-state {
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
	}
</style>
