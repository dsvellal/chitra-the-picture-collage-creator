/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                canvas: {
                    bg: '#020617', // slate-950
                },
                panel: {
                    bg: '#1e293b', // slate-800
                    border: 'rgba(255, 255, 255, 0.1)',
                },
                primary: {
                    DEFAULT: '#6366f1', // indigo-500
                    hover: '#4f46e5',   // indigo-600
                }
            }
        },
    },
    plugins: [],
}
