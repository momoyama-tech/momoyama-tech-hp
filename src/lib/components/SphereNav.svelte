<script>
	// 3D navigation hub: a rotating WebGL particle sphere with each portal
	// card's destination placed on its surface as a small plane carrying a
	// real screenshot of that page. Clicking a node makes the CAMERA
	// physically travel toward it in 3D space (not an HTML label scaling up
	// to fill the screen — that read as "the screen floating up" rather
	// than genuine depth), so the screenshot itself grows to fill the frame
	// via perspective as the camera approaches. Navigation only fires once
	// the camera has arrived, with the destination page's own entrance wipe
	// skipped (see navigateTo), so the dolly-in is the whole transition and
	// the destination just seems to already be there. The 3D scene is a
	// showcase/entry point only, never a replacement for the destination
	// pages themselves, which stay plain, fast, server-rendered SvelteKit
	// routes (SEO + accessibility + mobile perf all depend on that).
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
	 * @property {string} [preview] - static screenshot of the destination page, shown on its node
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

	onMount(() => {
		// If the browser restores this page from bfcache (pressing Back after
		// the camera-zoom navigated away), the WebGL render loop and the
		// "zooming" flag are frozen exactly as they were at the moment of
		// navigating away — the scene never resumes animating and clicks
		// stay disabled. A full reload guarantees a clean restart instead of
		// trying to resurrect mid-animation WebGL/rAF state.
		/** @param {PageTransitionEvent} e */
		const handlePageShow = (e) => {
			if (e.persisted) window.location.reload();
		};
		window.addEventListener('pageshow', handlePageShow);
		return () => window.removeEventListener('pageshow', handlePageShow);
	});

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
		// Near plane kept very small (not the usual 0.1) so the camera can
		// push all the way into a dot without its geometry being clipped —
		// the zoom-in ends with the camera literally inside the dot's
		// sphere, not just close to it.
		camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 100);
		const restPos = new THREE.Vector3(0, 0, 9);
		camera.position.copy(restPos);

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
		// How far in front of a node's plane the camera stops when diving
		// in or starts when backing out — close enough that the plane's
		// screenshot overflows the frame, but never exactly on top of it.
		const approachOffset = 0.02;
		const geo = new THREE.IcosahedronGeometry(radius, 5);
		const pointsGeo = new THREE.BufferGeometry();
		pointsGeo.setAttribute('position', geo.attributes.position.clone());
		const pointsMat = new THREE.PointsMaterial({
			color: 0xffffff,
			size: 0.035,
			transparent: true,
			opacity: 0.85
		});
		group.add(new THREE.Points(pointsGeo, pointsMat));

		const wireMat = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			wireframe: true,
			transparent: true,
			opacity: 0.12
		});
		group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(radius, 1), wireMat));

		/** @type {any} */
		const light = new THREE.PointLight(0xffffff, 2, 12);
		scene.add(light);

		const nodePositions = fibonacciSphere(cards.length, radius);
		/** @type {{ card: SphereCard, vec: any }[]} */
		const nodes = cards.map((card, i) => ({
			card,
			vec: new THREE.Vector3(nodePositions[i].x, nodePositions[i].y, nodePositions[i].z)
		}));

		// Each destination node is a small plane carrying a real screenshot
		// of that page, facing outward from the sphere. From a distance it
		// reads as just another point on the sphere; closing in on it (see
		// zoomToCard) makes that screenshot fill the frame via perspective,
		// so the approach itself becomes "arriving at that page" rather
		// than a generic zoom that cuts to a blank load.
		/** @type {any} */
		const textureLoader = new THREE.TextureLoader();
		const previewGeo = new THREE.PlaneGeometry(0.34, 0.2125);
		const outAxis = new THREE.Vector3(0, 0, 1);
		nodes.forEach(({ card, vec }) => {
			/** @type {any} */
			let mat;
			if (card.preview) {
				const texture = textureLoader.load(card.preview);
				texture.colorSpace = THREE.SRGBColorSpace;
				mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
			} else {
				mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
			}
			/** @type {any} */
			const plane = new THREE.Mesh(previewGeo, mat);
			plane.position.copy(vec);
			plane.quaternion.setFromUnitVectors(outAxis, vec.clone().normalize());
			group.add(plane);
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
				// Remember which node we dove into so that IF/WHEN the visitor
				// comes back to this sphere page, it can start already zoomed
				// into that same dot and animate back OUT — the mirror image
				// of this zoom-in. Left untouched by the destination page;
				// only SphereNav itself reads and clears it, once it's done
				// using it (see the zoom-out block below).
				sessionStorage.setItem('sphere-return-from', href);
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
			const startPos = camera.position.clone();
			// Stop just short of the plane's own position (not exactly on
			// it — a flat plane has no depth, so sitting exactly at its
			// center is a degenerate, zero-distance case) so its screenshot
			// overflows the frame right before navigating.
			const endPos = dir.clone().multiplyScalar(radius - approachOffset);
			const start = performance.now();
			const duration = 1200;
			/** @param {number} now */
			function step(now) {
				const p = Math.min(1, (now - start) / duration);
				const eased = p * p * (3 - 2 * p);
				camera.position.lerpVectors(startPos, endPos, eased);
				camera.lookAt(0, 0, 0);
				renderer.render(scene, camera);
				if (p < 1) {
					requestAnimationFrame(step);
				} else {
					navigateTo(card.href);
				}
			}
			requestAnimationFrame(step);
		};

		// Mirror image of the zoom-in: if the visitor is arriving here
		// having just dove into a node (tracked via sessionStorage, since a
		// full reload loses all JS state), start the camera already inside
		// that same dot and animate OUT to the resting position instead of
		// idling at rest from the first frame.
		/** @type {string | null} */
		let returnHref = null;
		try {
			returnHref = sessionStorage.getItem('sphere-return-from');
		} catch {
			// ignore
		}
		const returnNode = returnHref ? nodes.find((n) => n.card.href === returnHref) : undefined;
		if (returnNode) {
			const returnVec = returnNode.vec.clone().normalize().multiplyScalar(radius - approachOffset);
			zooming = true;
			camera.position.copy(returnVec);
			camera.lookAt(0, 0, 0);
			const zoomOutStart = performance.now();
			const zoomOutDuration = 900;
			/** @param {number} now */
			function zoomOutStep(now) {
				const p = Math.min(1, (now - zoomOutStart) / zoomOutDuration);
				const eased = p * p * (3 - 2 * p);
				camera.position.lerpVectors(returnVec, restPos, eased);
				camera.lookAt(0, 0, 0);
				if (p < 1) {
					requestAnimationFrame(zoomOutStep);
				} else {
					zooming = false;
					try {
						sessionStorage.removeItem('sphere-return-from');
					} catch {
						// ignore
					}
				}
			}
			requestAnimationFrame(zoomOutStep);
		}

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
		height: 100vh;
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
		border: 1px solid rgba(255, 255, 255, 0.4);
		border-radius: 999px;
		padding: 6px 14px;
		color: #ffffff;
		font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
		cursor: pointer;
		backdrop-filter: blur(6px);
		transition: opacity 0.3s ease, transform 0.15s ease;
		pointer-events: auto;
	}

	.sphere-label:hover {
		transform: translate(-50%, -50%) scale(1.08);
		border-color: #ffffff;
	}

	.sphere-label.dim {
		opacity: 0.25;
		pointer-events: none;
	}

	.sphere-label-no {
		font-size: 9px;
		color: rgba(255, 255, 255, 0.6);
		letter-spacing: 0.1em;
	}

	.sphere-label-title {
		font-size: 13px;
		font-weight: 500;
	}
</style>
