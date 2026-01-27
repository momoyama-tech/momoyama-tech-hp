<script>
	import ActivityTile from './ActivityTile.svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';

	let visible = $state(false);

	onMount(() => {
		visible = true;
	});

	/** @type {{ title: string, description: string, iconType: 'cog' | 'palette' | 'sparkles' }[]} */
	const activities = [
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
					Areas of Focus.
				</h2>
				<p
					class="text-lg"
					style="color: #6B6B6B;"
					in:fly={{ y: 30, delay: 100, duration: 600, easing: cubicOut }}
				>
					私たちが情熱を注ぐ3つの専門領域。
				</p>
			</div>

			<div class="grid gap-6 md:grid-cols-3">
				{#each activities as activity, i}
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
