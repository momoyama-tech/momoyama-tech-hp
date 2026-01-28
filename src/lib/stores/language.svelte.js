import { browser } from '$app/environment';

export const language = $state(/** @type {{ current: 'JP' | 'EN' }} */({
    current: (browser && /** @type {'JP'|'EN'} */ (localStorage.getItem('lang'))) || 'JP'
}));

export function toggleLanguage() {
    const newLang = language.current === 'JP' ? 'EN' : 'JP';
    setLanguage(newLang);
}

/**
 * @param {'JP' | 'EN'} lang
 */
export function setLanguage(lang) {
    if (lang === 'JP' || lang === 'EN') {
        language.current = lang;
        if (browser) {
            localStorage.setItem('lang', lang);
        }
    }
}
