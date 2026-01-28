<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import XIcon from 'lucide-svelte/icons/x';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import { language } from '$lib/stores/language.svelte.js';
	import { translationStore } from '$lib/stores/translation.svelte.js';

	let { data }: { data: any } = $props();

	function closeModal() {
		goto('/home', { noScroll: true });
	}

	// Scroll lock logic
	$effect(() => {
		if (typeof document !== 'undefined') {
			const originalOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
			return () => {
				document.body.style.overflow = originalOverflow;
			};
		}
	});

	let displayArticle = $state(data.article);
	let isTranslating = $state(false);

	$effect(() => {
		async function updateTranslation() {
			if (language.current === 'EN' && data.article) {
				isTranslating = true;
				try {
					const tTitle = await translationStore.get(data.article.title);

					const tContentPromises = (data.article.content || []).map(async (block: any) => {
						if (!block) return block;
						// Translate text properties for paragraphs and headings
						if (block.text && (block.type === 'paragraph' || block.type.startsWith('heading'))) {
							const tText = await translationStore.get(block.text);
							return { ...block, text: tText };
						}
						return block;
					});

					const tContent = await Promise.all(tContentPromises);

					displayArticle = {
						...data.article,
						title: tTitle,
						content: tContent
					};
				} catch (e) {
					console.error('Translation failed', e);
					displayArticle = data.article;
				} finally {
					isTranslating = false;
				}
			} else {
				displayArticle = data.article;
			}
		}

		// If data.article changes (e.g. navigation), reset and translate
		if (data.article) {
			// If we switched articles, we might want to start with original while translating or loading
		}
		updateTranslation();
	});

	// Check if we have content to show (either original or translated)
	const hasContent = $derived(!!displayArticle?.content && !isTranslating);
</script>

<div
	class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-12"
	transition:fade={{ duration: 200 }}
	aria-labelledby="modal-title"
	role="dialog"
	aria-modal="true"
>
	<!-- Backdrop - clickable area to close -->
	<button
		class="absolute inset-0 bg-black/40 backdrop-blur-xl border-none w-full h-full cursor-default"
		onclick={closeModal}
		aria-label="Close modal"
	></button>

	<!-- Modal Content -->
	<div
		class="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[40px] bg-white shadow-2xl cursor-auto dark:bg-zinc-900"
		transition:fly={{ y: 60, duration: 500, easing: cubicOut }}
		role="document"
		tabindex="-1"
	>
		<!-- Close Button -->
		<button
			class="absolute right-8 top-8 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/5 text-black backdrop-blur-md transition-all hover:bg-black/10 hover:scale-110 active:scale-95 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
			onclick={closeModal}
			aria-label="Close modal"
		>
			<XIcon class="h-6 w-6" />
		</button>

		<!-- Scrollable Content -->
		<div class="flex-1 overflow-y-auto overscroll-contain custom-scrollbar">
			<!-- Cover Image Section -->
			{#if data.coverImage}
				<div class="w-full h-64 sm:h-80 md:h-96 overflow-hidden rounded-t-[40px]">
					<img src={data.coverImage} alt="Cover" class="w-full h-full object-cover" />
				</div>
			{/if}

			<article class="p-8 pb-20 sm:p-16" class:pt-8={data.coverImage}>
				<!-- Header -->
				<header class="mb-12 border-b border-gray-100 pb-12 dark:border-gray-800">
					<div class="mb-6 flex items-center gap-4">
						<span
							class="rounded-full bg-black px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white dark:bg-white dark:text-black"
						>
							News
						</span>
						{#if displayArticle?.date}
							<time class="text-sm font-semibold tracking-tight text-gray-400">
								{new Date(displayArticle.date).toLocaleDateString('ja-JP', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
							</time>
						{:else}
							<Skeleton width="w-24" />
						{/if}
					</div>

					{#if displayArticle?.title && !isTranslating}
						<h1
							id="modal-title"
							class="text-4xl font-black leading-[1.15] tracking-tight text-gray-900 sm:text-6xl dark:text-white"
							style="font-family: 'Inter', sans-serif;"
						>
							{displayArticle.title}
						</h1>
					{:else}
						<Skeleton height="h-12" width="w-3/4" />
					{/if}
				</header>

				<!-- Content blocks -->
				<div
					class="prose prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight dark:prose-invert"
				>
					{#if hasContent}
						{#each displayArticle.content as block}
							{#if block}
								{#if block.type === 'paragraph'}
									<p class="mb-8 leading-[1.8] text-gray-700 dark:text-gray-300">
										{block.text}
									</p>
								{:else if block.type === 'image'}
									<div
										class="my-10 overflow-hidden rounded-3xl border border-gray-100 shadow-sm dark:border-gray-800"
									>
										<img src={block.url} alt="News content" class="w-full h-auto object-cover" />
									</div>
								{:else}
									{@const HeadingTag = block.type
										.replace('heading_1', 'h1')
										.replace('heading_2', 'h2')
										.replace('heading_3', 'h3')}
									<svelte:element
										this={HeadingTag.includes('h') ? HeadingTag : 'p'}
										class="mb-6 font-black tracking-tight text-gray-900 dark:text-white"
									>
										{block.text}
									</svelte:element>
								{/if}
							{/if}
						{/each}
					{:else}
						<!-- Skeletons for content -->
						<div class="space-y-6">
							<Skeleton height="h-6" width="w-full" />
							<Skeleton height="h-6" width="w-11/12" />
							<Skeleton height="h-6" width="w-4/5" />
							<br />
							<Skeleton height="h-6" width="w-full" />
							<Skeleton height="h-6" width="w-full" />
							<Skeleton height="h-6" width="w-2/3" />
						</div>
					{/if}
				</div>

				<!-- Bottom Action -->
				<div class="mt-20 flex justify-center border-t border-gray-100 pt-12 dark:border-gray-800">
					<button
						onclick={closeModal}
						class="rounded-full bg-gray-100 px-10 py-4 text-sm font-bold text-black transition-all hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
					>
						閉じる
					</button>
				</div>
			</article>
		</div>
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 0px;
		background: transparent;
	}
	.custom-scrollbar {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	:global(body.modal-open) {
		overflow: hidden;
	}
</style>
