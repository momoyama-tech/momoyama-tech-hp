import { notion, DATABASE_IDS, extractPlainText, extractCoverUrl, getFallbackImage } from './notion.js';
import { NotionToMarkdown } from 'notion-to-md';
import { marked } from 'marked';

const n2m = new NotionToMarkdown({ notionClient: notion });

/**
 * @typedef {Object} NewsItem
 * @property {string} id - Page ID
 * @property {string} title - News title
 * @property {string} date - Publication date (ISO string)
 * @property {string} summary - News summary
 * @property {string[]} tags - News tags (categories)
 * @property {string|null} coverUrl - Cover image URL
 * @property {string} url - Page URL for linking
 */

/**
 * Fetch published news items from Notion database
 * DB Properties: タイトル, 作成日, 公開日, URL, カテゴリー, ステータス
 * @param {number} limit - Maximum number of items to fetch
 * @returns {Promise<NewsItem[]>}
 */
export async function getNews(limit = 10) {
    try {
        const response = await notion.databases.query({
            database_id: DATABASE_IDS.NEWS,
            sorts: [
                {
                    property: '公開日',
                    direction: 'descending'
                }
            ],
            page_size: limit
        });

        const items = response.results.map((page) => {
            // Validating page object structure for TS
            if (!('properties' in page) || !('url' in page)) {
                return null;
            }

            /** @type {any} */
            const safePage = page;
            const props = safePage.properties;
            // Map 'カテゴリー' (select) to tags array
            const category = props?.カテゴリー?.select?.name;
            const tags = category ? [category] : [];
            const title = extractPlainText(props?.タイトル?.title) || '';
            const coverUrl = extractCoverUrl(page) || getFallbackImage(page.id);

            return {
                id: page.id,
                title,
                // DB uses 公開日
                date: props?.公開日?.date?.start || props?.作成日?.created_time || '',
                // No description in DB, using empty string
                summary: '',
                tags,
                coverUrl,
                // DB uses URL
                url: props?.URL?.url || page.url
            };
        }).filter((item) => item !== null);

        /** @type {NewsItem[]} */
        // @ts-ignore
        return items;
    } catch (error) {
        console.error('Error fetching news from Notion:', error);
        return [];
    }
}

/**
 * Fetch a single news item by ID
 * @param {string} pageId
 * @returns {Promise<NewsItem|null>}
 */
export async function getNewsById(pageId) {
    try {
        const page = await notion.pages.retrieve({ page_id: pageId });

        if (!('properties' in page)) {
            return null;
        }

        /** @type {any} */
        const safePage = page;
        const props = safePage.properties;

        // Map 'カテゴリー' (select) to tags array
        const category = props?.カテゴリー?.select?.name;
        const tags = category ? [category] : [];
        const title = extractPlainText(props?.タイトル?.title) || '';
        const coverUrl = extractCoverUrl(page) || getFallbackImage(page.id);

        return {
            id: page.id,
            title,
            date: props?.公開日?.date?.start || '',
            summary: '',
            tags,
            coverUrl,
            url: props?.URL?.url || ('url' in page ? page.url : '')
        };
    } catch (error) {
        console.error('Error fetching news item:', error);
        return null;
    }
}

/**
 * Fetch and convert page content to HTML
 * @param {string} pageId
 * @returns {Promise<string|null>} HTML string
 */
export async function getNewsContent(pageId) {
    try {
        const mdblocks = await n2m.pageToMarkdown(pageId);
        const mdString = n2m.toMarkdownString(mdblocks);

        if (!mdString || !mdString.parent) {
            return '';
        }

        // Convert to HTML
        const html = await marked.parse(mdString.parent);
        return html;
    } catch (error) {
        console.error('Error fetching/converting content:', error);
        return null;
    }
}
