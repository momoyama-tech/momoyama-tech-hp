import { getNewsContent } from "$lib/server/news";
import { json } from "@sveltejs/kit";

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
    const content = await getNewsContent(params.id);
    return json({ content: content || '' });
}
