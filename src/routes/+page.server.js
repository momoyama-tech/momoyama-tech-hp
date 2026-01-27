import { getNews } from '$lib/server/news.js';
import { getProjects } from '$lib/server/projects.js';
import { getFutureSchedule, getPastEventsByMonth } from '$lib/server/schedule.js';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    console.log('[LOAD] Starting data fetch...');

    try {
        console.log('[LOAD] Calling getNews...');
        const news = await getNews(5);
        console.log('[LOAD] News:', news.length, 'items');

        console.log('[LOAD] Calling getProjects...');
        const projects = await getProjects();
        console.log('[LOAD] Projects:', projects.length, 'items');

        console.log('[LOAD] Calling getFutureSchedule...');
        const scheduleData = await getFutureSchedule();
        console.log('[LOAD] Schedule nextEvent:', scheduleData.nextEvent ? 'yes' : 'no');
        console.log('[LOAD] Schedule upcomingEvents:', scheduleData.upcomingEvents.length);

        console.log('[LOAD] Calling getPastEventsByMonth...');
        const pastEventsByMonth = await getPastEventsByMonth();
        console.log('[LOAD] Past events months:', pastEventsByMonth.length);

        console.log('[LOAD] ALL DATA LOADED SUCCESSFULLY');

        return {
            news,
            projects: projects.slice(0, 6),
            scheduleData,
            pastEventsByMonth
        };
    } catch (/** @type {any} */ error) {
        console.error('[LOAD] ERROR:', error.message);
        console.error('[LOAD] Stack:', error.stack);

        // Return empty data on error
        return {
            news: [],
            projects: [],
            scheduleData: { nextEvent: null, upcomingEvents: [] },
            pastEventsByMonth: []
        };
    }
}
