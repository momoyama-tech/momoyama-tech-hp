<script>
	/**
	 * @type {{
	 *   type?: 'curve' | 'slant' | 'wave' | 'asymmetric';
	 *   position?: 'top' | 'bottom';
	 *   fill?: string;
	 *   height?: string;
	 *   zIndex?: number;
	 *   scrollY?: number;
	 * }}
	 */
	let {
		type = 'curve',
		position = 'top',
		fill = '#ffffff',
		height = '120px',
		zIndex = 10,
		scrollY = 0
	} = $props();

	const paths = {
		curve: 'M0,120 C300,0 700,0 1000,120 L1000,120 L0,120 Z',
		slant: 'M0,120 L1000,0 L1000,120 L0,120 Z',
		wave: 'M0,60 C250,150 750,-30 1000,60 L1000,120 L0,120 Z',
		asymmetric: 'M0,120 C200,80 500,0 1000,60 L1000,120 L0,120 Z'
	};

	// Invert path for bottom? Or just rotate SVG.
	// Use scaleY(-1) for bottom
</script>

<div
	class="absolute left-0 w-full overflow-hidden leading-none pointer-events-none"
	style="{position}: 0; height: {height}; z-index: {zIndex}; transform: {position === 'bottom'
		? 'scaleY(-1)'
		: 'none'};"
>
	<!-- Parallax container -->
	<div style="transform: translateY({(scrollY || 0) * 0.05}px); height: 120%; width: 100%;">
		<svg
			viewBox="0 0 1000 120"
			preserveAspectRatio="none"
			class="block w-full h-full"
			style="fill: {fill};"
		>
			<path d={paths[type] || paths.curve} />
		</svg>
	</div>

	<!-- Gradient Overlay inside divider for blending -->
	<div
		class="absolute inset-0 bg-gradient-to-b from-transparent to-white/10 mix-blend-overlay"
	></div>
</div>
