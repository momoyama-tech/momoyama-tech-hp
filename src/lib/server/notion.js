import { Client } from '@notionhq/client';
import {
    NOTION_API_KEY,
    NOTION_NEWS_DB_ID,
    NOTION_PROJECT_DB_ID,
    NOTION_SCHEDULE_DB_ID
} from '$env/static/private';

/**
 * Notion Client instance
 * @type {Client}
 */
export const notion = new Client({
    auth: NOTION_API_KEY
});

/**
 * Database IDs for Notion databases
 */
export const DATABASE_IDS = {
    NEWS: NOTION_NEWS_DB_ID,
    PROJECT: NOTION_PROJECT_DB_ID,
    SCHEDULE: NOTION_SCHEDULE_DB_ID
};

/**
 * Extract plain text from Notion rich text array
 * @param {any[]} richTextArray
 * @returns {string}
 */
export function extractPlainText(richTextArray) {
    if (!richTextArray || !Array.isArray(richTextArray)) return '';
    return richTextArray.map((text) => text.plain_text).join('');
}

/**
 * Extract URL from Notion file property
 * @param {any} fileProperty
 * @returns {string|null}
 */
export function extractFileUrl(fileProperty) {
    if (!fileProperty) return null;
    if (fileProperty.type === 'external') {
        return fileProperty.external?.url || null;
    }
    if (fileProperty.type === 'file') {
        return fileProperty.file?.url || null;
    }
    return null;
}

/**
 * Extract cover image URL from Notion page
 * @param {any} page
 * @returns {string|null}
 */
export function extractCoverUrl(page) {
    if (!page.cover) return null;
    return extractFileUrl(page.cover);
}

/**
 * Generate fallback image URL (Picsum with seed)
 * @param {string} seed - Seed string (e.g. page ID)
 * @returns {string}
 */
export function getFallbackImage(seed = 'tech') {
    return `https://picsum.photos/seed/${seed}/800/600`;
}
