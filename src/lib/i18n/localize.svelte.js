import { language } from '$lib/stores/language.svelte.js';
import { translationStore } from '$lib/stores/translation.svelte.js';

// Hiragana / Katakana / CJK / half-width kana — "does this string need translating?"
const JP_RE = /[぀-ヿ㐀-䶿一-鿿ｦ-ﾟ]/;

/**
 * Deep, automatic EN localization of a plain content object.
 *
 * Usage inside a component `<script>`:
 * ```js
 * const jp = { heading: 'サービス', lead: '…', tags: ['#HP制作'] };
 * const c = localize(() => jp);
 * // template: {c.value.heading}
 * ```
 *
 * - In JP mode the source object is returned untouched.
 * - In EN mode every Japanese string is swapped for its translation
 *   (served from cache instantly, filled in from `/api/translate` otherwise).
 * - Strings without Japanese characters (already-English labels, hashes,
 *   code, numbers) are left alone.
 *
 * Because it runs through {@link translationStore}, any Japanese text added
 * to the source later is translated automatically — no dictionary upkeep.
 *
 * @template T
 * @param {() => T} source reactive getter returning the JP content
 * @returns {{ readonly value: T }}
 */
export function localize(source) {
	let out = $state(/** @type {T} */ (source()));

	$effect(() => {
		const src = source();

		if (language.current !== 'EN') {
			out = src;
			return;
		}

		// 1. Immediate paint: use whatever is already cached, keep JP for the rest.
		out = /** @type {T} */ (mapDeep(src, (s) => translationStore.peek(s) ?? s));

		// 2. Batch-translate every Japanese string in one request, then rebuild.
		let alive = true;
		/** @type {string[]} */
		const strings = [];
		collectStrings(src, strings);
		translationStore.getMany(strings).then(() => {
			if (alive) out = /** @type {T} */ (mapDeep(src, (s) => translationStore.peek(s) ?? s));
		});
		return () => {
			alive = false;
		};
	});

	return {
		get value() {
			return out;
		}
	};
}

/**
 * @param {any} node
 * @param {(s: string) => string} fn
 * @returns {any}
 */
function mapDeep(node, fn) {
	if (typeof node === 'string') return JP_RE.test(node) ? fn(node) : node;
	if (Array.isArray(node)) return node.map((n) => mapDeep(n, fn));
	if (node && typeof node === 'object') {
		return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, mapDeep(v, fn)]));
	}
	return node;
}

/**
 * Gather every Japanese string in the tree into `acc`.
 * @param {any} node
 * @param {string[]} acc
 */
function collectStrings(node, acc) {
	if (typeof node === 'string') {
		if (JP_RE.test(node)) acc.push(node);
	} else if (Array.isArray(node)) {
		node.forEach((n) => collectStrings(n, acc));
	} else if (node && typeof node === 'object') {
		Object.values(node).forEach((v) => collectStrings(v, acc));
	}
}
