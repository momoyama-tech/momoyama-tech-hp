import { Client } from '@notionhq/client';
// Runtime env: updating these on the host does NOT require a rebuild.
import { env } from '$env/dynamic/private';

const NOTION_API_KEY = env.NOTION_API_KEY ?? '';

/**
 * Whether a real Notion token is present (accepts both the legacy `secret_`
 * and the current `ntn_` token formats). When false, the data layer falls
 * back to the built-in sample data.
 */
export const isNotionConfigured =
	/^(secret_|ntn_)/.test(NOTION_API_KEY) && !NOTION_API_KEY.includes('xxxxx');

/**
 * Notion Client instance
 * @type {Client}
 */
export const notion = new Client({
	auth: isNotionConfigured ? NOTION_API_KEY : undefined
});

/**
 * Database IDs for Notion databases
 */
export const DATABASE_IDS = {
	NEWS: env.NOTION_NEWS_DB_ID ?? '',
	PROJECT: env.NOTION_PROJECT_DB_ID ?? '',
	SCHEDULE: env.NOTION_SCHEDULE_DB_ID ?? ''
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
