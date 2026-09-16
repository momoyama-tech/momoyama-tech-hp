/**
 * @param {unknown} v
 * @returns {boolean} true when the value carries real content worth caching
 */
function isNonEmpty(v) {
	if (Array.isArray(v)) return v.length > 0;
	if (v && typeof v === 'object') {
		return Object.values(v).some((x) => (Array.isArray(x) ? x.length > 0 : x != null));
	}
	return v != null && v !== '';
}

/**
 * Wrap an async fetcher with an in-memory TTL cache (keyed by arguments).
 *
 * - Non-empty results are cached for `ttlMs`.
 * - Empty results (no data, or an inner error-fallback) are cached only for
 *   `emptyTtlMs` so the page recovers quickly once data appears / the outage
 *   clears — but repeat requests in the meantime stay cheap.
 * - If the fetcher throws, the last good value is served instead.
 *
 * On a warm serverless instance this makes repeat requests effectively free;
 * pair it with route-level ISR so most requests never hit the function at all.
 *
 * @template {any[]} A
 * @template T
 * @param {(...args: A) => Promise<T>} fetcher
 * @param {{ ttlMs?: number, emptyTtlMs?: number }} [opts]
 * @returns {(...args: A) => Promise<T>}
 */
export function withCache(fetcher, { ttlMs = 5 * 60 * 1000, emptyTtlMs = 60 * 1000 } = {}) {
	/** @type {Map<string, { data: T; at: number; empty: boolean }>} */
	const store = new Map();

	return async (...args) => {
		const key = JSON.stringify(args);
		const hit = store.get(key);
		if (hit && Date.now() - hit.at < (hit.empty ? emptyTtlMs : ttlMs)) {
			return hit.data;
		}

		let result;
		try {
			result = await fetcher(...args);
		} catch (err) {
			console.error('[cache] fetch threw:', err);
			if (hit) return hit.data;
			throw err;
		}

		store.set(key, { data: result, at: Date.now(), empty: !isNonEmpty(result) });
		return result;
	};
}
