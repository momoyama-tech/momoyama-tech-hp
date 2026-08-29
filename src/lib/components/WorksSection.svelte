<script>
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import Minus from 'lucide-svelte/icons/minus';
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { spotlight } from '$lib/actions/spotlight.js';
	import { localize } from '$lib/i18n/localize.svelte.js';

	const jp = {
		heading: '実績紹介',
		lead: '自治体や大学、地域イベントにおける空間演出・映像制作などのプロジェクト実績をアーカイブしています。'
	};
	const c = localize(() => jp);

	/**
	 * @typedef {Object} WorkItem
	 * @property {string} id
	 * @property {string} title
	 * @property {string} category
	 * @property {string} year
	 * @property {string} [badge]
	 * @property {string} [description]
	 * @property {string[]} [tags]
	 */

	const defaultWorks = [
		{
			id: 'work-1',
			title: '和泉市 市制70周年記念式典 オープニング動画制作',
			category: '映像制作・式典演出',
			year: '2026',
			badge: 'Municipal Ceremony',
			description:
				'和泉市制70周年の節目を祝う記念式典にて、オープニング映像の企画・CG制作・編集を担当。市の歩みと未来への躍進をダイナミックなビジュアルで表現しました。',
			tags: ['#映像制作', '#モーショングラフィックス', '#式典演出', '#自治体連携']
		},
		{
			id: 'work-2',
			title: '大学祭（桃祭） プロジェクションマッピング',
			category: '空間演出 / マッピング',
			year: '2025',
			badge: 'Campus Festival',
			description:
				'桃山学院大学の学園祭にて、校舎壁面を活用したプロジェクションマッピングショーを制作・上映。音と光が連動する空間演出でキャンパスを彩りました。',
			tags: ['#空間演出', '#プロジェクションマッピング', '#学園祭', '#音響連動']
		},
		{
			id: 'work-3',
			title: '商工祭 プロジェクションマッピング',
			category: '地域連携 / 空間演出',
			year: '2025',
			badge: 'Regional Event',
			description:
				'地域の商工祭と連携し、屋外特設ブースでの空間演出およびプロジェクションマッピングを実施。地域住民や子どもたちに向けた参加型演出も手がけました。',
			tags: ['#地域連携', '#イベント演出', '#空間デザイン', '#商工祭']
		}
	];

	let { works = defaultWorks } = $props();
	const w = localize(() => works);

	// Accordion state (first one open by default)
	let activeId = $state('work-1');

	function toggleAccordion(id) {
		activeId = activeId === id ? '' : id;
	}
</script>

<section
	id="works"
	class="relative py-24 z-25 overflow-hidden text-[#1D1D1F] dark:text-white"
	style="scroll-margin-top: 80px;"
