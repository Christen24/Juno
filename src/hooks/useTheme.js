import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        loadTheme();
    }, []);

    useEffect(() => {
        // Remove all theme classes first
        document.documentElement.classList.remove('dark', 'midnight', 'nebula');

        // Add the current theme class
        if (theme !== 'light') {
            document.documentElement.classList.add(theme);
        }
    }, [theme]);

    const loadTheme = async () => {
        try {
            const savedTheme = await window.electronAPI.getTheme();
            setTheme(savedTheme || 'dark');
        } catch (error) {
            console.error('Failed to load theme:', error);
        }
    };

    const setThemeValue = async (newTheme) => {
        try {
            await window.electronAPI.setTheme(newTheme);
            setTheme(newTheme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    return { theme, setTheme: setThemeValue };

    return { theme, toggleTheme };
}
