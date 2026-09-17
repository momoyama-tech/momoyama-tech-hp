<script>
	// 3D navigation hub: a rotating WebGL particle sphere with each portal
	// card's destination placed as a glowing point on its surface. Clicking
	// a point zooms the camera toward it, then does a REAL full-page
	// navigation (window.location.href) to the actual page — the 3D scene
	// is a showcase/entry point only, never a replacement for the
	// destination pages themselves, which stay plain, fast, server-rendered
	// SvelteKit routes (SEO + accessibility + mobile perf all depend on
	// that: see the conversation that led here for why this is a
	// "showcase in front of real pages", not "the whole site becomes 3D").
	//
	// Falls back to rendering `children` (the caller's normal card grid)
	// when WebGL is unavailable or prefers-reduced-motion is set — this
	// component never gates access to the destinations, only the visual.
	import { onMount, onDestroy } from 'svelte';

	/**
	 * @typedef {Object} SphereCard
	 * @property {string} href
	 * @property {string} title
	 * @property {string} desc
	 * @property {string} no
	 */

	/** @type {{ cards: SphereCard[], children?: import('svelte').Snippet }} */
	let { cards, children } = $props();

	/** @type {HTMLDivElement | undefined} */
	let stageEl = $state();
	let ready = $state(false);
	let supported = $state(true);
	/** @type {{ card: SphereCard, x: number, y: number, visible: boolean }[]} */
	let labelPositions = $state([]);

	/** @type {any} */
	let renderer;
	/** @type {any} */
	let scene;
	/** @type {any} */
	let camera;
	/** @type {any} */
	let group;
	/** @type {any} */
	let animId;
	/** @type {((card: SphereCard) => void) | undefined} */
	let zoomToCard;
	let zooming = false;

	/**
	 * @param {number} n
	 * @param {number} radius
	 */
	function fibonacciSphere(n, radius) {
		const points = [];
		const phi = Math.PI * (3 - Math.sqrt(5));
		for (let i = 0; i < n; i++) {
			const y = 1 - (i / (n - 1)) * 2;
			const r = Math.sqrt(1 - y * y);
			const theta = phi * i;
			points.push({
				x: Math.cos(theta) * r * radius,
				y: y * radius,
				z: Math.sin(theta) * r * radius
			});
		}
		return points;
	}

	onMount(async () => {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const canvasTest = document.createElement('canvas');
		const hasWebGL = !!(
			canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl')
		);
		if (reduceMotion || !hasWebGL || !stageEl) {
			supported = false;
			return;
		}

		const THREE = await import('three');

		const width = stageEl.clientWidth;
		const height = stageEl.clientHeight;

		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
		camera.position.set(0, 0, 9);

		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setSize(width, height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		stageEl.appendChild(renderer.domElement);

		// Starfield backdrop — a wide, sparse point cloud independent of the
		// nav sphere's own rotation, so the whole scene reads as "floating in
		// space" rather than just a rotating wireframe shape on a flat bg.
		/** @type {any} */
		const starGroup = new THREE.Group();
		scene.add(starGroup);
		/** @param {number} count @param {number} rMin @param {number} rMax @param {number} size @param {number} opacity */
		function addStarLayer(count, rMin, rMax, size, opacity) {
			const positions = new Float32Array(count * 3);
			for (let i = 0; i < count; i++) {
				const r = rMin + Math.random() * (rMax - rMin);
				const theta = Math.random() * Math.PI * 2;
				const phi = Math.acos(2 * Math.random() - 1);
				positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
				positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
				positions[i * 3 + 2] = r * Math.cos(phi);
			}
			const starGeo = new THREE.BufferGeometry();
			starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
			const starMat = new THREE.PointsMaterial({
				color: 0xffffff,
				size,
				transparent: true,
				opacity,
				sizeAttenuation: true
			});
			starGroup.add(new THREE.Points(starGeo, starMat));
		}
		addStarLayer(500, 12, 26, 0.09, 0.9);
		addStarLayer(700, 26, 45, 0.05, 0.55);

		group = new THREE.Group();
		scene.add(group);

		const radius = 2.6;
		const geo = new THREE.IcosahedronGeometry(radius, 5);
		const pointsGeo = new THREE.BufferGeometry();
		pointsGeo.setAttribute('position', geo.attributes.position.clone());
		const pointsMat = new THREE.PointsMaterial({
			color: 0x67e8f9,
			size: 0.035,
			transparent: true,
			opacity: 0.75
		});
		group.add(new THREE.Points(pointsGeo, pointsMat));

		const wireMat = new THREE.MeshBasicMaterial({
			color: 0x0891b2,
			wireframe: true,
			transparent: true,
			opacity: 0.12
		});
		group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(radius, 1), wireMat));

		/** @type {any} */
		const light = new THREE.PointLight(0x67e8f9, 2, 12);
		scene.add(light);

		const nodePositions = fibonacciSphere(cards.length, radius);
		/** @type {{ card: SphereCard, vec: any }[]} */
		const nodes = cards.map((card, i) => ({
			card,
			vec: new THREE.Vector3(nodePositions[i].x, nodePositions[i].y, nodePositions[i].z)
		}));

		nodes.forEach(({ vec }) => {
			/** @type {any} */
			const dot = new THREE.Mesh(
				new THREE.SphereGeometry(0.06, 12, 12),
				new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
			);
			dot.position.copy(vec);
			group.add(dot);
		});

		function updateLabels() {
			const tmp = new THREE.Vector3();
			labelPositions = nodes.map(({ card, vec }) => {
				tmp.copy(vec).applyQuaternion(group.quaternion);
				const worldVisible = tmp.z > -radius * 0.15;
				tmp.project(camera);
				return {
					card,
					x: (tmp.x * 0.5 + 0.5) * width,
					y: (-tmp.y * 0.5 + 0.5) * height,
					visible: worldVisible
				};
			});
		}

		let t = 0;
		function animate() {
			t += 0.005;
			starGroup.rotation.y += 0.0002;
			if (!zooming) {
				group.rotation.y += 0.0016;
				group.rotation.x = Math.sin(t * 0.4) * 0.08;
			}
			light.position.set(Math.sin(t) * 4, Math.cos(t * 0.7) * 4, 3);
			updateLabels();
			renderer.render(scene, camera);
			animId = requestAnimationFrame(animate);
		}
		animate();
		ready = true;

		/** @param {string} href */
		function navigateTo(href) {
			// Tell the destination page to skip its own entrance wipe
			// (MeltRevealOverlay) — the camera zoom already IS the transition,
			// so the destination should just be there when it arrives instead
			// of playing a second reveal effect on top.
			try {
				sessionStorage.setItem('skip-melt-reveal', '1');
			} catch {
				// ignore (private browsing / storage disabled) — worst case the
				// wipe plays once more than intended, not a functional problem
			}
			window.location.href = href;
		}

		/** @param {SphereCard} card */
		zoomToCard = (card) => {
			if (zooming) return;
			zooming = true;
			const target = nodes.find((n) => n.card.href === card.href);
			if (!target) {
				navigateTo(card.href);
				return;
			}
			const dir = target.vec.clone().applyQuaternion(group.quaternion).normalize();
			const startZ = camera.position.z;
			const start = performance.now();
			const duration = 900;
			/** @param {number} now */
			function step(now) {
				const p = Math.min(1, (now - start) / duration);
				const eased = 1 - Math.pow(1 - p, 3);
				camera.position.lerpVectors(
					new THREE.Vector3(0, 0, startZ),
					dir.clone().multiplyScalar(radius + 0.6),
					eased
				);
				camera.lookAt(0, 0, 0);
				if (p < 1) {
					requestAnimationFrame(step);
				} else {
					navigateTo(card.href);
				}
			}
			requestAnimationFrame(step);
		};

		function handleResize() {
			if (!stageEl) return;
			const w = stageEl.clientWidth;
			const h = stageEl.clientHeight;
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			renderer.setSize(w, h);
		}
		window.addEventListener('resize', handleResize);
		resizeCleanup = () => window.removeEventListener('resize', handleResize);
	});

	// onMount here is async (loading three.js dynamically), and Svelte can't
	// use an async onMount's return value as a cleanup function — store it
	// separately and run it from onDestroy instead.
	/** @type {(() => void) | undefined} */
	let resizeCleanup;

	onDestroy(() => {
		if (animId) cancelAnimationFrame(animId);
		if (renderer) renderer.dispose();
		resizeCleanup?.();
	});

	/** @param {SphereCard} card */
	function go(card) {
		zoomToCard?.(card);
	}
