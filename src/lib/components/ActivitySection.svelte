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
			title: 'Project\nEngineering',
			description:
				'チームでのモダンな開発フローの確立。GitHubを用いた共同開発やNotionでのナレッジ共有など、プロフェッショナルなエンジニアリング文化を醸成し、実戦的なプロダクトを制作しています。',
			iconType: 'cog'
		},
		{
			title: 'Experience\n& Design',
			description:
				'Appleのヒューマンインターフェースガイドラインを参考に、一貫性のあるUI設計と、滑らかなアニメーションによるUXデザインを部全体のスタンダードとして追求しています。',
			iconType: 'palette'
		},
		{
			title: 'Creative Tech\n& Mapping',
			description:
				'桃山祭でのプロジェクションマッピングをはじめとした、最新技術による空間演出。Unityや映像解析技術を駆使し、デジタルとリアルが融合する視覚体験を創造しています。',
			iconType: 'sparkles'
		}
	];

	let displayActivities = $state(rawActivities);

	$effect(() => {
		async function updateTranslations() {
			if (language.current === 'EN') {
				const promises = rawActivities.map(async (item) => {
					// Translate title and description
					// Note: Titles have newlines 'Project\nEngineering', translation might strip them or mess up.
					// We might keep titles as is since they look English-ish or simple enough?
					// Actually "Project Engineering" is English. "Creative Tech & Mapping" is English.
					// "Experience & Design" is English.
					// So titles might perfectly remain as is.
					// Let's only translate description.
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
					class="mb-4 text-4xl font-semibold tracking-tight md:text-5xl"
					style="color: #1D1D1F;"
					in:fly={{ y: 30, duration: 600, easing: cubicOut }}
				>
					{t.focus.title}.
				</h2>
				<p
					class="text-lg"
					style="color: #6B6B6B;"
					in:fly={{ y: 30, delay: 100, duration: 600, easing: cubicOut }}
				>
					{t.focus.subtitle}
				</p>
			</div>

			<div class="grid gap-6 md:grid-cols-3">
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
