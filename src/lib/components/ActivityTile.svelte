<script>
	import { fly, scale, fade } from 'svelte/transition';
	import { cubicOut, quintOut } from 'svelte/easing';
	import { spring } from 'svelte/motion';
	// Direct imports to avoid SSR issues
	import Cog from 'lucide-svelte/icons/cog';
	import Palette from 'lucide-svelte/icons/palette';
	import Sparkles from 'lucide-svelte/icons/sparkles';
	import { theme } from '$lib/stores/theme.svelte.js';

	/** @type {{ title: string, description: string, iconType?: 'cog' | 'palette' | 'sparkles' }} */
	let { title, description, iconType = 'cog' } = $props();

	let isHovered = $state(false);
	let tileElement = $state();
	let rotateX = $state(0);
	let rotateY = $state(0);
	let mouseX = $state(0);
	let mouseY = $state(0);

	// Projector Spotlight Inertia
	const spotlightPos = spring(
		{ x: 0, y: 0 },
		{
			stiffness: 0.05, // Loose spring for "heavy" projector feel
			damping: 0.25 // Smooth settling
		}
	);

	/** @type {Record<string, any>} */
	const icons = {
		cog: Cog,
		palette: Palette,
		sparkles: Sparkles
	};

	/** @type {Record<string, string>} */
	const iconBgColors = {
		cog: 'bg-blue-500/10',
		palette: 'bg-purple-500/10',
		sparkles: 'bg-amber-500/10'
	};

	/** @type {Record<string, string>} */
	const iconTextColors = {
		cog: 'text-blue-600',
		palette: 'text-purple-600',
		sparkles: 'text-amber-600'
	};

	/** @type {Record<string, string>} */
	const glowColors = {
		cog: 'bg-blue-500',
		palette: 'bg-purple-500',
		sparkles: 'bg-amber-500'
	};

	const IconComponent = $derived(icons[/** @type {keyof typeof icons} */ (iconType)] || Cog);
	const iconTextColor = $derived(
		iconTextColors[/** @type {keyof typeof iconTextColors} */ (iconType)] || 'text-blue-600'
	);
	const iconBgColor = $derived(
		iconBgColors[/** @type {keyof typeof iconBgColors} */ (iconType)] || 'bg-blue-500/10'
	);
	const glowColor = $derived(
		glowColors[/** @type {keyof typeof glowColors} */ (iconType)] || 'bg-blue-500'
	);

	/** @param {MouseEvent} e */
	function handleMouseMove(e) {
		if (!tileElement) return;
		const rect = tileElement.getBoundingClientRect();
		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;

		const centerX = rect.width / 2;
		const centerY = rect.height / 2;

		// Calculate rotation (limit to small angles for subtlety)
		rotateX = ((mouseY - centerY) / centerY) * -3;
		rotateY = ((mouseX - centerX) / centerX) * 3;

		// Update inertia spotlight target
		if (iconType === 'sparkles') {
			spotlightPos.set({ x: mouseX, y: mouseY });
		}
	}

	function handleMouseLeave() {
		isHovered = false;
		rotateX = 0;
		rotateY = 0;
	}
</script>

<div
	class="perspective-container relative h-full min-h-[340px]"
	role="article"
	onmouseenter={() => (isHovered = true)}
	onmousemove={handleMouseMove}
	onmouseleave={handleMouseLeave}
