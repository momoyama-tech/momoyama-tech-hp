<script>
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import MessageSquare from 'lucide-svelte/icons/message-square';
	import Code2 from 'lucide-svelte/icons/code-2';
	import Film from 'lucide-svelte/icons/film';
	import GraduationCap from 'lucide-svelte/icons/graduation-cap';
	import Rocket from 'lucide-svelte/icons/rocket';
	import Terminal from 'lucide-svelte/icons/terminal';
	import Sparkles from 'lucide-svelte/icons/sparkles';
	import Users from 'lucide-svelte/icons/users';
	import { spotlight } from '$lib/actions/spotlight.js';
	import { localize } from '$lib/i18n/localize.svelte.js';

	const jp = {
		heading: 'サービス & プロジェクト',
		lead: '「こんなの作れる？」をテック部にご相談ください。Web・アプリ開発から映像・空間演出、IT教育、共同開発まで。学生団体だからこそ、企業の相場より抑えたご提案ができます。',
		cta: '無料で相談する',
		forWhomLabel: 'こんな方に',
		card1: {
			title: 'Web・システム開発',
			body: '「集客につながるHPが欲しい」「校務やシフト管理をラクにしたい」——その課題を、モダンな技術（Next.js / SvelteKit）でスピーディに形にします。公開後の更新・運用サポートまで対応。',
			forWhom: '店舗・企業・学校・サークルのWeb担当者',
			tags: ['#HP制作', '#LP', '#業務ツール', '#Webアプリ']
		},
		card2: {
			title: 'プロジェクションマッピング & 映像・配信',
			body: '式典やイベントの「主役級の演出」を、企画・撮影・CG・当日のオペレーションまで一式で。会場の規模やご予算に合わせて構成します。',
			forWhom: '周年式典・学園祭・地域イベントの主催者',
			tags: ['#空間演出', '#式典動画', '#ライブ配信', '#イベント']
		},
		card3: {
			title: 'プログラミング教育・ワークショップ',
			body: '子ども向けの体験教室から、学生・社員向けのIT研修まで。「何から教えればいいか分からない」段階から、カリキュラム設計・当日の運営までお任せいただけます。',
			forWhom: '自治体・学校・企業の研修／イベント担当者',
			tags: ['#地域貢献', '#子ども向け', '#体験講座', '#ITリテラシー']
		},
		card4: {
			title: '学生主導プロジェクト・共同開発',
			body: '「新しいアイデアを一緒に試したい」——企業・地域・学内との共同開発を、企画から実証、運用まで学生チームが伴走。産学連携の実績づくりにも。',
			forWhom: '新規事業・産学連携をお考えの企業・団体',
			tags: ['#学生プロジェクト', '#産学連携', '#プロダクト共創', '#アジャイル開発']
		},
		flowLabel: 'ご依頼の流れ',
		flow: [
			{ step: '01', title: '相談（無料）', body: 'フォームやメールで、ざっくりした内容でOK。' },
			{ step: '02', title: 'お見積もり（無料）', body: 'ご予算・納期に合わせてご提案します。' },
			{ step: '03', title: '制作', body: '進捗を共有しながら進めます。' },
			{ step: '04', title: '納品・サポート', body: '公開後の更新や運用もフォロー。' }
		],
		closeTitle: 'まずは相談してみませんか？',
		closeBody:
			'「予算内でできる？」だけでもOK。学生団体だからこそ、企業の相場より抑えたご提案ができます。ご相談・お見積もりは無料、2〜3営業日以内にご返信します。',
		closeNote: '自治体・大学・地域イベントでの制作実績があります。',
		seeWorks: '実績を見る'
	};
	const c = localize(() => jp);

	function openInquiry(context = '') {
		window.dispatchEvent(new CustomEvent('open-contact', { detail: { context } }));
	}
</script>

<section
	id="services"
	class="relative py-24 z-30 overflow-hidden text-[#1D1D1F] dark:text-white"
	style="scroll-margin-top: 80px;"
