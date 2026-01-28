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
	import Mail from 'lucide-svelte/icons/mail';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';

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

	import { language } from '$lib/stores/language.svelte.js';
	import { translations } from '$lib/i18n/translations.js';

	let t = $derived(translations[/** @type {'JP'|'EN'} */ (language.current)]);

	let navItems = $derived([
		{ href: '#projects', label: t.nav.projects },
		{ href: '#news', label: t.nav.blog },
		{ href: '#schedule', label: t.nav.schedule }
	]);

	let showToast = $state(false);

	async function copyEmailAddress() {
		try {
			await navigator.clipboard.writeText('tech@andrew.ac.jp');
			showToast = true;
			setTimeout(() => {
				showToast = false;
			}, 3000);
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
	}
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
	class="fixed left-0 right-0 top-0 z-50 transition-all duration-300 border-b border-[rgba(0,0,0,0.05)] {scrolled
		? 'bg-[rgba(255,255,255,0.8)] backdrop-blur-[20px] dark:bg-black/80'
		: 'bg-[rgba(255,255,255,0.8)] backdrop-blur-[20px] dark:bg-black/80'}"
>
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo -->
			<a
				href="/"
				class="flex items-center gap-2 font-medium transition-colors text-[#1D1D1F] dark:text-white"
			>
				<img src={favicon} alt="" class="h-8 w-8" />
				<span class="hidden text-sm sm:inline font-medium tracking-[-0.02em]">MOMOYAMA TECH</span>
			</a>

			<!-- Desktop Nav -->
			<div class="hidden items-center gap-8 md:flex">
				<div class="flex items-center gap-6">
					{#each navItems as item}
						<a
							href={item.href}
							class="text-sm font-medium tracking-[-0.02em] transition-colors text-[#1D1D1F] hover:opacity-70 dark:text-gray-400 dark:hover:text-white"
						>
							{item.label}
						</a>
					{/each}
				</div>

				<div
					class="flex items-center gap-6 pl-6 border-l border-[rgba(0,0,0,0.1)] dark:border-gray-800 h-4"
				>
					<div class="flex items-center gap-4">
						<a
							href="https://www.instagram.com/momoyama_tech/"
							target="_blank"
							rel="noopener noreferrer"
							title="Instagram"
							class="text-[#1D1D1F] transition-all duration-300 hover:opacity-70 dark:text-white"
						>
							<Instagram class="w-[18px] h-[18px]" stroke-width="1.5" />
						</a>
						<a
							href="https://x.com/momoyama_tech"
							target="_blank"
							rel="noopener noreferrer"
							title="X (Twitter)"
							class="text-[#1D1D1F] transition-all duration-300 hover:opacity-70 dark:text-white"
						>
							<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
								/>
							</svg>
						</a>
					</div>
					<div class="scale-100 origin-right">
						<LanguageSwitcher />
					</div>
				</div>
			</div>

			<!-- Mobile menu button -->
			<button
				class="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-black md:hidden dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
				onclick={() => (isMenuOpen = !isMenuOpen)}
				aria-label="メニューを開く"
			>
				{#if isMenuOpen}
					<X class="h-6 w-6" />
				{:else}
					<Menu class="h-6 w-6" />
				{/if}
			</button>
		</div>
	</div>

	<!-- Mobile menu -->
	{#if isMenuOpen}
		<div
			class="fixed inset-0 top-16 z-40 bg-white/95 backdrop-blur-md md:hidden dark:bg-black/95 flex flex-col"
			transition:fade={{ duration: 200 }}
		>
			<div class="flex-1 space-y-2 px-6 py-8 overflow-y-auto">
				{#each navItems as item, i}
					<a
						href={item.href}
						class="block rounded-2xl px-4 py-4 text-xl font-bold text-gray-900 transition-colors hover:bg-gray-50 hover:text-black dark:text-gray-100 dark:hover:bg-gray-900 dark:hover:text-white tracking-tight"
						onclick={() => (isMenuOpen = false)}
						in:fly={{ y: 20, delay: i * 50, duration: 300, easing: cubicOut }}
					>
						{item.label}
					</a>
				{/each}

				<div
					class="pt-8 mt-4 border-t border-gray-100 dark:border-gray-800"
					in:fly={{ y: 20, delay: 150, duration: 300, easing: cubicOut }}
				>
					<div class="flex items-start gap-4 justify-between w-full">
						<div class="flex flex-col gap-1">
							<span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Social</span>
							<div class="flex items-center gap-6">
								<a
									href="https://www.instagram.com/momoyama_tech/"
									target="_blank"
									rel="noopener noreferrer"
									title="Instagram"
									class="text-gray-900 transition-opacity hover:opacity-70 dark:text-white"
								>
									<Instagram class="h-6 w-6" />
								</a>
								<a
									href="https://x.com/momoyama_tech"
									target="_blank"
									rel="noopener noreferrer"
									title="X (Twitter)"
									class="text-gray-900 transition-opacity hover:opacity-70 dark:text-white"
								>
									<svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
										<path
											d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
										/>
									</svg>
								</a>
							</div>
						</div>

						<div class="flex flex-col gap-1 items-end">
							<span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Language</span
							>
							<LanguageSwitcher />
						</div>
					</div>
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
				{t.footer.desc}
			</p>
		</div>

		<div
			class="flex flex-col items-center justify-between gap-8 border-t border-gray-200 pt-8 md:flex-row dark:border-gray-800"
		>
			<div class="flex flex-wrap justify-center gap-12 text-sm">
				<div>
					<h4 class="mb-3 font-medium text-gray-400">{t.footer.content}</h4>
					<div class="space-y-2">
						<a
							href="#about"
							class="block text-gray-500 transition-colors hover:text-black dark:hover:text-white"
							>{t.nav.about}</a
						>
						<a
							href="#projects"
							class="block text-gray-500 transition-colors hover:text-black dark:hover:text-white"
							>{t.nav.projects}</a
						>
						<a
							href="#news"
							class="block text-gray-500 transition-colors hover:text-black dark:hover:text-white"
							>{t.nav.blog}</a
						>
						<a
							href="#schedule"
							class="block text-gray-500 transition-colors hover:text-black dark:hover:text-white"
							>{t.nav.schedule}</a
						>
					</div>
				</div>
				<div>
					<h4 class="mb-3 font-medium text-gray-400">{t.footer.links}</h4>
					<div class="space-y-2">
						<a
							href="https://www.andrew.ac.jp/index.html"
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-1 text-gray-500 transition-colors hover:text-black dark:hover:text-white"
						>
							{t.footer.official}
							<ExternalLink class="h-3 w-3" />
						</a>
						<a
							href="mailto:tech@andrew.ac.jp"
							class="block text-gray-500 transition-colors hover:text-black dark:hover:text-white"
							>{t.footer.contact}</a
						>
					</div>
				</div>
			</div>
		</div>

		<!-- Contact Section -->
		<div
			class="mt-12 w-full rounded-2xl bg-[#F5F5F7] p-8 dark:bg-zinc-900 border border-black/5 dark:border-white/10"
		>
			<div class="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h4 class="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
						{t.footer.contactTitle}
					</h4>
					<p
						class="text-2xl font-black tracking-tight text-gray-900 dark:text-white"
						style="font-family: 'Inter', sans-serif;"
					>
						Stay Connected.
					</p>
				</div>

				<div class="flex flex-wrap items-center gap-3">
					<a
						href="https://www.instagram.com/momoyama_tech/"
						target="_blank"
						rel="noopener noreferrer"
						class="group flex h-11 items-center justify-center gap-3 rounded-xl bg-white px-5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md dark:bg-black"
					>
						<Instagram
							class="h-5 w-5 text-gray-900 transition-colors group-hover:text-[#E1306C] dark:text-white"
						/>
						<span
							class="text-sm font-bold text-gray-900 dark:text-white"
							style="font-family: 'Inter', sans-serif;">Instagram</span
						>
					</a>

					<a
						href="https://x.com/momoyama_tech"
						target="_blank"
						rel="noopener noreferrer"
						class="group flex h-11 items-center justify-center gap-3 rounded-xl bg-white px-5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md dark:bg-black"
					>
						<svg
							class="h-5 w-5 text-gray-900 transition-colors group-hover:text-black dark:text-white dark:group-hover:text-white"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path
								d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
							/>
						</svg>
						<span
							class="text-sm font-bold text-gray-900 dark:text-white"
							style="font-family: 'Inter', sans-serif;">X</span
						>
					</a>

					<div class="flex flex-col items-center gap-2">
						<button
							onclick={copyEmailAddress}
							title="Click to Copy: tech@andrew.ac.jp"
							class="group flex h-11 items-center justify-center gap-3 rounded-xl bg-black px-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer dark:bg-white"
						>
							<Mail
								class="h-5 w-5 text-white transition-opacity group-hover:opacity-80 dark:text-black"
							/>
							<span
								class="text-sm font-bold text-white dark:text-black"
								style="font-family: 'Inter', sans-serif;">{t.footer.emailLabel}</span
							>
						</button>
						<span class="text-[10px] text-gray-400 font-medium tracking-tight"
							>tech@andrew.ac.jp</span
						>
					</div>
				</div>
			</div>

			{#if showToast}
				<div
					transition:fade={{ duration: 200 }}
					class="fixed bottom-12 left-1/2 z-[100] -translate-x-1/2"
				>
					<div
						class="rounded-full bg-black/90 px-6 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm dark:bg-white/90 dark:text-black"
					>
						{t.footer.copySuccess}
					</div>
				</div>
			{/if}

			<p class="text-xs text-gray-400 mt-8">
				{t.footer.copy}
				{t.footer.rights}
			</p>
		</div>
	</div>
</footer>
