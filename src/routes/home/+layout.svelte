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
	import SphereNav from '$lib/components/SphereNav.svelte';

	const portalCards = [
		{
			href: '/services',
			no: '01',
			title: 'Services',
			desc: 'Web制作・映像演出・IT教育・プロジェクト共創',
			icon: Code2,
			accent: 'cyan',
			preview: '/sphere-previews/services.png'
		},
		{
			href: '/works',
			no: '02',
			title: 'Works',
			desc: '式典動画・プロジェクションマッピング実績',
			icon: Clapperboard,
			accent: 'purple',
			preview: '/sphere-previews/works.png'
		},
		{
			href: '/projects',
			no: '03',
			title: 'Projects',
			desc: '部員が制作したプロダクト・作品一覧',
			icon: FolderGit2,
			accent: 'emerald',
			preview: '/sphere-previews/projects.png'
		},
		{
			href: '/contact',
			no: '04',
			title: 'Contact',
			desc: 'ご相談・お見積り・お問い合わせ',
			icon: MailIcon,
			accent: 'amber',
			preview: '/sphere-previews/contact.png'
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

	import ScheduleSection from '$lib/components/ScheduleSection.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import CategoryFilter from '$lib/components/CategoryFilter.svelte';
	import SecretPalette from '$lib/components/SecretPalette.svelte';
	import WorksSection from '$lib/components/WorksSection.svelte';

	let { data, children } = $props();

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

<div
	class="fixed inset-0 -z-50 overflow-hidden pointer-events-none transition-colors duration-500 bg-[#FAFAFA] dark:bg-black"
>
	<div
		class="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
		style="background-image: url(&quot;data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E&quot;);"
	></div>
</div>

<!-- Quick Navigation Portal -->
<div class="relative z-30">
	<SphereNav cards={portalCards}>
		<div class="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
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
	</SphereNav>
</div>

<!-- Modal Insertion -->
{@render children()}

<!-- Secret Easter Egg -->
<SecretPalette />
