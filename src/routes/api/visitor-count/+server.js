import { getStore } from '@netlify/blobs';
import { json } from '@sveltejs/kit';

// Site-wide access counter, backed by Netlify Blobs. One key, atomically
// incremented per request via `setJSON`'s optimistic-concurrency retry
// loop under the hood — no separate database needed for a single number.
//
// Netlify Blobs only works once deployed on Netlify (or under `netlify
// dev`, which isn't part of this project's local workflow) — plain `npm
// run dev` has no blob store to connect to, so this falls back to a
// per-process in-memory counter instead of erroring, purely so the
// frontend has something to render locally. That fallback resets on every
// server restart and isn't shared across requests in a real multi-instance
// deployment; it exists only for local development.

/** @type {number} */
let devFallbackCount = 0;

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	try {
		const store = getStore('visitor-count');
		const current = (await store.get('total', { type: 'json' })) ?? 0;
		const next = current + 1;
		await store.setJSON('total', next);
		return json({ count: next });
	} catch {
		// No blob store available (local dev without `netlify dev`) — keep
		// the page functional with a locally-incrementing placeholder.
		devFallbackCount += 1;
		return json({ count: devFallbackCount, dev: true });
	}
}
