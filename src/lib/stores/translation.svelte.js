export class TranslationStore {
    cache = $state(new Map());
    VERSION = 'v1'; // Increment this to invalidate cache if we persisted it, or for logic changes

    constructor() { }

    /**
     * Clears the translation cache.
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Applies glossary replacements to the translated text.
     * @param {string} text
     * @returns {string}
     */
    applyGlossary(text) {
        if (!text) return text;
        return text
            .replace(/Momoyama Gakuin University/gi, "St. Andrew's University")
            .replace(/Momoyama Gakuin/gi, "St. Andrew's")
            .replace(/Momoyama Tech Club/gi, "Momoyama Tech Club")
            .replace(/Club Room/gi, "Club Room");
    }

    /**
     * Translates text if not already cached.
     * @param {string} text - The text to translate.
     * @param {string} targetLang - Target language code (default 'en').
     * @returns {Promise<string>} - The translated text.
     */
    async get(text, targetLang = 'en') {
        if (!text) return '';

        const key = `${this.VERSION}:${text}:${targetLang}`;
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, target: targetLang })
            });

            if (!response.ok) throw new Error('Translation failed');

            const data = await response.json();
            let translated = data.translatedText;

            // Apply glossary repairs
            if (targetLang === 'en') {
                translated = this.applyGlossary(translated);
            }

            this.cache.set(key, translated);
            return translated;
        } catch (error) {
            console.error('Translation error:', error);
            return text; // Fallback to original
        }
    }
}

export const translationStore = new TranslationStore();
