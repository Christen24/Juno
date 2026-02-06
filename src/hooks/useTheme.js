import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        loadTheme();
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const loadTheme = async () => {
        try {
            const savedTheme = await window.electronAPI.getTheme();
            setTheme(savedTheme);
        } catch (error) {
            console.error('Failed to load theme:', error);
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        try {
            await window.electronAPI.setTheme(newTheme);
            setTheme(newTheme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    return { theme, toggleTheme };
}
