import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Open Sans', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: {
                    DEFAULT: 'var(--color-primary, #2E7D32)',
                    dark: 'var(--color-primary-dark, #1B5E20)',
                    light: '#4CAF50',
                },
                accent: {
                    yellow: 'var(--color-accent-yellow, #FBC02D)',
                    red: 'var(--color-highlight-red, #E53935)',
                },
            },
            keyframes: {
                'slide-from-left': {
                    '0%': { opacity: '0', transform: 'translateX(-80px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                'slide-from-right': {
                    '0%': { opacity: '0', transform: 'translateX(80px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
            },
            animation: {
                'slide-from-left': 'slide-from-left 0.8s ease-out forwards',
                'slide-from-right': 'slide-from-right 0.8s ease-out forwards',
            },
        },
    },

    plugins: [forms],
};
