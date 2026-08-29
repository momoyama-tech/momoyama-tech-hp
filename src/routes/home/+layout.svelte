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
	import Code2 from 'lucide-svelte/icons/code-2';
	import Clapperboard from 'lucide-svelte/icons/clapperboard';
	import FolderGit2 from 'lucide-svelte/icons/folder-git-2';
	import MailIcon from 'lucide-svelte/icons/mail';
	import { spotlight } from '$lib/actions/spotlight.js';

	const portalCards = [
		{
			href: '/services',
			no: '01',
			title: 'Services',
			desc: 'Web制作・映像演出・IT教育・プロジェクト共創',
			icon: Code2,
			accent: 'cyan'
		},
		{
			href: '/works',
			no: '02',
			title: 'Works',
			desc: '式典動画・プロジェクションマッピング実績',
			icon: Clapperboard,
			accent: 'purple'
		},
		{
			href: '/projects',
			no: '03',
			title: 'Projects',
			desc: '部員が制作したプロダクト・作品一覧',
			icon: FolderGit2,
			accent: 'emerald'
		},
		{
			href: '/contact',
			no: '04',
			title: 'Contact',
			desc: 'ご相談・お見積り・お問い合わせ',
			icon: MailIcon,
			accent: 'amber'
		}
	];

	/** @type {Record<string, string>} */
	const accentIcon = {
		cyan: 'text-cyan-600 dark:text-cyan-400',
		purple: 'text-purple-600 dark:text-purple-400',
		emerald: 'text-emerald-600 dark:text-emerald-400',
		amber: 'text-amber-600 dark:text-amber-400'
	};
	/** @type {Record<string, string>} */
	const accentGlow = {
		cyan: 'group-hover:shadow-[0_0_40px_-8px_rgba(34,211,238,0.35)] group-hover:border-cyan-400/50',
		purple: 'group-hover:shadow-[0_0_40px_-8px_rgba(168,85,247,0.35)] group-hover:border-purple-400/50',
		emerald:
			'group-hover:shadow-[0_0_40px_-8px_rgba(16,185,129,0.35)] group-hover:border-emerald-400/50',
		amber: 'group-hover:shadow-[0_0_40px_-8px_rgba(245,158,11,0.35)] group-hover:border-amber-400/50'
	};

	import ActivitySection from '$lib/components/ActivitySection.svelte';
	import ScheduleSection from '$lib/components/ScheduleSection.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import CategoryFilter from '$lib/components/CategoryFilter.svelte';
	import SecretPalette from '$lib/components/SecretPalette.svelte';
	import ServicesSection from '$lib/components/ServicesSection.svelte';
	import WorksSection from '$lib/components/WorksSection.svelte';
	import ContactSection from '$lib/components/ContactSection.svelte';
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

	// The spotlight ("light" mode) is a hero-only effect. Track whether the
	// hero section is still on screen so it never bleeds onto other sections.
	let heroSection = $state();
	let heroInView = $state(true);

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

	$effect(() => {
		const _s = scrollY;
		const _h = innerHeight;
		if (heroSection) {
			heroInView = heroSection.getBoundingClientRect().bottom > 120;
		}
	});

	// Reactive Light Detection for Headings
	let projectsTitle = $state();
	let newsTitle = $state();
	let isProjectsLit = $state(false);
	let isNewsLit = $state(false);

	$effect(() => {
		// The spotlight "light" effect is intentionally limited to the hero,
		// so the section headings no longer react to it.
		isProjectsLit = false;
		isNewsLit = false;
	});

	let displayNews = $derived(
		language.current === 'EN' && translatedNews.length > 0 ? translatedNews : data.news
	);
</script>

<svelte:window onmousemove={handleMouseMove} bind:scrollY bind:innerWidth bind:innerHeight />

