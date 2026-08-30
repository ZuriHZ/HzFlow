/** @type {import('tailwindcss').Config} */
/**
 * Tailwind v4 is CSS-first (src/index.css @theme).
 * This file stays minimal for shadcn CLI (components.json).
 */
export default {
    content: ["./src/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {},
    },
    plugins: [],
};
