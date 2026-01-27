import { getProjects, getCategories } from '$lib/server/projects.js';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const [projects, categories] = await Promise.all([getProjects(), getCategories()]);

    return {
        projects,
        categories
    };
}