>
	<!-- Back Glow (Light Leak) -->
	<div
		class="absolute inset-0 -z-10 rounded-[2.5rem] opacity-0 transition-opacity duration-700 {glowColor} blur-3xl"
		class:opacity-10={isHovered}
		class:opacity-0={!isHovered}
		style="transform: translateZ(-20px) scale(0.9);"
	></div>

	<div
		bind:this={tileElement}
		class="group relative flex h-full flex-col justify-between overflow-hidden rounded-[2.5rem] border bg-white/20 p-10 text-left backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] dark:bg-zinc-900/40 dark:border-white/10"
		class:border-glow={theme.isScanLineActive}
		class:border-purple-400={iconType === 'cog' && isHovered}
		class:border-purple-400-30={iconType === 'cog' && isHovered}
		class:shadow-[0_0_20px_rgba(192,132,252,0.3)]={iconType === 'cog' && isHovered}
		class:border-cyan-400={iconType === 'sparkles' && isHovered}
		class:border-cyan-400-30={iconType === 'sparkles' && isHovered}
		class:shadow-[0_0_20px_rgba(34,211,238,0.3)]={iconType === 'sparkles' && isHovered}
		class:border-blue-400={iconType === 'palette' && isHovered}
		class:border-blue-400-30={iconType === 'palette' && isHovered}
		class:border-white-30={!isHovered}
		class:shadow-[0_0_0_1px_rgba(59,130,246,0.3)]={iconType === 'palette' && isHovered}
		style="transform: perspective(1000px) rotateX({rotateX}deg) rotateY({rotateY}deg); transform-style: preserve-3d; will-change: transform; border-color: {isHovered
			? iconType === 'cog'
				? 'rgba(192, 132, 252, 0.5)'
				: iconType === 'sparkles'
					? 'rgba(34, 211, 238, 0.5)'
					: 'rgba(96, 165, 250, 0.5)'
			: 'rgba(255, 255, 255, 0.1)'};"
	>
		<!-- 1. Engineering: Circuit Diagram & Flowing Data (Preserved) -->
		{#if iconType === 'cog'}
			<div
				class="absolute inset-0 z-0 opacity-0 transition-opacity duration-700 delay-100 ease-[cubic-bezier(0.23,1,0.32,1)]"
				class:opacity-[0.15]={isHovered}
			>
				<svg
					class="h-full w-full stroke-blue-900/60 dark:stroke-cyan-300/80"
					style="stroke-width: 1.5px; fill: none; transform: translateX({-rotateY *
						4}px) translateY({-rotateX * 4}px); transition: transform 0.1s; will-change: transform;"
				>
					<path d="M40 0 V60 H100 V120" stroke-dasharray="2 2" />
					<path d="M160 340 V200 H240 V100" stroke-dasharray="2 2" />
					<path d="M300 0 V150 H200" stroke-dasharray="2 2" />
					<circle cx="100" cy="120" r="3" class="fill-blue-900/60 dark:fill-cyan-300/80" />
					<circle cx="240" cy="100" r="3" class="fill-blue-900/60 dark:fill-cyan-300/80" />
					<circle cx="200" cy="150" r="3" class="fill-blue-900/60 dark:fill-cyan-300/80" />
					{#if isHovered}
						<circle
							r="3"
							class="fill-blue-500 dark:fill-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
						>
							<animateMotion
								dur="2s"
								repeatCount="indefinite"
								path="M40 0 V60 H100 V120"
								keyPoints="0;1"
								keyTimes="0;1"
								calcMode="linear"
							/>
						</circle>
						<circle
							r="3"
							class="fill-blue-500 dark:fill-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
						>
							<animateMotion
								dur="3s"
								repeatCount="indefinite"
								path="M160 340 V200 H240 V100"
								keyPoints="0;1"
								keyTimes="0;1"
								calcMode="linear"
							/>
						</circle>
						<circle
							r="3"
							class="fill-blue-500 dark:fill-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
						>
							<animateMotion
								dur="2.5s"
								repeatCount="indefinite"
								path="M300 0 V150 H200"
								keyPoints="0;1"
								keyTimes="0;1"
								calcMode="linear"
							/>
						</circle>
					{/if}
				</svg>

				<!-- Matrix Code Rain Effect -->
				{#if isHovered}
					<div
						class="absolute inset-0 overflow-hidden opacity-30 dark:opacity-50 mix-blend-overlay"
						style="transform: translateX({-rotateY * 10}px) translateY({-rotateX *
							10}px); transition: transform 0.1s; will-change: transform;"
					>
						<svg
							class="h-full w-full"
							style="fill: #d8b4fe; font-size: 10px; font-family: monospace;"
						>
							<text x="10" y="20" class="animate-matrix-1">0 1 0 1 1</text>
							<text x="50" y="40" class="animate-matrix-2">1 0 1 0 0</text>
							<text x="90" y="10" class="animate-matrix-3">func()</text>
							<text x="20" y="80" class="animate-matrix-1">const x=1</text>
							<text x="120" y="60" class="animate-matrix-2">1 1 0 1</text>
							<text x="160" y="30" class="animate-matrix-3">wait()</text>
							<text x="10" y="150" class="animate-matrix-1">0 1 1 0</text>
							<text x="80" y="120" class="animate-matrix-2">return</text>
							<text x="140" y="180" class="animate-matrix-3">1 0 0 1</text>
						</svg>
					</div>
				{/if}
			</div>
		{/if}

		<!-- 2. Design: UI Grid & Golden Ratio (Palette) -->
		{#if iconType === 'palette'}
			<div
				class="absolute inset-0 z-0 opacity-0 transition-opacity duration-700 ease-out"
				class:opacity-[0.1]={!isHovered}
				class:opacity-[0.3]={isHovered}
			>
				{#if isHovered}
					<!-- Golden Ratio & Grid -->
					<svg
						class="absolute inset-0 h-full w-full stroke-blue-500/40 dark:stroke-white/30"
						style="fill: none; stroke-width: 0.5; transform: translateX({-rotateY *
							6}px) translateY({-rotateX *
							6}px); transition: transform 0.1s; will-change: transform;"
					>
						<!-- Grid -->
						<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
							<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="0.5" />
						</pattern>
						<rect width="100%" height="100%" fill="url(#grid)" />

						<!-- Golden Spiral (Approximation) -->
						<path d="M 200 200 A 100 100 0 0 1 300 300" stroke-width="1" class="opacity-50" />
						<circle cx="200" cy="200" r="150" stroke-width="0.5" stroke-dasharray="4 4" />
						<rect x="50" y="50" width="100" height="61.8" stroke-width="1" />
					</svg>
				{/if}
			</div>
		{/if}

		<!-- 3. Creative Tech: Projector Spotlight & Lens Distortion -->
		<!-- 3. Creative Tech: Particles & Projector (Sparkles) -->
		{#if iconType === 'sparkles'}
			<div class="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[2.5rem]">
				<!-- Layer 1: Base Grid (Faint, Static) -->
				<div
					class="absolute inset-0 bg-[radial-gradient(#9ca3af_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-[0.05]"
					style="transform: translateX({-rotateY * 4}px) translateY({-rotateX *
						4}px); transition: transform 0.1s; will-change: transform;"
				></div>

				{#if isHovered}
					<!-- Layer 2: Scan Light (Inversion Effect) -->
					<div
						class="absolute inset-0 z-10 mix-blend-exclusion"
						transition:fade={{ duration: 200 }}
						style="
							background: radial-gradient(circle 250px at {$spotlightPos.x}px {$spotlightPos.y}px, rgba(255, 255, 255, 0.3), transparent 100%);
						"
					></div>

					<!-- Layer 3: Data Grid (Masked Dots) -->
					<div
						class="absolute inset-0 z-20 opacity-70 bg-[radial-gradient(#00f2ff_1.5px,transparent_1.5px)] [background-size:10px_10px]"
						style="
							mask-image: radial-gradient(circle 200px at {$spotlightPos.x}px {$spotlightPos.y}px, black, transparent 80%);
							-webkit-mask-image: radial-gradient(circle 200px at {$spotlightPos.x}px {$spotlightPos.y}px, black, transparent 80%);
						"
					></div>

					<!-- Layer 4: Border Glow (Scanner Effect) -->
					<div
						class="absolute inset-0 z-30 border-2 border-cyan-400 rounded-[2.5rem] opacity-100"
						style="
							mask-image: radial-gradient(circle 250px at {$spotlightPos.x}px {$spotlightPos.y}px, black, transparent 70%);
							-webkit-mask-image: radial-gradient(circle 250px at {$spotlightPos.x}px {$spotlightPos.y}px, black, transparent 70%);
						"
					></div>
				{/if}
				<!-- Single Pulse Ring on Hover -->
				{#if isHovered}
					<div
						class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400 opacity-0 animate-single-pulse"
						style="width: 0; height: 0;"
					></div>
				{/if}

				<!-- Layer 1: Base Grid (Faint, Static) -->
				<div
					class="absolute inset-0 bg-[radial-gradient(#9ca3af_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-[0.05]"
				></div>

				{#if isHovered && theme.isSpotlightEnabled}
					<!-- Layer 2: Scan Light (Inversion Effect) -->
					<div
						class="absolute inset-0 z-10 mix-blend-exclusion"
						transition:fade={{ duration: 200 }}
						style="
							background: radial-gradient(circle 250px at {$spotlightPos.x}px {$spotlightPos.y}px, rgba(255, 255, 255, 0.3), transparent 100%);
						"
					></div>

					<!-- Layer 3: Data Grid (Masked Dots) -->
					<div
						class="absolute inset-0 z-20 opacity-70 bg-[radial-gradient(#00f2ff_1.5px,transparent_1.5px)] [background-size:10px_10px]"
						style="
							mask-image: radial-gradient(circle 200px at {$spotlightPos.x}px {$spotlightPos.y}px, black, transparent 80%);
							-webkit-mask-image: radial-gradient(circle 200px at {$spotlightPos.x}px {$spotlightPos.y}px, black, transparent 80%);
						"
					></div>

					<!-- Layer 4: Border Glow (Scanner Effect) -->
					<div
						class="absolute inset-0 z-30 border-2 border-cyan-400 rounded-[2.5rem] opacity-100"
						style="
							mask-image: radial-gradient(circle 250px at {$spotlightPos.x}px {$spotlightPos.y}px, black, transparent 70%);
							-webkit-mask-image: radial-gradient(circle 250px at {$spotlightPos.x}px {$spotlightPos.y}px, black, transparent 70%);
						"
					></div>
				{/if}
			</div>
		{/if}

		<!-- Content -->
		<div
			class="relative z-10 flex h-full flex-col justify-between gap-10 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
			style="transform: translateZ(20px); transform-style: preserve-3d;"
		>
			<!-- Icon Wrapper -->
			<div
				class="relative"
				style="transform: translateZ({iconType === 'palette' && isHovered
					? '50px'
					: '0px'}); transition: transform 0.6s cubic-bezier(0.25,1,0.5,1);"
			>
				<div
					class="flex h-12 w-12 items-center justify-center rounded-2xl {iconBgColor} transition-transform duration-500 ease-out group-hover:scale-110"
					class:shadow-xl={iconType === 'palette' && isHovered}
					class:shadow-pink-200={iconType === 'palette' && isHovered}
					class:animate-float={iconType === 'palette' && isHovered}
					class:animate-snap-move={iconType === 'palette' && isHovered}
					style="animation-delay: 0.1s;"
				>
					<IconComponent class="h-6 w-6 {iconTextColor}" strokeWidth={1.5} />
				</div>
			</div>

			<div class="flex flex-col gap-4">
				<!-- Title -->
				<div
					class="relative inline-block"
					style="transform: translateZ({iconType === 'palette' && isHovered
						? '30px'
						: '0px'}); transition: transform 0.6s cubic-bezier(0.25,1,0.5,1);"
				>
					<h3
						class="text-xl font-bold tracking-tighter text-gray-900 dark:text-white transition-all duration-300"
						class:animate-snap-move={iconType === 'palette' && isHovered}
						style="
							font-family: 'Noto Sans JP', sans-serif; 
							animation-delay: 0.2s;
							text-shadow: {isHovered ? '0 0 15px rgba(255,255,255,0.4)' : 'none'};
						"
					>
						{title}
					</h3>
					<!-- Design: Leading Line (Title) -->
					{#if iconType === 'palette'}
						<div
							class="absolute -bottom-1 left-0 h-[1px] bg-zinc-400 dark:bg-purple-400/50 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
							style="width: {isHovered ? '100%' : '0%'}; transition-delay: 0.1s;"
						>
							<div
								class="absolute right-0 -top-[1.5px] h-[4px] w-[4px] rounded-full bg-zinc-400 dark:bg-purple-300/80 shadow-[0_0_4px_rgba(161,161,170,0.8)] dark:shadow-[0_0_8px_rgba(192,132,252,0.8)] opacity-0 transition-opacity duration-300"
								class:opacity-100={isHovered}
							></div>
						</div>
					{/if}
				</div>

				<!-- Description -->
				<div
					class="relative inline-block"
					style="transform: translateZ({iconType === 'palette' && isHovered
						? '15px'
						: '0px'}); transition: transform 0.6s cubic-bezier(0.25,1,0.5,1);"
				>
					<p
						class="text-sm font-medium leading-relaxed text-gray-600 dark:text-zinc-400"
						class:animate-snap-move={iconType === 'palette' && isHovered}
						style="font-family: 'Inter', sans-serif; opacity: {isHovered
							? 1
							: 0.8}; transition: opacity 0.5s; animation-delay: 0.3s;"
					>
						{description}
					</p>
					<!-- Design: Leading Line (Description) -->
					{#if iconType === 'palette'}
						<div
							class="absolute -bottom-1 left-0 h-[1px] bg-zinc-400/60 dark:bg-purple-400/30 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
							style="width: {isHovered ? '100%' : '0%'}; transition-delay: 0.4s;"
						>
							<div
								class="absolute right-0 -top-[1.5px] h-[3px] w-[3px] rounded-full bg-zinc-400 dark:bg-purple-300/60 shadow-[0_0_4px_rgba(161,161,170,0.6)] dark:shadow-[0_0_8px_rgba(192,132,252,0.6)] opacity-0 transition-opacity duration-300"
								class:opacity-100={isHovered}
							></div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.perspective-container {
		perspective: 1000px;
	}

	/* Design: Snap Move */
	@keyframes snap-move {
		0% {
			transform: translate(4px, 4px);
		}
		100% {
			transform: translate(0, 0);
		}
	}
	.animate-snap-move {
		animation: snap-move 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
	}

	/* Design: Flash Box */
	@keyframes flash-box {
		0% {
			opacity: 1;
		}
		30% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
	.animate-flash-box {
		animation: flash-box 0.4s ease-out forwards;
	}

	/* Creative Tech: Single Pulse Ring */
	@keyframes single-pulse {
		0% {
			width: 0;
			height: 0;
			opacity: 0.8;
			border-width: 2px;
		}
		100% {
			width: 200%;
			height: 200%;
			opacity: 0;
			border-width: 0;
		}
	}
	.animate-single-pulse {
		animation: single-pulse 1s cubic-bezier(0, 0, 0.2, 1) forwards;
	}

	@keyframes matrix-fall {
		0% {
			transform: translateY(-20px);
			opacity: 0;
		}
		20% {
			opacity: 1;
		}
		100% {
			transform: translateY(100px);
			opacity: 0;
		}
	}
	.animate-matrix-1 {
		animation: matrix-fall 3s linear infinite;
	}
	.animate-matrix-2 {
		animation: matrix-fall 4s linear infinite 0.5s;
	}
	.animate-matrix-3 {
		animation: matrix-fall 5s linear infinite 1s;
	}

	@keyframes float-particle {
		0% {
			transform: translateY(0) translateX(0);
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
		100% {
			transform: translateY(-50px) translateX(20px);
			opacity: 0;
		}
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-8px);
		}
	}
	.animate-float {
		animation: float 3s ease-in-out infinite;
	}
</style>
