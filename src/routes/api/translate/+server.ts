import { json } from '@sveltejs/kit';
import { translate } from 'google-translate-api-x';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    try {
        const { text, target } = await request.json();

        if (!text) {
            return json({ error: 'Text is required' }, { status: 400 });
        }

        // Handle array of strings or single string
        const res = await translate(text, { to: target || 'en' });

        // google-translate-api-x returns an object or array of objects depending on input
        // Standardize output to string or array of strings
        if (Array.isArray(res)) {
            return json({ translatedText: res.map(r => r.text) });
        } else {
            return json({ translatedText: res.text });
        }

    } catch (error) {
        console.error('Translation Error:', error);
        // Fallback: return original text if translation fails
        const { text } = await request.json().catch(() => ({ text: '' }));
        return json({ translatedText: text, error: 'Translation failed' });
    }
}
