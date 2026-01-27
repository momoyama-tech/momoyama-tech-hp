<script>
	import { fly, fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import CategoryFilter from '$lib/components/CategoryFilter.svelte';

	let { data } = $props();

	let selectedCategory = $state('All');

	const filteredProjects = $derived(
		selectedCategory === 'All'
			? data.projects
			: data.projects.filter((p) => p.category === selectedCategory)
	);

	function handleCategorySelect(category) {
		selectedCategory = category;
	}
</script>

<svelte:head>
	<title>Projects | 桃山学院大学 テック部</title>
	<meta
		name="description"
		content="テック部のプロジェクト一覧。ゲーム、Web、アプリなど様々なジャンルの制作物を紹介します。"
	/>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<!-- Header -->
	<header class="bg-white py-16 dark:bg-gray-950">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="text-center">
				<h1
					class="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl"
					in:fly={{ y: 30, duration: 500, easing: cubicOut }}
				>
					Projects
				</h1>
				<p
					class="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400"
					in:fly={{ y: 30, delay: 100, duration: 500, easing: cubicOut }}
				>
					テック部メンバーが制作したプロジェクト
				</p>
			</div>
		</div>
	</header>

	<!-- Filter -->
	<div
		class="sticky top-0 z-10 border-b border-gray-200 bg-white/80 py-6 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80"
		in:fade={{ delay: 200, duration: 300 }}
	>
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<CategoryFilter
				categories={data.categories}
				{selectedCategory}
				onSelect={handleCategorySelect}
			/>
		</div>
	</div>

	<!-- Projects Grid -->
	<main class="py-12">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			{#if filteredProjects.length > 0}
				<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each filteredProjects as project (project.id)}
						<div
							animate:flip={{ duration: 300, easing: cubicOut }}
							in:fly={{ y: 30, duration: 400, easing: cubicOut }}
							out:fade={{ duration: 200 }}
						>
							<ProjectCard {project} />
						</div>
					{/each}
				</div>
			{:else}
				<div
					class="rounded-2xl bg-white p-12 text-center dark:bg-gray-800"
					in:fade={{ duration: 200 }}
				>
					<span class="text-5xl">📂</span>
					<p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
						{selectedCategory === 'All'
							? 'プロジェクトはまだありません'
							: `「${selectedCategory}」カテゴリのプロジェクトはありません`}
					</p>
				</div>
			{/if}
		</div>
	</main>

	<!-- Back to Home -->
	<div class="pb-12 text-center">
		<a
			href="/"
			class="inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"
				></path>
			</svg>
			ホームに戻る
		</a>
	</div>
</div>
