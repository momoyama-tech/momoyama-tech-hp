import { browser } from '$app/environment';

function createThemeStore() {
    let isDark = $state(false);
    let isScanLineActive = $state(false);
    let isMinimal = $state(false);

    let isSpotlightEnabled = $state(true);

    // Initialize from local storage or system preference
    if (browser) {
        const stored = localStorage.getItem('theme');
        if (stored) {
            isDark = stored === 'dark';
        } else {
            isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        // Apply initial class
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }

    function updateStorage() {
        if (browser) {
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            if (isDark) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        }
    }

    async function toggle() {
        // Instant toggle in minimal mode
        if (isMinimal) {
            isDark = !isDark;
            updateStorage();
            return;
        }

        if (isScanLineActive) return;

        isScanLineActive = true;

        // Switch theme mid-animation
        setTimeout(() => {
            isDark = !isDark;
            updateStorage();
        }, 400);

        setTimeout(() => {
            isScanLineActive = false;
        }, 1000);
    }

    function toggleMinimal() {
        isMinimal = !isMinimal;
        if (browser) {
            if (isMinimal) document.documentElement.classList.add('minimal');
            else document.documentElement.classList.remove('minimal');
        }
    }

    function toggleSpotlight() {
        isSpotlightEnabled = !isSpotlightEnabled;
    }

    return {
        get isDark() { return isDark; },
        get isScanLineActive() { return isScanLineActive; },
        get isMinimal() { return isMinimal; },
        get isSpotlightEnabled() { return isSpotlightEnabled; },
        toggle,
        toggleMinimal,
        toggleSpotlight
    };
}

export const theme = createThemeStore();
