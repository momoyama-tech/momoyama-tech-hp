import { getStore } from '@netlify/blobs';
import { json } from '@sveltejs/kit';

// "Who's here right now" presence, backed by Netlify Blobs. Each browser
// tab holds a random session id (see LiveViewers.svelte) and POSTs a
// heartbeat every ~20s; this endpoint stamps that id with the current
// time in a single shared map, drops any id not heard from in the last
// ACTIVE_WINDOW_MS, and returns how many remain. No websocket/realtime
// infra needed — short polling is enough for a decorative "N people
// viewing now" badge.
const ACTIVE_WINDOW_MS = 60_000;

// Netlify Blobs only works once deployed on Netlify (or under `netlify
// dev`, which isn't part of this project's local workflow) — plain `npm
// run dev` has no blob store to connect to, so this falls back to a
// per-process in-memory map instead of erroring, purely so the frontend
// has something to render locally. Resets on every server restart and
// isn't shared across requests in a real multi-instance deployment;
// exists only for local development.
/** @type {Map<string, number>} */
const devFallbackPresence = new Map();

/**
 * @param {Record<string, number>} map
 * @param {number} now
 */
function pruneObject(map, now) {
	for (const [id, ts] of Object.entries(map)) {
		if (now - ts > ACTIVE_WINDOW_MS) delete map[id];
	}
	return map;
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	/** @type {{ sessionId?: unknown }} */
	const body = await request.json().catch(() => ({}));
	const sessionId = typeof body.sessionId === 'string' ? body.sessionId : null;
	const now = Date.now();

	if (!sessionId) {
		return json({ count: 1 });
	}

	try {
		const store = getStore('presence');
		/** @type {Record<string, number>} */
		const current = (await store.get('active', { type: 'json' })) ?? {};
		current[sessionId] = now;
		pruneObject(current, now);
		await store.setJSON('active', current);
		return json({ count: Object.keys(current).length });
	} catch {
		devFallbackPresence.set(sessionId, now);
		for (const [id, ts] of devFallbackPresence) {
			if (now - ts > ACTIVE_WINDOW_MS) devFallbackPresence.delete(id);
		}
		return json({ count: devFallbackPresence.size, dev: true });
	}
}
