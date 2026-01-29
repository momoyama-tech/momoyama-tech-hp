<script>
	import { goto } from '$app/navigation';
	import { theme } from '$lib/stores/theme.svelte.js';
	import { onMount } from 'svelte';

	// Icons (using refined selection)
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import CornerDownLeft from 'lucide-svelte/icons/corner-down-left';
	import Command from 'lucide-svelte/icons/command';
	import Zap from 'lucide-svelte/icons/zap';
	import Hash from 'lucide-svelte/icons/hash';
	import LayoutTemplate from 'lucide-svelte/icons/layout-template';
	import BarChart from 'lucide-svelte/icons/bar-chart-2';
	import Moon from 'lucide-svelte/icons/moon';
	import Sun from 'lucide-svelte/icons/sun';

	let isOpen = $state(false);
	let query = $state('');
	let selectedIndex = $state(0);

	// Command Logic
	const SLASH_COMMANDS = [
		{ id: 'jump', label: '/jump', desc: 'Jump to section', icon: Zap },
		{ id: 'stats', label: '/stats', desc: 'View activity stats', icon: BarChart },
		{ id: 'theme', label: '/theme', desc: 'Toggle theme', icon: LayoutTemplate },
		{ id: 'minimal', label: '/minimal', desc: 'Toggle animations', icon: Hash }
	];

	const NAV_ITEMS = [
		{ id: 'about', label: 'About', path: '/#about', icon: Hash },
		{ id: 'projects', label: 'Projects', path: '/#projects', icon: Hash },
		{ id: 'activities', label: 'Activities', path: '/#about', icon: Hash } // Linked to about for now
	];

	// Dynamic Actions based on input
	let filteredActions = $derived.by(() => {
		const q = query.toLowerCase();

		// 1. Slash Command Mode
		if (q.startsWith('/')) {
			// Suggest commands
			const cmdQuery = q;
			return SLASH_COMMANDS.filter((c) => c.label.startsWith(cmdQuery)).map((c) => ({
				id: c.id,
				label: c.label,
				sub: c.desc,
				icon: c.icon,
				type: 'command',
				action: () => handleCommand(c.id)
			}));
		}

		// 2. Normal Search
		// Mix of Jump targets and general actions
		const standardActions = [
			...NAV_ITEMS.map((item) => ({
				id: item.id,
				label: item.label,
				sub: 'Jump to section',
				icon: item.icon,
				type: 'jump',
				action: () => goto(item.path)
			})),
			{
				id: 'contact',
				label: 'Contact',
				sub: 'Open contact form',
				icon: Mail,
				type: 'action',
				action: () => window.dispatchEvent(new CustomEvent('open-contact'))
			}
		];

		if (!q) return standardActions;
		return standardActions.filter(
			(a) => a.label.toLowerCase().includes(q) || a.sub.toLowerCase().includes(q)
		);
	});

	// Mock Stats for /stats
	let showStats = $state(false);
	const STATS = [
		{ label: 'Projects', value: '12' },
		{ label: 'Members', value: '42' },
		{ label: 'Version', value: '2.4.0' },
		{ label: 'Status', value: 'All Systems Nominal' }
	];

	import Mail from 'lucide-svelte/icons/mail'; // Late import for standard action

	/** @param {string} cmdId */
	function handleCommand(cmdId) {
		if (cmdId === 'jump') {
			// For now just clear query to show jump list, or could be smarter
			query = '';
		} else if (cmdId === 'theme') {
			theme.toggle();
			close();
		} else if (cmdId === 'minimal') {
			theme.toggleMinimal();
			close();
		} else if (cmdId === 'stats') {
			showStats = true;
			// Don't close immediately, show stats
		}
	}

	function open() {
		isOpen = true;
		query = '';
		selectedIndex = 0;
		showStats = false;
	}

	function close() {
		isOpen = false;
		showStats = false;
	}

	/** @param {KeyboardEvent} e */
	function handleKeydown(e) {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			isOpen ? close() : open();
		}
		if (!isOpen) return;

		if (e.key === 'Escape') {
			if (showStats) {
				showStats = false;
				query = '';
			} else {
				close();
			}
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (filteredActions.length) selectedIndex = (selectedIndex + 1) % filteredActions.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (filteredActions.length)
				selectedIndex = (selectedIndex - 1 + filteredActions.length) % filteredActions.length;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (showStats) {
				close();
			} else {
				const action = filteredActions[selectedIndex];
				if (action) {
					action.action();
					if (action.type !== 'command' || action.id !== 'stats') {
						close();
					}
				}
			}
		} else if (e.key === 'Tab') {
			e.preventDefault();
			// Video game style auto-complete
			const action = filteredActions[selectedIndex];
			if (action && action.label.startsWith('/')) {
				query = action.label + ' ';
			}
		}
	}

	/** @param {HTMLElement} node */
	function focus(node) {
		node.focus();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div
		class="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4 font-mono"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop (Blur) -->
		<button
			type="button"
			class="absolute inset-0 transition-none w-full h-full cursor-default border-none outline-none"
			style="background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(12px) brightness(0.5);"
			onclick={close}
			aria-label="Close"
			tabindex="-1"
		></button>

		<!-- Container (Fixed Dark Mode / VS Code Style) -->
		<div
			class="relative w-full max-w-2xl min-h-[100px] border shadow-2xl"
			style="background-color: #18181b; color: #e4e4e7; border-color: #3f3f46; box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 1);"
		>
			<!-- Header / Status Bar -->
			<div
				class="flex justify-between items-center px-3 py-1 text-xs uppercase tracking-widest border-b"
				style="background-color: #18181b; color: #a1a1aa; border-color: #3f3f46;"
			>
				<span>COMMAND_PALETTE // v2.5</span>
				<span>{theme.isMinimal ? 'MINIMAL_MODE' : 'STANDARD_MODE'}</span>
			</div>

			<!-- Input -->
			<div class="relative flex items-center p-4 border-b" style="border-color: #3f3f46;">
				<ChevronRight class="mr-3 h-5 w-5" style="color: #06b6d4;" strokeWidth={2} />
				<input
					type="text"
					bind:value={query}
					use:focus
					class="flex-1 bg-transparent border-none outline-none text-xl caret-transparent"
					style="color: #ffffff;"
					placeholder="Type / for commands..."
				/>
				<!-- Custom Block Cursor (Blinking) -->
				{#if !query}
					<div
						class="absolute left-[3.25rem] top-1/2 -translate-y-1/2 w-3 h-6 animate-pulse"
						style="background-color: #06b6d4;"
					></div>
				{:else}
					<style>
						input {
							caret-color: #06b6d4 !important;
						}
					</style>
				{/if}
			</div>

			<!-- Content Area -->
			{#if showStats}
				<div class="p-4 grid grid-cols-2 gap-4 text-sm">
					{#each STATS as stat}
						<div class="border p-3" style="border-color: #3f3f46;">
							<div class="text-[10px] uppercase opacity-60 mb-1" style="color: #a1a1aa;">
								{stat.label}
							</div>
							<div class="text-xl font-bold" style="color: #ffffff;">{stat.value}</div>
						</div>
					{/each}
					<div class="col-span-2 text-xs text-center mt-2 opacity-50" style="color: #71717a;">
						Press ESC to return
					</div>
				</div>
			{:else}
				<div class="max-h-[300px] overflow-y-auto custom-scrollbar">
					{#if filteredActions.length === 0}
						<div class="p-4 text-sm opacity-50" style="color: #71717a;">
							No execution target found.
						</div>
					{:else}
						{#each filteredActions as action, i}
							<button
								class="w-full flex items-center justify-between px-4 py-3 text-left transition-none group"
								style="background-color: {i === selectedIndex
									? '#27272a'
									: 'transparent'}; color: {i === selectedIndex ? '#ffffff' : '#e4e4e7'};"
								onmouseenter={() => (selectedIndex = i)}
								onclick={action.action}
							>
								<div class="flex items-center gap-4">
									<action.icon
										class="h-4 w-4"
										style="color: {i === selectedIndex ? '#ffffff' : '#a1a1aa'};"
									/>
									<div class="flex flex-col">
										<span class="text-sm font-bold">{action.label}</span>
										{#if action.sub}
											<span
												class="text-[10px] uppercase opacity-60"
												style="color: {i === selectedIndex ? '#d4d4d8' : '#71717a'};"
												>{action.sub}</span
											>
										{/if}
									</div>
								</div>
								{#if i === selectedIndex}
									<CornerDownLeft class="h-3 w-3" style="color: #ffffff;" />
								{/if}
							</button>
						{/each}
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Force monospace for the whole component scope if possible, but tailwind 'font-mono' on container does it. */
	:global(body.minimal *) {
		animation: none !important;
		transition: none !important;
	}
</style>
