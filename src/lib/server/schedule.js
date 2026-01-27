import { notion, DATABASE_IDS, extractPlainText } from './notion.js';

/**
 * @typedef {Object} ScheduleEvent
 * @property {string} id - Page ID
 * @property {string} title - Event title
 * @property {string} date - Event date (ISO string)
 * @property {string} endDate - Event end date if range
 * @property {string} description - Event description (Category/Type)
 * @property {string} location - Event location
 * @property {boolean} isUpcoming - Whether the event is in the future
 * @property {boolean} isPast - Whether the event is in the past
 */

/**
 * @typedef {Object} MonthGroup
 * @property {string} month - Month key (YYYY-MM format)
 * @property {string} label - Human readable month label
 * @property {ScheduleEvent[]} events - Events in this month
 */

/**
 * Get all future events grouped by split (Next Event + Upcoming Events)
 * @returns {Promise<{nextEvent: ScheduleEvent|null, upcomingEvents: ScheduleEvent[]}>}
 */
export async function getFutureSchedule() {
    try {
        // 1. Define today (Start of day in local time)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Notion query date string (UTC based for query optimization, but we'll filter strictly in JS)
        const todayStr = new Date().toISOString().split('T')[0];
        const fiscalYearEnd = '2026-03-31';

        let response;
        try {
            response = await notion.databases.query({
                database_id: DATABASE_IDS.SCHEDULE,
                filter: {
                    and: [
                        {
                            property: 'Web公開',
                            select: {
                                equals: '公開'
                            }
                        },
                        {
                            property: '日付',
                            date: {
                                on_or_after: todayStr // Query broad range
                            }
                        },
                        {
                            property: '日付',
                            date: {
                                on_or_before: fiscalYearEnd
                            }
                        }
                    ]
                },
                sorts: [
                    {
                        property: '日付',
                        direction: 'ascending'
                    }
                ],
                page_size: 100
            });
        } catch {
            // Fallback or retry logic if needed
            return { nextEvent: null, upcomingEvents: [] };
        }

        const now = new Date(); // Current time for parsing status if needed
        const allEvents = response.results.map((page) => parseScheduleEvent(page, now));

        // 2. Strict Sort
        const sortedEvents = allEvents.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return a.date.localeCompare(b.date);
        });

        // 3. Strict Filter based on "Today" logic
        // Events that are strictly before today are past.
        // Events that are today or later are future/next.
        const futureEvents = sortedEvents.filter(e => {
            if (!e.date) return false;
            const eventDate = new Date(e.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() >= today.getTime();
        });

        // 4. Split
        const nextEvent = futureEvents[0] || null;
        const upcomingEvents = futureEvents.slice(1);

        return {
            nextEvent,
            upcomingEvents
        };
    } catch (error) {
        console.error('Error fetching future schedule:', error);
        return { nextEvent: null, upcomingEvents: [] };
    }
}

/**
 * Get past events grouped by month
 * @returns {Promise<MonthGroup[]>}
 */
export async function getPastEventsByMonth() {
    try {
        const today = new Date().toISOString().split('T')[0];

        let response;
        try {
            response = await notion.databases.query({
                database_id: DATABASE_IDS.SCHEDULE,
                filter: {
                    and: [
                        {
                            property: 'Web公開',
                            select: {
                                equals: '公開'
                            }
                        },
                        {
                            property: '日付',
                            date: {
                                before: today
                            }
                        }
                    ]
                },
                sorts: [
                    {
                        property: '日付',
                        direction: 'descending'
                    }
                ]
            });
        } catch {
            response = await notion.databases.query({
                database_id: DATABASE_IDS.SCHEDULE,
                filter: {
                    property: '日付',
                    date: {
                        before: today
                    }
                },
                sorts: [
                    {
                        property: '日付',
                        direction: 'descending'
                    }
                ]
            });
        }

        const now = new Date();
        const events = response.results.map((page) => parseScheduleEvent(page, now));

        const grouped = new Map();
        for (const event of events) {
            if (!event.date) continue;
            const monthKey = event.date.substring(0, 7); // YYYY-MM
            if (!grouped.has(monthKey)) {
                const date = new Date(event.date);
                grouped.set(monthKey, {
                    month: monthKey,
                    label: date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' }),
                    events: []
                });
            }
            grouped.get(monthKey).events.push(event);
        }

        return Array.from(grouped.values());
    } catch (error) {
        console.error('Error fetching past events:', error);
        return [];
    }
}

/**
 * Parse Notion page to ScheduleEvent object
 * Using actual Japanese property names: 名前, 日付, 種類
 * @param {any} page
 * @param {Date} now
 * @returns {ScheduleEvent}
 */
function parseScheduleEvent(page, now) {
    const props = page.properties;
    // DB uses 日付 for date
    const dateProperty = props?.日付?.date;
    const eventDate = dateProperty?.start || '';
    const eventDateTime = eventDate ? new Date(eventDate) : null;
    const isUpcoming = eventDateTime ? eventDateTime >= now : false;
    const isPast = eventDateTime ? eventDateTime < now : false;

    return {
        id: page.id,
        // DB uses 名前 as title
        title: extractPlainText(props?.名前?.title) || '',
        date: eventDate,
        endDate: dateProperty?.end || '',
        // No description property, could use 種類
        description: props?.種類?.select?.name || '',
        location: '',
        isUpcoming,
        isPast
    };
}
