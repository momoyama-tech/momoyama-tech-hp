export class TranslationStore {
    cache = $state(new Map());
    /** @type {Map<string, Promise<string>>} in-flight requests, de-duplicated by key */
    pending = new Map();
    VERSION = 'v1'; // Increment this to invalidate cache if we persisted it, or for logic changes

    constructor() { }

    /**
     * Clears the translation cache.
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Synchronous, reactive read of an already-cached translation.
     * Returns undefined when the text has not been translated yet.
     * @param {string} text
     * @param {string} targetLang
     * @returns {string | undefined}
     */
    peek(text, targetLang = 'en') {
        if (!text) return '';
        return this.cache.get(`${this.VERSION}:${text}:${targetLang}`);
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
        // De-duplicate concurrent requests for the same string
        const inFlight = this.pending.get(key);
        if (inFlight) return inFlight;

        const task = this._fetch(text, targetLang, key).finally(() => this.pending.delete(key));
        this.pending.set(key, task);
        return task;
    }

    /**
     * Batch-translate many strings in a single request. Cached entries are
     * served from cache; only the misses hit the API.
     * @param {string[]} texts
     * @param {string} targetLang
     * @returns {Promise<string[]>}
     */
    async getMany(texts, targetLang = 'en') {
        const missing = [...new Set(texts.filter((t) => t && this.peek(t, targetLang) === undefined))];

        if (missing.length) {
            try {
                const response = await fetch('/api/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: missing, target: targetLang })
                });
                if (response.ok) {
                    const data = await response.json();
                    const out = Array.isArray(data.translatedText)
                        ? data.translatedText
                        : [data.translatedText];
                    missing.forEach((src, i) => {
                        let translated = out[i] ?? src;
                        if (targetLang === 'en') translated = this.applyGlossary(translated);
                        this.cache.set(`${this.VERSION}:${src}:${targetLang}`, translated);
                    });
                }
            } catch (error) {
                console.error('Batch translation error:', error);
            }
        }

        return texts.map((t) => this.peek(t, targetLang) ?? t);
    }

    /**
     * @param {string} text
     * @param {string} targetLang
     * @param {string} key
     * @returns {Promise<string>}
     */
    async _fetch(text, targetLang, key) {
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
