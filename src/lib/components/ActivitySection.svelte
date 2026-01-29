<script>
	import ActivityTile from './ActivityTile.svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { language } from '$lib/stores/language.svelte.js';
	import { translations } from '$lib/i18n/translations.js';

	import { translationStore } from '$lib/stores/translation.svelte.js';

	let visible = $state(false);

	let t = $derived(translations[/** @type {'JP'|'EN'} */ (language.current)]);

	onMount(() => {
		visible = true;
	});

	/** @type {{ title: string, description: string, iconType: 'cog' | 'palette' | 'sparkles' }[]} */
	const rawActivities = [
		{
			title: '開発とAI活用',
			description:
				'チームで高め合う、一歩先の開発スタイル。GitHubやNotionなどのプロツールに加え、最新のAIツールも積極的に活用しています。AIのサポートを受けながら開発を進めることで、初心者でもスムーズにモノづくりをスタートでき、一人では届かない本格的なプロジェクトにも挑戦できる場所です。',
			iconType: 'cog'
		},
		{
			title: 'デザインと体験',
			description:
				'直感的な操作感と、心地よいユーザー体験の追求。最新のUIデザイン原則に基づいた一貫性のある設計と、細部までこだわった滑らかなアニメーションを大切にしています。単に動くだけでなく、触れるだけでワクワクするような質の高いUXデザインを、部全体のスタンダードとして追求しています。',
			iconType: 'palette'
		},
		{
			title: 'クリエイティブ・テック',
			description:
				'光と技術で、空間をキャンバスに変える。プロジェクションマッピングによる大規模な演出から、Unityを用いたインタラクティブなアートまで、最新技術を駆使した空間デザインに挑戦しています。映像解析やセンサー技術を組み合わせ、デジタルとリアルが交差する、圧倒的な没入体験を創造します。',
			iconType: 'sparkles'
		}
	];

	let displayActivities = $state(rawActivities);

	$effect(() => {
		async function updateTranslations() {
			if (language.current === 'EN') {
				const promises = rawActivities.map(async (item, index) => {
					// Specific manual translation for the Engineering section (Index 0)
					if (index === 0) {
						return {
							...item,
							title: 'Engineering\n& AI Innovation',
							description:
								'Team-driven development with a modern edge. Along with tools like GitHub and Notion, we actively leverage AI to streamline our workflow. By integrating AI support, even beginners can jump right into building real-world products and take on professional-level challenges together.'
						};
					}
					// Specific manual translation for the Design section (Index 1)
					if (index === 1) {
						return {
							...item,
							title: 'Design\n& Experience',
							description:
								'Pursuing intuitive UI and seamless UX. We focus on consistent design based on modern interface principles and smooth animations that bring products to life. Our goal is to set a club-wide standard for high-quality experiences that are as delightful to use as they are functional.'
						};
					}
					// Specific manual translation for the Creative Tech section (Index 2)
					if (index === 2) {
						return {
							...item,
							title: 'Creative Tech\n& Spatial Design',
							description:
								'Redefining spaces through light and technology. From large-scale projection mapping to interactive art powered by Unity, we explore the frontiers of spatial design. By blending sensor tech and visual analysis, we create immersive experiences where the digital and physical worlds converge.'
						};
					}

					// For others, use auto-translation for description
					const tDesc = await translationStore.get(item.description);
					return { ...item, description: tDesc };
				});
				displayActivities = await Promise.all(promises);
			} else {
				displayActivities = rawActivities;
			}
		}

		// Reset if back to JP
		if (language.current !== 'EN') {
			displayActivities = rawActivities;
		}

		updateTranslations();
	});
</script>

<section id="about" class="py-24" style="background: transparent;">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		{#if visible}
			<div class="mb-16">
				<h2
					class="mb-4 text-4xl font-semibold tracking-tight md:text-5xl transition-colors text-[#1D1D1F] dark:text-white dark:text-glow"
					in:fly={{ y: 30, duration: 600, easing: cubicOut }}
				>
					{t.focus.title}
				</h2>
				<p
					class="text-lg transition-colors dark:text-zinc-400"
					style="color: #6B6B6B;"
					in:fly={{ y: 30, delay: 100, duration: 600, easing: cubicOut }}
				>
					{t.focus.subtitle}
				</p>
			</div>

			<div class="grid gap-8 md:grid-cols-3">
				{#each displayActivities as activity, i}
					<div in:fly={{ y: 50, delay: 200 + i * 100, duration: 700, easing: cubicOut }}>
						<ActivityTile
							title={activity.title}
							description={activity.description}
							iconType={activity.iconType}
						/>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>
