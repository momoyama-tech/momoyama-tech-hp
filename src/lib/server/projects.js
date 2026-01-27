import { notion, DATABASE_IDS, extractPlainText, extractCoverUrl, getFallbackImage } from './notion.js';

/**
 * @typedef {Object} Project
 * @property {string} id - Page ID
 * @property {string} title - Project title
 * @property {string} description - Project description
 * @property {string} category - Project category (Game, Web, etc.)
 * @property {string|null} coverUrl - Cover image URL
 * @property {string[]} tags - Additional tags
 * @property {string} url - External project URL
 * @property {string} creator - Creator name
 */

/**
 * Fetch all published projects from Notion database
 * @returns {Promise<Project[]>}
 */
export async function getProjects() {
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
                            project.creator = extractPlainText(creatorProps?.名前?.title || creatorProps?.Name?.title) || '';
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
 * Get all unique categories from projects
 * @returns {Promise<string[]>}
 */
export async function getCategories() {
    try {
        const database = await notion.databases.retrieve({
            database_id: DATABASE_IDS.PROJECT
        });

        // DB uses カテゴリ
        const categoryProperty = database.properties?.カテゴリ || database.properties?.Category;
        if (categoryProperty?.type === 'select' && categoryProperty.select?.options) {
            return categoryProperty.select.options.map((option) => option.name);
        }
        return [];
    } catch (error) {
        console.error('Error fetching categories:', error);
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
        // DB uses カテゴリ or Category (handled in getCategories but here just accessing prop)
        category: props?.カテゴリ?.select?.name || '',
        coverUrl: extractCoverUrl(page) || getFallbackImage(page.id),
        tags: [],
        // DB uses URL
        url: props?.URL?.url || page.url,
        creator: ''
    };
}