>
	<!-- Ambient Glow Layers (自然な陰影と空間の奥行き) -->
	<div
		class="w-[500px] h-[500px] rounded-full bg-cyan-500/4 blur-[140px] pointer-events-none absolute -top-24 -left-24"
		aria-hidden="true"
	></div>
	<div
		class="w-[600px] h-[600px] rounded-full bg-purple-500/3 blur-[160px] pointer-events-none absolute -bottom-32 -right-32"
		aria-hidden="true"
	></div>

	<div class="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 relative z-10">
		<!-- Section Header (くっきり鮮明な表示) -->
		<div class="mb-16">
			<div class="mb-3">
				<p class="font-mono text-xs tracking-[0.25em] text-cyan-600 dark:text-cyan-400 uppercase font-semibold">
					Student Projects & Capabilities
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
				<div class="absolute inset-0 bg-linear-to-r from-cyan-500/50 via-black/10 dark:via-white/20 to-transparent"></div>
			</div>
		</div>

		<!-- Bento Grid (非対称レイアウト: 2+1, 1+2) -->
		<div class="grid gap-6 grid-cols-1 md:grid-cols-3">
			<!-- Card 1: Web・システム開発 (2カラム大型カード) -->
			<div
				use:spotlight
				class="group relative md:col-span-2 flex flex-col justify-between p-8 sm:p-10 rounded-2xl bg-white/70 dark:bg-[#141414]/90 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/30 backdrop-blur-md transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden"
			>
				<!-- Mouse-following Spotlight Layer -->
				<div
					class="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
					style="background: radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255,255,255,0.07), transparent 40%);"
				></div>

				<!-- 巨大インデックスナンバー -->
				<div
					class="font-mono text-7xl md:text-8xl font-black text-black/[0.04] dark:text-white/5 select-none pointer-events-none absolute right-6 bottom-4"
				>
					01
				</div>

				<div class="relative z-10">
					<!-- Top Meta -->
					<div class="flex items-center justify-between pb-6 mb-6 border-b border-black/10 dark:border-white/10">
						<div class="flex items-center gap-3">
							<div class="w-6 h-0.5 bg-cyan-400"></div>
							<span class="font-mono text-[11px] tracking-[0.25em] text-zinc-500 dark:text-zinc-400 uppercase font-medium">
								WEB & SYSTEM DEVELOPMENT
							</span>
						</div>
						<div class="text-zinc-400 group-hover:text-[#1D1D1F] dark:group-hover:text-white transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
							<ArrowUpRight class="h-5 w-5" />
						</div>
					</div>

					<div class="grid md:grid-cols-12 gap-8 items-start">
						<!-- Main Info -->
						<div class="md:col-span-7">
							<div class="mb-5 inline-flex p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-black/10 dark:border-white/15 text-cyan-600 dark:text-cyan-400 shadow-md">
								<Code2 class="h-6 w-6" />
							</div>
							<h3 class="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white mb-3">
								{c.value.card1.title}
							</h3>
							<p class="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 font-normal mb-4">
								{c.value.card1.body}
							</p>
							<p class="text-xs text-zinc-500 dark:text-zinc-400">
								<span class="font-mono text-[10px] uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mr-2">{c.value.forWhomLabel}</span>{c.value.card1.forWhom}
							</p>
						</div>

						<!-- Code Preview Mock UI (立体的に浮かび上がるモック) -->
						<div class="md:col-span-5 hidden sm:block">
							<div class="rounded-xl bg-[#0a0a0a] border border-white/15 p-4 font-mono text-[11px] text-zinc-300 shadow-xl">
								<div class="flex items-center gap-1.5 mb-3 pb-2 border-b border-white/10">
									<div class="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
									<div class="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
									<div class="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
									<span class="text-[10px] text-zinc-500 ml-2">app/project.tsx</span>
								</div>
								<p class="text-purple-400">const <span class="text-cyan-400">solution</span> = {'{'}</p>
								<p class="pl-3 text-zinc-300">stack: <span class="text-emerald-400">['Next.js', 'SvelteKit']</span>,</p>
								<p class="pl-3 text-zinc-300">quality: <span class="text-amber-300">'Production Grade'</span>,</p>
								<p class="pl-3 text-zinc-300">responsive: <span class="text-blue-400">true</span></p>
								<p class="text-purple-400">{'}'};</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Tags -->
				<div class="relative z-10 pt-6 mt-4 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center gap-2">
					{#each c.value.card1.tags as tag}
						<span class="font-mono text-xs tracking-wide px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-300 font-medium">
							{tag}
						</span>
					{/each}
					<button
						type="button"
						onclick={() => openInquiry(jp.card1.title)}
						class="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-cyan-600 dark:text-cyan-400 transition-all hover:gap-2.5"
					>
						{c.value.cta}
						<ArrowRight class="h-3.5 w-3.5" />
					</button>
				</div>
			</div>

			<!-- Card 2: プロジェクションマッピング・映像 (1カラム強調カード) -->
			<div
				use:spotlight
				class="group relative flex flex-col justify-between p-8 sm:p-10 rounded-2xl bg-white/70 dark:bg-[#141414]/90 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/30 backdrop-blur-md transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden"
			>
				<div
					class="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
					style="background: radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255,255,255,0.07), transparent 40%);"
				></div>

				<!-- 巨大インデックスナンバー -->
				<div
					class="font-mono text-7xl md:text-8xl font-black text-black/[0.04] dark:text-white/5 select-none pointer-events-none absolute right-6 bottom-4"
				>
					02
				</div>

				<div class="relative z-10">
					<div class="flex items-center justify-between pb-6 mb-6 border-b border-black/10 dark:border-white/10">
						<div class="flex items-center gap-3">
							<div class="w-6 h-0.5 bg-purple-400"></div>
							<span class="font-mono text-[11px] tracking-[0.25em] text-zinc-500 dark:text-zinc-400 uppercase font-medium">
								CREATIVE & MAPPING
							</span>
						</div>
						<div class="text-zinc-400 group-hover:text-[#1D1D1F] dark:group-hover:text-white transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
							<ArrowUpRight class="h-5 w-5" />
						</div>
					</div>

					<div class="mb-5 inline-flex p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-black/10 dark:border-white/15 text-purple-600 dark:text-purple-400 shadow-md">
						<Film class="h-6 w-6" />
					</div>

					<h3 class="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white mb-3">
						{c.value.card2.title}
					</h3>
					<p class="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 font-normal mb-4">
						{c.value.card2.body}
					</p>
					<p class="text-xs text-zinc-500 dark:text-zinc-400">
						<span class="font-mono text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-400 mr-2">{c.value.forWhomLabel}</span>{c.value.card2.forWhom}
					</p>
				</div>

				<div class="relative z-10 pt-6 mt-4 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center gap-2">
					{#each c.value.card2.tags as tag}
						<span class="font-mono text-xs tracking-wide px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-300 font-medium">
							{tag}
						</span>
					{/each}
					<button
						type="button"
						onclick={() => openInquiry(jp.card2.title)}
						class="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-purple-600 dark:text-purple-400 transition-all hover:gap-2.5"
					>
						{c.value.cta}
						<ArrowRight class="h-3.5 w-3.5" />
					</button>
				</div>
			</div>

			<!-- Card 3: プログラミング教育・ワークショップ (1カラムコンパクトカード) -->
			<div
				use:spotlight
				class="group relative flex flex-col justify-between p-8 sm:p-10 rounded-2xl bg-white/70 dark:bg-[#141414]/90 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/30 backdrop-blur-md transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden"
			>
				<div
					class="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
					style="background: radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255,255,255,0.07), transparent 40%);"
				></div>

				<!-- 巨大インデックスナンバー -->
				<div
					class="font-mono text-7xl md:text-8xl font-black text-black/[0.04] dark:text-white/5 select-none pointer-events-none absolute right-6 bottom-4"
				>
					03
				</div>

				<div class="relative z-10">
					<div class="flex items-center justify-between pb-6 mb-6 border-b border-black/10 dark:border-white/10">
						<div class="flex items-center gap-3">
							<div class="w-6 h-0.5 bg-emerald-400"></div>
							<span class="font-mono text-[11px] tracking-[0.25em] text-zinc-500 dark:text-zinc-400 uppercase font-medium">
								EDUCATION & WORKSHOP
							</span>
						</div>
						<div class="text-zinc-400 group-hover:text-[#1D1D1F] dark:group-hover:text-white transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
							<ArrowUpRight class="h-5 w-5" />
						</div>
					</div>

					<div class="mb-5 inline-flex p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-black/10 dark:border-white/15 text-emerald-600 dark:text-emerald-400 shadow-md">
						<GraduationCap class="h-6 w-6" />
					</div>

					<h3 class="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white mb-3">
						{c.value.card3.title}
					</h3>
					<p class="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 font-normal mb-4">
						{c.value.card3.body}
					</p>
					<p class="text-xs text-zinc-500 dark:text-zinc-400">
						<span class="font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mr-2">{c.value.forWhomLabel}</span>{c.value.card3.forWhom}
					</p>
				</div>

				<div class="relative z-10 pt-6 mt-4 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center gap-2">
					{#each c.value.card3.tags as tag}
						<span class="font-mono text-xs tracking-wide px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-300 font-medium">
							{tag}
						</span>
					{/each}
					<button
						type="button"
						onclick={() => openInquiry(jp.card3.title)}
						class="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400 transition-all hover:gap-2.5"
					>
						{c.value.cta}
						<ArrowRight class="h-3.5 w-3.5" />
					</button>
				</div>
			</div>

			<!-- Card 4: 学生主導プロジェクト・共同開発 (2カラム大型カード) -->
			<div
				use:spotlight
				class="group relative md:col-span-2 flex flex-col justify-between p-8 sm:p-10 rounded-2xl bg-white/70 dark:bg-[#141414]/90 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/30 backdrop-blur-md transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden"
			>
				<div
					class="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
					style="background: radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255,255,255,0.07), transparent 40%);"
				></div>

				<!-- 巨大インデックスナンバー -->
				<div
					class="font-mono text-7xl md:text-8xl font-black text-black/[0.04] dark:text-white/5 select-none pointer-events-none absolute right-6 bottom-4"
				>
					04
				</div>

				<div class="relative z-10">
					<div class="flex items-center justify-between pb-6 mb-6 border-b border-black/10 dark:border-white/10">
						<div class="flex items-center gap-3">
							<div class="w-6 h-0.5 bg-amber-400"></div>
							<span class="font-mono text-[11px] tracking-[0.25em] text-zinc-500 dark:text-zinc-400 uppercase font-medium">
								STUDENT PROJECTS & COLLABORATION
							</span>
						</div>
						<div class="text-zinc-400 group-hover:text-[#1D1D1F] dark:group-hover:text-white transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
							<ArrowUpRight class="h-5 w-5" />
						</div>
					</div>

					<div class="grid md:grid-cols-12 gap-8 items-start">
						<div class="md:col-span-7">
							<div class="mb-5 inline-flex p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-black/10 dark:border-white/15 text-amber-600 dark:text-amber-400 shadow-md">
								<Rocket class="h-6 w-6" />
							</div>
							<h3 class="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white mb-3">
								{c.value.card4.title}
							</h3>
							<p class="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 font-normal mb-4">
								{c.value.card4.body}
							</p>
							<p class="text-xs text-zinc-500 dark:text-zinc-400">
								<span class="font-mono text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 mr-2">{c.value.forWhomLabel}</span>{c.value.card4.forWhom}
							</p>
						</div>

						<div class="md:col-span-5 hidden sm:flex flex-col gap-3">
							<div class="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-100 dark:bg-[#0a0a0a] border border-black/10 dark:border-white/15 shadow-md">
								<Users class="h-4 w-4 text-cyan-400" />
								<span class="text-xs text-zinc-700 dark:text-zinc-200 font-mono">Team-Driven Development</span>
							</div>
							<div class="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-100 dark:bg-[#0a0a0a] border border-black/10 dark:border-white/15 shadow-md">
								<Sparkles class="h-4 w-4 text-amber-400" />
								<span class="text-xs text-zinc-700 dark:text-zinc-200 font-mono">Real-world Project Delivery</span>
							</div>
						</div>
					</div>
				</div>

				<div class="relative z-10 pt-6 mt-4 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center gap-2">
					{#each c.value.card4.tags as tag}
						<span class="font-mono text-xs tracking-wide px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-300 font-medium">
							{tag}
						</span>
					{/each}
					<button
						type="button"
						onclick={() => openInquiry(jp.card4.title)}
						class="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-amber-600 dark:text-amber-400 transition-all hover:gap-2.5"
					>
						{c.value.cta}
						<ArrowRight class="h-3.5 w-3.5" />
					</button>
				</div>
			</div>
		</div>

		<!-- ご依頼の流れ -->
		<div class="mt-20">
			<div class="mb-8 flex items-center gap-3">
				<div class="w-6 h-0.5 bg-cyan-400"></div>
				<span class="font-mono text-[11px] tracking-[0.25em] text-zinc-500 dark:text-zinc-400 uppercase font-medium">
					{c.value.flowLabel}
				</span>
			</div>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{#each c.value.flow as f, i}
					<div class="relative rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-5">
						<span class="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">{f.step}</span>
						<h4 class="mt-2 text-sm font-bold tracking-tight text-[#1D1D1F] dark:text-white">
							{f.title}
						</h4>
						<p class="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{f.body}</p>
						{#if i < c.value.flow.length - 1}
							<ArrowRight
								class="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 dark:text-zinc-600"
							/>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Closing CTA -->
		<div
			use:spotlight
			class="group relative mt-16 overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-[#141414] dark:bg-[#141414] p-8 sm:p-12 text-center"
		>
			<div
				class="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
				style="background: radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(34,211,238,0.12), transparent 40%);"
			></div>
			<div class="relative z-10 mx-auto max-w-2xl">
				<h3 class="text-2xl sm:text-3xl font-bold tracking-tight text-white">
					{c.value.closeTitle}
				</h3>
				<p class="mt-4 text-sm leading-relaxed text-zinc-300">
					{c.value.closeBody}
				</p>
				<div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
					<button
						type="button"
						onclick={() => openInquiry('')}
						class="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-xs font-mono uppercase tracking-[0.2em] font-semibold text-black transition-transform hover:scale-[1.03]"
					>
						<MessageSquare class="h-4 w-4" />
						{c.value.cta}
					</button>
					<a
						href="/works"
						class="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-white"
					>
						{c.value.seeWorks}
						<ArrowRight class="h-3.5 w-3.5" />
					</a>
				</div>
				<p class="mt-6 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
					{c.value.closeNote}
				</p>
			</div>
		</div>
	</div>
</section>
