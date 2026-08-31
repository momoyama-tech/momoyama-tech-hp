import {
	notion,
	DATABASE_IDS,
	extractPlainText,
	extractCoverUrl,
	isNotionConfigured
} from './notion.js';

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
 * Fetch all published projects from Notion database
 * @returns {Promise<Project[]>}
 */
export async function getProjects() {
	if (!isNotionConfigured) {
		return MOCK_PROJECTS;
	}

	try {
		// Query without Web公開 filter since it may not exist
		const response = await notion.databases.query({
			database_id: DATABASE_IDS.PROJECT,
			sorts: [
				{
					timestamp: 'created_time',
					direction: 'descending'
				}
			]
		});

		// Fetch creator names for each project
		const projectsWithNulls = await Promise.all(
			response.results.map(async (page) => {
				if (!('properties' in page)) return null;

				/** @type {any} */
				const safePage = page;
				const project = parseProject(safePage);

				// Get creator from relation - DB uses 部員名簿
				const props = safePage.properties;
				const creatorRelation = props?.部員名簿?.relation;
				if (creatorRelation && creatorRelation.length > 0) {
					try {
						const creatorPage = await notion.pages.retrieve({ page_id: creatorRelation[0].id });
						if ('properties' in creatorPage) {
							/** @type {any} */
							const safeCreator = creatorPage;
							const creatorProps = safeCreator.properties;
							// Member database uses 名前 as title
							project.creator =
								extractPlainText(creatorProps?.名前?.title || creatorProps?.Name?.title) || '';
						}
					} catch (e) {
						console.error('Error fetching creator:', e);
						project.creator = '';
					}
				}
				return project;
			})
		);

		/** @type {Project[]} */
		// @ts-ignore
		const projects = projectsWithNulls.filter((p) => p !== null);

		return projects;
	} catch (error) {
		console.error('Error fetching projects from Notion:', error);
		return [];
	}
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
