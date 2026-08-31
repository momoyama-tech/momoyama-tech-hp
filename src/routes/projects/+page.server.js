import { getProjects } from '$lib/server/projects.js';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const projects = await getProjects();

	// Derive the filter list from the projects themselves — always in sync,
	// no dependency on the Notion schema endpoint.
	const categories = [
		...new Set(projects.flatMap((p) => p.categories ?? (p.category ? [p.category] : [])))
	].sort();

	return { projects, categories };
}
