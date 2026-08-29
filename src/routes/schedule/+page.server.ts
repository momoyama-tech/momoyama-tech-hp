import { getFutureSchedule, getPastEventsByMonth } from '$lib/server/schedule.js';

export const config = {
	isr: {
		expiration: 60
	}
};

/** @type {import('./$types').PageServerLoad} */
export async function load({ setHeaders }) {
	setHeaders({
		'cache-control': 'public, max-age=60, s-maxage=600'
	});

	try {
		const [scheduleData, pastEventsByMonth] = await Promise.all([
			getFutureSchedule(),
			getPastEventsByMonth()
		]);

		return {
			scheduleData,
			pastEventsByMonth
		};
	} catch (error) {
		console.error('[SCHEDULE LOAD] ERROR:', error);
		return {
			scheduleData: { nextEvent: null, upcomingEvents: [] },
			pastEventsByMonth: []
		};
	}
}