>
	<!-- Ambient Glow Layers -->
	<div
		class="w-[500px] h-[500px] rounded-full bg-purple-500/[0.04] blur-[140px] pointer-events-none absolute -top-24 -right-24"
		aria-hidden="true"
	></div>
	<div
		class="w-[600px] h-[600px] rounded-full bg-cyan-500/[0.03] blur-[160px] pointer-events-none absolute -bottom-32 -left-32"
		aria-hidden="true"
	></div>

	<div class="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 relative z-10">
		<!-- Section Header -->
		<div class="mb-16">
			<div class="mb-3">
				<p class="font-mono text-xs tracking-[0.25em] text-cyan-600 dark:text-cyan-400 uppercase font-semibold">
					Selected Works & Archives
				</p>
			</div>

			<div>
				<h2 class="font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-[#1D1D1F] dark:text-white mb-4">
					{c.value.heading}
				</h2>
				<p class="text-zinc-600 dark:text-zinc-300 text-base max-w-2xl leading-relaxed">
					{c.value.lead}
				</p>
			</div>

			<!-- Divider Line -->
			<div class="mt-8 relative h-px w-full bg-black/10 dark:bg-white/10 overflow-hidden">
				<div class="absolute inset-0 bg-linear-to-r from-purple-500/50 via-black/10 dark:via-white/20 to-transparent"></div>
			</div>
		</div>

		<!-- Billboard Live Style: Bordered List / Accordion -->
		<div class="border-b border-black/10 dark:border-white/10">
			{#each w.value as item, idx}
				{@const isOpen = activeId === item.id}
				<div
					use:spotlight
					class="group relative border-t border-black/10 dark:border-white/10 transition-colors duration-300 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] overflow-hidden"
				>
					<!-- Mouse-following Spotlight Layer -->
					<div
						class="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
						style="background: radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255,255,255,0.06), transparent 40%);"
					></div>

					<!-- Clickable Row Header -->
					<button
						type="button"
						onclick={() => toggleAccordion(item.id)}
						class="w-full text-left py-8 sm:py-10 px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer relative z-10"
					>
						<!-- Left: Index + Year + Category -->
						<div class="flex items-center gap-6 md:w-1/3">
							<span class="font-mono text-sm text-cyan-600 dark:text-cyan-400 font-semibold tracking-widest">
								0{idx + 1}
							</span>
							<div class="flex items-center gap-3 font-mono text-xs">
								<span class="font-semibold text-[#1D1D1F] dark:text-white">{item.year}</span>
								<span class="text-zinc-400 dark:text-zinc-500">/</span>
								<span class="tracking-wider text-zinc-500 dark:text-zinc-300 uppercase font-medium">{item.category}</span>
							</div>
						</div>

						<!-- Center: Title -->
						<div class="md:w-1/2">
							<h3 class="text-lg sm:text-xl font-medium tracking-tight text-[#1D1D1F] dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
								{item.title}
							</h3>
						</div>

						<!-- Right: Action Icon & Status -->
						<div class="flex items-center justify-between md:justify-end gap-4 md:w-1/6">
							<span class="font-mono text-[10px] tracking-widest text-zinc-500 dark:text-zinc-400 uppercase hidden lg:inline-block">
								{item.badge}
							</span>
							<div class="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 border border-black/10 dark:border-white/15 text-[#1D1D1F] dark:text-white group-hover:border-cyan-600 dark:group-hover:border-cyan-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-all duration-300">
								{#if isOpen}
									<Minus class="h-4 w-4" />
								{:else}
									<ArrowUpRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
								{/if}
							</div>
						</div>
					</button>

					<!-- Accordion Expandable Content -->
					{#if isOpen}
						<div
							transition:slide={{ duration: 300, easing: cubicOut }}
							class="px-4 sm:px-6 pb-10 pt-2 relative z-10"
						>
							<div class="rounded-xl p-6 sm:p-8 bg-white/80 dark:bg-[#141414]/90 border border-black/10 dark:border-white/15 shadow-xl grid md:grid-cols-12 gap-6 items-center">
								<div class="md:col-span-8">
									<div class="flex items-center gap-2 mb-3">
										<div class="w-4 h-[2px] bg-cyan-500 dark:bg-cyan-400"></div>
										<span class="font-mono text-[11px] tracking-[0.25em] text-zinc-500 dark:text-zinc-400 uppercase font-medium">PROJECT OVERVIEW</span>
									</div>
									<p class="text-sm leading-relaxed text-zinc-700 dark:text-zinc-200 font-normal mb-6">
										{item.description}
									</p>
									{#if item.tags}
										<div class="flex flex-wrap gap-2">
											{#each item.tags as tag}
												<span class="font-mono text-xs tracking-wide px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-300 font-medium">
													{tag}
												</span>
											{/each}
										</div>
									{/if}
								</div>

								<div class="md:col-span-4 flex flex-col items-start md:items-end justify-center gap-2 border-t md:border-t-0 md:border-l border-black/10 dark:border-white/10 pt-4 md:pt-0 md:pl-6">
									<span class="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">RECORD STATUS</span>
									<span class="font-mono text-xs font-semibold text-[#1D1D1F] dark:text-white flex items-center gap-2">
										<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
										COMPLETED & ARCHIVED
									</span>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>