<!-- Global Ambient Background & Spotlight -->
<!-- Global Ambient Background & Spotlight -->
<div
	class="fixed inset-0 z-9999 overflow-hidden pointer-events-none"
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
			opacity: {theme.isDark && theme.isSpotlightEnabled && heroInView ? 1 : 0};
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
<section bind:this={heroSection} class="hero-section relative min-h-screen w-full overflow-hidden">
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
					<!-- Standard text styling. In normal state (Spotlight OFF), clearly visible with full opacity. -->
					<div
						class="flex flex-col gap-1 md:gap-1"
					>
						{#each heroTextEN as line, i}
							<div class="overflow-hidden" style="min-height: clamp(2rem, 6vw, 4.5rem);">
								<span
									class="block text-black leading-[1.1] tracking-tighter wrap-break-word antialiased transition-colors duration-300 dark:text-white"
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

					<!-- Layer 2: Darkness Overlay + Spotlight Hole (Active only when Spotlight is switched ON) -->
					{#if theme.isDark && theme.isSpotlightEnabled}
						<div
							bind:this={heroContainer}
							class="hero-mask-overlay absolute inset-0 z-20 pointer-events-none"
							style="
								background-color: #0a0a0a;
								mask-image: radial-gradient(circle 200px at var(--mask-x, var(--x)) var(--mask-y, var(--y)), transparent 20%, black 80%);
								-webkit-mask-image: radial-gradient(circle 200px at var(--mask-x, var(--x)) var(--mask-y, var(--y)), transparent 20%, black 80%);
								--x: {heroMaskPos.x}px;
								--y: {heroMaskPos.y}px;
							"
						></div>
					{/if}
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

<!-- Activity Section (Overview) -->
<div class="relative py-24 z-40 -mt-24 pt-48" use:reveal={{ threshold: 0.1 }}>
	<div
		class="absolute top-0 left-1/2 -translate-x-1/2 text-[15vw] font-bold text-gray-900 -z-10 select-none pointer-events-none leading-none tracking-tighter opacity-[0.03]"
		style="font-family: 'Inter', sans-serif;"
	>
		ACTIVITIES
	</div>
	<ActivitySection />
</div>

<!-- Services Section -->
<div class="relative py-12 z-35" use:reveal={{ threshold: 0.1 }}>
	<div
		class="absolute top-0 left-1/2 -translate-x-1/2 text-[15vw] font-bold text-gray-900 -z-10 select-none pointer-events-none leading-none tracking-tighter opacity-[0.03]"
		style="font-family: 'Inter', sans-serif;"
	>
		SERVICES
	</div>
	<ServicesSection />
</div>

<!-- Contact Section -->
<div class="relative py-12 z-35" use:reveal={{ threshold: 0.1 }}>
	<div
		class="absolute top-0 left-1/2 -translate-x-1/2 text-[15vw] font-bold text-gray-900 -z-10 select-none pointer-events-none leading-none tracking-tighter opacity-[0.03]"
		style="font-family: 'Inter', sans-serif;"
	>
		CONTACT
	</div>
	<ContactSection />
</div>

<!-- Quick Navigation Portal -->
<div class="relative py-24 z-30 -mt-12" use:reveal={{ threshold: 0.1 }}>
	<div class="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
		<div class="mb-12">
			<span class="font-mono text-xs tracking-[0.25em] text-zinc-500 uppercase">Explore Portal</span>
			<h2 class="font-light text-3xl sm:text-4xl tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
				コンテンツ一覧
			</h2>
		</div>

		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each portalCards as card (card.href)}
				{@const Icon = card.icon}
				<a
					href={card.href}
					use:spotlight
					class="group relative flex min-h-[15rem] flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-500/5 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:bg-white dark:border-white/10 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 {accentGlow[
						card.accent
					]}"
				>
					<!-- mouse-following spotlight -->
					<div
						class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						style="background: radial-gradient(500px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(120,120,120,0.12), transparent 45%);"
					></div>

					<!-- giant index watermark -->
					<span
						class="pointer-events-none absolute -bottom-6 -right-2 select-none font-mono text-[6.5rem] font-black leading-none text-black/[0.04] transition-transform duration-500 group-hover:scale-110 dark:text-white/[0.05]"
					>
						{card.no}
					</span>

					<div class="relative z-10 flex items-start justify-between">
						<div
							class="inline-flex rounded-xl border border-black/5 bg-white p-2.5 shadow-sm dark:border-white/10 dark:bg-zinc-800 {accentIcon[
								card.accent
							]}"
						>
							<Icon class="h-5 w-5" />
						</div>
						<ArrowUpRight
							class="h-4 w-4 text-zinc-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-zinc-900 dark:group-hover:text-white"
						/>
					</div>

					<div class="relative z-10">
						<h3 class="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
							{card.title}
						</h3>
						<p class="mt-2 text-xs font-light leading-relaxed text-zinc-500 dark:text-zinc-400">
							{card.desc}
						</p>
						<div
							class="mt-4 flex items-center gap-1.5 border-t border-black/5 pt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 transition-colors group-hover:text-zinc-900 dark:border-white/10 dark:group-hover:text-white"
						>
							開く
							<ArrowRight
								class="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1"
							/>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
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
