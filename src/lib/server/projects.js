import {
	notion,
	DATABASE_IDS,
	extractPlainText,
	extractCoverUrl,
	isNotionConfigured
} from './notion.js';
import { withCache } from './cache.js';

/**
 * @typedef {Object} Project
 * @property {string} id - Page ID
 * @property {string} title - Project title
 * @property {string} description - Project description
 * @property {string} category - Primary category (first tag)
 * @property {string[]} [categories] - All category tags
 * @property {string|null} coverUrl - Cover image URL
 * @property {string[]} tags - Additional tags
 * @property {string} url - External project URL
 * @property {string} creator - Creator name
 */

const MOCK_PROJECTS = [
	{
		id: 'mock-1',
		title: '桃山祭 プロジェクションマッピング 2025',
		description: '大学祭のメインステージにて実施した、学生制作のプロジェクションマッピング演出。',
		category: '映像演出',
		coverUrl:
			'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
		tags: ['#映像演出', '#TouchDesigner', '#空間デザイン'],
		url: '',
		creator: '映像班'
	},
	{
		id: 'mock-2',
		title: 'テック部 公式ポータルサイト',
		description: 'SvelteKitとTailwind CSSを採用した高速でインタラクティブな部活公式Webサイト。',
		category: 'Web開発',
		coverUrl:
			'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
		tags: ['#SvelteKit', '#TailwindCSS', '#TypeScript'],
		url: '',
		creator: 'Web班'
	},
	{
		id: 'mock-3',
		title: '地域小学生向けプログラミング体験教室',
		description: 'Scratchとマイクロビットを活用した子ども向けIT体験ワークショップの企画・運営。',
		category: 'IT教育',
		coverUrl:
			'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
		tags: ['#Scratch', '#microbit', '#地域共創'],
		url: '',
		creator: '教育班'
	}
];

/**
 * Fetch all projects from Notion. Cached in memory (see withCache).
 * @type {() => Promise<Project[]>}
 */
export const getProjects = withCache(async () => {
	if (!isNotionConfigured) return MOCK_PROJECTS;
	try {
		return await fetchProjectsFromNotion();
	} catch (error) {
		console.error('Error fetching projects from Notion:', error);
		return [];
	}
});

/**
 * @returns {Promise<Project[]>}
 */
async function fetchProjectsFromNotion() {
	const response = await notion.databases.query({
		database_id: DATABASE_IDS.PROJECT,
		sorts: [{ timestamp: 'created_time', direction: 'descending' }]
	});

	/** @type {any[]} */
	const pages = response.results.filter((p) => 'properties' in p);

	/**
	 * @param {any} page
	 * @returns {string[]}
	 */
	const memberRelIds = (page) =>
		(page.properties?.部員名簿?.relation || []).map((/** @type {any} */ r) => r.id);

	// Resolve every creator (部員名簿 relation) in ONE batch of unique lookups,
	// instead of one request per project.
	const creatorIds = [...new Set(pages.flatMap(memberRelIds))];

	/** @type {Map<string, string>} */
	const creatorNames = new Map();
	await Promise.all(
		creatorIds.map(async (id) => {
			try {
				const page = await notion.pages.retrieve({ page_id: id });
				if ('properties' in page) {
					const cp = /** @type {any} */ (page).properties;
					creatorNames.set(id, extractPlainText(cp?.名前?.title || cp?.Name?.title) || '');
				}
			} catch (e) {
				console.error('Error fetching creator:', e);
			}
		})
	);

	return pages.map((page) => {
		const project = parseProject(page);
		project.creator = creatorNames.get(memberRelIds(page)[0]) || '';
		return project;
	});
}

/**
 * Parse Notion page to Project object
 * Using actual Japanese property names from DB
 * @param {any} page
 * @returns {Project}
 */
function parseProject(page) {
	const props = page.properties;
	const title = extractPlainText(props?.名前?.title) || '';

	return {
		id: page.id,
		// DB uses 名前 as title
		title,
		// No description property in this DB
		description: '',
		// DB uses カテゴリ (multi_select); keep a primary + the full list
		category: props?.カテゴリ?.multi_select?.[0]?.name || props?.カテゴリ?.select?.name || '',
		categories: (
			props?.カテゴリ?.multi_select || (props?.カテゴリ?.select ? [props.カテゴリ.select] : [])
		)
			.map((/** @type {any} */ o) => o.name)
			.filter(Boolean),
		// null when no cover is set — ProjectCard renders a generated placeholder.
		coverUrl: extractCoverUrl(page),
		tags: [],
		// DB uses URL
		url: props?.URL?.url || page.url,
		creator: ''
	};
}
