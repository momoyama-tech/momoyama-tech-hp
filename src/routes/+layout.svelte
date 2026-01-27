<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	// Direct imports to avoid SSR issues
	import Menu from 'lucide-svelte/icons/menu';
	import X from 'lucide-svelte/icons/x';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import Instagram from 'lucide-svelte/icons/instagram';

	let { children } = $props();

	let isMenuOpen = $state(false);
	let scrolled = $state(false);

	// Handle scroll for header background
	function handleScroll() {
		scrolled = window.scrollY > 50;
	}

	// Lock body scroll when mobile menu is open
	$effect(() => {
		if (typeof document !== 'undefined') {
			if (isMenuOpen) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = '';
			}
		}
	});

	const navItems = [
		{ href: '#about', label: '活動内容' },
		{ href: '#projects', label: 'プロジェクト' },
		{ href: '#blog', label: 'ニュース' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<svelte:window onscroll={handleScroll} />

<!-- Navigation -->
<nav
	class="fixed left-0 right-0 top-0 z-50 transition-all duration-300 {scrolled
		? 'bg-white/90 shadow-sm backdrop-blur-xl dark:bg-black/90'
		: 'bg-transparent'}"
>
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-14 items-center justify-between">
			<!-- Logo -->
			<a
				href="/"
				class="flex items-center gap-2 font-medium transition-colors {scrolled
					? 'text-black dark:text-white'
					: 'text-black dark:text-white'}"
			>
				<img src={favicon} alt="" class="h-6 w-6" />
				<span class="hidden text-sm sm:inline">桃山テック部</span>
			</a>

			<!-- Desktop Nav -->
			<div class="hidden items-center gap-8 md:flex">
				{#each navItems as item}
					<a
						href={item.href}
						class="text-sm transition-colors {scrolled
							? 'text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white'
							: 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'}"
					>
						{item.label}
					</a>
				{/each}
				<a
					href="https://www.instagram.com/"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-1 rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white transition-transform hover:scale-105 dark:bg-white dark:text-black"
				>
					<Instagram class="h-4 w-4" />
					<span>Follow</span>
				</a>
			</div>

			<!-- Mobile menu button -->
			<button
				class="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-black md:hidden dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
				onclick={() => (isMenuOpen = !isMenuOpen)}
				aria-label="メニューを開く"
			>
				{#if isMenuOpen}
					<X class="h-5 w-5" />
				{:else}
					<Menu class="h-5 w-5" />
				{/if}
			</button>
		</div>
	</div>

	<!-- Mobile menu -->
	{#if isMenuOpen}
		<div
			class="fixed inset-0 top-14 z-40 bg-white/95 backdrop-blur-xl md:hidden dark:bg-black/95"
			transition:fade={{ duration: 200 }}
		>
			<div class="space-y-2 px-6 py-8">
				{#each navItems as item, i}
					<a
						href={item.href}
						class="block rounded-2xl px-4 py-4 text-lg font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-black dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
						onclick={() => (isMenuOpen = false)}
						in:fly={{ y: 20, delay: i * 50, duration: 300, easing: cubicOut }}
					>
						{item.label}
					</a>
				{/each}
				<div in:fly={{ y: 20, delay: 150, duration: 300, easing: cubicOut }}>
					<a
						href="https://www.instagram.com/"
						target="_blank"
						rel="noopener noreferrer"
						class="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-black px-4 py-4 text-lg font-medium text-white dark:bg-white dark:text-black"
						onclick={() => (isMenuOpen = false)}
					>
						<Instagram class="h-5 w-5" />
						Follow us
					</a>
				</div>
			</div>
		</div>
	{/if}
</nav>

<!-- Page content -->
{@render children()}

<!-- Footer -->
<footer class="bg-gray-50 py-16 dark:bg-gray-950">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="mb-10 text-center">
			<p class="text-sm text-gray-500">
				桃山学院大学テック部は、技術を学び、共有し、創造する学生のためのコミュニティです。
			</p>
		</div>

		<div
			class="flex flex-col items-center justify-between gap-8 border-t border-gray-200 pt-8 md:flex-row dark:border-gray-800"
		>
			<div class="flex flex-wrap justify-center gap-12 text-sm">
				<div>
					<h4 class="mb-3 font-medium text-gray-400">コンテンツ</h4>
					<div class="space-y-2">
						<a
							href="#about"
							class="block text-gray-500 transition-colors hover:text-black dark:hover:text-white"
							>活動紹介</a
						>
						<a
							href="#projects"
							class="block text-gray-500 transition-colors hover:text-black dark:hover:text-white"
							>プロジェクト</a
						>
						<a
							href="#blog"
							class="block text-gray-500 transition-colors hover:text-black dark:hover:text-white"
							>ブログ・ニュース</a
						>
					</div>
				</div>
				<div>
					<h4 class="mb-3 font-medium text-gray-400">リンク</h4>
					<div class="space-y-2">
						<a
							href="https://andrew.ac.jp/"
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-1 text-gray-500 transition-colors hover:text-black dark:hover:text-white"
						>
							桃山学院大学 公式
							<ExternalLink class="h-3 w-3" />
						</a>
						<a
							href="/"
							class="block text-gray-500 transition-colors hover:text-black dark:hover:text-white"
							>お問い合わせ</a
						>
					</div>
				</div>
			</div>

			<p class="text-xs text-gray-400">
				© 2026 Momoyama Gakuin University Tech Club. All rights reserved.
			</p>
		</div>
	</div>
</footer>
