import { getProjects } from '$lib/server/projects.js';

// Netlify ISR: serve a cached page, regenerate at most every 5 min.
export const config = {
	isr: {
		expiration: 300
	}
};

/** @type {import('./$types').PageServerLoad} */
export async function load({ setHeaders }) {
	setHeaders({
		'cache-control': 'public, max-age=60, s-maxage=600'
	});

	const projects = await getProjects();

	// Derive the filter list from the projects themselves — always in sync,
	// no dependency on the Notion schema endpoint.
	const categories = [
		...new Set(projects.flatMap((p) => p.categories ?? (p.category ? [p.category] : [])))
	].sort();

	return { projects, categories };
}
