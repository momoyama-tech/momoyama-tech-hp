import { getNews } from '$lib/server/news.js';
import { getProjects } from '$lib/server/projects.js';
import { getFutureSchedule, getPastEventsByMonth } from '$lib/server/schedule.js';
import { notion, extractPlainText, extractFileUrl } from '$lib/server/notion.js';

export const config = {
    isr: {
        expiration: 60
    }
};

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ setHeaders }) {
    console.log('[HOME LOAD] Starting optimized parallel data fetch...');

    // Set Cache-Control headers for browser and CDN caching
    setHeaders({
        'cache-control': 'public, max-age=60, s-maxage=600'
    });

    try {
        // Fetch base data in parallel
        const [newsBase, projectsRaw, scheduleData, pastEventsByMonth] = await Promise.all([
            getNews(10),
            getProjects(),
            getFutureSchedule(),
            getPastEventsByMonth()
        ]);

        // Pre-fetch blocks and covers for news items in parallel
        const newsWithContent = await Promise.all(
            newsBase.map(async (item) => {
                try {
                    const [blocksResponse, pageResponse] = await Promise.all([
                        notion.blocks.children.list({ block_id: item.id }),
                        notion.pages.retrieve({ page_id: item.id })
                    ]);

                    const content = blocksResponse.results.map((block: any) => {
                        const type = block.type;

                        if (type === 'image') {
                            return {
                                type,
                                url: extractFileUrl(block.image)
                            };
                        }

                        const richText = block[type]?.rich_text;
                        if (!richText) return null;
                        return {
                            type,
                            text: extractPlainText(richText)
                        };
                    }).filter((item: any) => item && (item.text !== undefined || item.url !== undefined));

                    // Robust cover image extraction
                    // @ts-ignore
                    const coverImage = pageResponse.cover ? extractFileUrl(pageResponse.cover) : null;

                    // Return minimized object
                    return {
                        id: item.id,
                        title: item.title,
                        date: item.date,
                        tags: item.tags,
                        coverUrl: item.coverUrl,
                        content,
                        coverImage
                    };
                } catch (e) {
                    console.error(`Failed to pre-fetch optimized content for news ${item.id}:`, e);
                    return { ...item, content: [], coverImage: null };
                }
            })
        );

        // Minimize project data
        const projects = projectsRaw.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            description: p.description,
            tags: p.tags,
            coverUrl: p.coverUrl,
            url: p.url
        }));

        return {
            news: newsWithContent,
            projects,
            scheduleData,
            pastEventsByMonth
        };
    } catch (error: any) {
        console.error('[HOME LOAD] ERROR:', error.message);
        return {
            news: [],
            projects: [],
            scheduleData: { nextEvent: null, upcomingEvents: [] },
            pastEventsByMonth: []
        };
    }
}