</script>

{#if supported}
	<div class="sphere-nav" aria-label="コンテンツ一覧（3D）">
		<div class="sphere-stage" bind:this={stageEl}></div>
		{#if ready}
			{#each labelPositions as pos (pos.card.href)}
				<button
					type="button"
					class="sphere-label"
					class:dim={!pos.visible}
					style="left: {pos.x}px; top: {pos.y}px;"
					onclick={() => go(pos.card)}
				>
					<span class="sphere-label-no">{pos.card.no}</span>
					<span class="sphere-label-title">{pos.card.title}</span>
				</button>
			{/each}
		{/if}
	</div>
{:else}
	{@render children?.()}
{/if}

<style>
	.sphere-nav {
		position: relative;
		width: 100%;
		height: calc(100vh - 4rem);
		min-height: 560px;
		overflow: hidden;
		background: radial-gradient(circle at 50% 45%, #0d1420 0%, #05070a 70%);
	}

	.sphere-stage {
		position: absolute;
		inset: 0;
	}

	.sphere-label {
		position: absolute;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		background: rgba(5, 10, 15, 0.55);
		border: 1px solid rgba(103, 232, 249, 0.4);
		border-radius: 999px;
		padding: 6px 14px;
		color: #e5faff;
		font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
		cursor: pointer;
		backdrop-filter: blur(6px);
		transition: opacity 0.3s ease, transform 0.15s ease;
		pointer-events: auto;
	}

	.sphere-label:hover {
		transform: translate(-50%, -50%) scale(1.08);
		border-color: #67e8f9;
	}

	.sphere-label.dim {
		opacity: 0.25;
		pointer-events: none;
	}

	.sphere-label-no {
		font-size: 9px;
		color: #67e8f9;
		letter-spacing: 0.1em;
	}

	.sphere-label-title {
		font-size: 13px;
		font-weight: 500;
	}
</style>
