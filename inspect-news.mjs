import { Client } from '@notionhq/client';
import 'dotenv/config';

const NOTION_API_KEY = process.env.NOTION_TOKEN;
const NEWS_DB_ID = '2f2bbfad8f0880ca9acbfb849c1af87c';

const notion = new Client({ auth: NOTION_API_KEY });

async function inspect() {
    try {
        const response = await notion.databases.query({
            database_id: NEWS_DB_ID,
            page_size: 1
        });

        if (response.results.length > 0) {
            console.log('Keys:', Object.keys(response.results[0].properties));
            // Log details of 'カテゴリー' and '概要' if they exist
            const props = response.results[0].properties;
            if (props['カテゴリー']) console.log('カテゴリー type:', props['カテゴリー'].type);
            if (props['概要']) console.log('概要 type:', props['概要'].type);
            if (props['Description']) console.log('Description type:', props['Description'].type);
        } else {
            console.log('No news items found.');
        }
    } catch (e) {
        console.error(e);
    }
}

inspect();
