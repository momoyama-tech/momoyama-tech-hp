import { notion, DATABASE_IDS, extractPlainText, extractFileUrl } from '$lib/server/notion.js';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const config = {
    isr: {
        expiration: 60
    }
};

export const load: PageServerLoad = async ({ params, setHeaders }) => {
    const { title } = params;

    // Set Cache-Control headers
    setHeaders({
        'cache-control': 'public, max-age=60, s-maxage=600'
    });

    try {
        // 1. Find the page by 'タイトル' property in NEWS database
        const response = await notion.databases.query({
            database_id: DATABASE_IDS.NEWS,
            filter: {
                property: 'タイトル',
                title: {
                    equals: title
                }
            }
        });

        if (response.results.length === 0) {
            throw error(404, 'News article not found');
        }

        const page = response.results[0];

        // 2. Fetch blocks (content) of the page
        const blocksResponse = await notion.blocks.children.list({
            block_id: page.id
        });

        // 3. Extract info and content
        // @ts-ignore
        const props = page.properties;
        const pageTitle = extractPlainText(props.タイトル.title);
        const publishDate = props.公開日?.date?.start || props.作成日?.created_time || '';

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

        // @ts-ignore
        const coverImage = page.cover ? extractFileUrl(page.cover) : null;

        // Return minimized article object
        return {
            article: {
                id: page.id,
                title: pageTitle,
                date: publishDate,
                content: content,
                coverImage: coverImage
            }
        };
    } catch (e: any) {
        if (e.status === 404) throw e;
        console.error('Error fetching Notion News:', e);
        throw error(500, 'Internal Server Error');
    }
};
