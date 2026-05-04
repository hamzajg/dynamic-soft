/** @type {import('tailwindcss').Config} */
const flowbite = require("flowbite-react/tailwind");

module.exports = {
    darkMode: ["variant", "&:is(.dark *)&:not(.light *)"],
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
        "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
        flowbite.content(),
    ],
    theme: {
        extend: {
            colors: {
                background: "#0c1220",
                surface: {
                    DEFAULT: "#121b2e",
                    hover: "#1a2640",
                    elevated: "#1f2d45",
                },
                accent: {
                    DEFAULT: "#00d4ff",
                    hover: "#33ddff",
                    glow: "rgba(0, 212, 255, 0.25)",
                    dim: "rgba(0, 212, 255, 0.10)",
                },
                text: {
                    primary: "#f0f4f8",
                    secondary: "#a8b8c8",
                    tertiary: "#7a8a9a",
                    disabled: "#5a6a7a",
                },
                danger: "#f04d4d",
                success: "#10b981",
                warning: "#ff7a4d",
                info: "#00d4ff",
                border: {
                    subtle: "rgba(100, 180, 255, 0.12)",
                    DEFAULT: "rgba(100, 180, 255, 0.20)",
                    hover: "rgba(0, 212, 255, 0.25)",
                    focus: "rgba(0, 212, 255, 0.60)",
                },
            },
            borderRadius: {
                sm: "4px",
                md: "8px",
                DEFAULT: "8px",
                lg: "12px",
                xl: "16px",
                full: "9999px",
            },
            maxWidth: {
                "8xl": "90rem",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
            },
            animation: {
                "fade-in": "fadeIn 200ms ease-in-out",
            },
            boxShadow: {
                "lg-light": "0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -2px rgba(255, 255, 255, 0.05)",
                "accent-glow": "0 0 15px rgba(0, 212, 255, 0.25)",
            },
        },
        fontFamily: {
            display: ["Orbitron", "sans-serif"],
            sans: ["Inter", "sans-serif"],
            body: ["Inter", "sans-serif"],
            mono: ["'JetBrains Mono'", "monospace"],
        }
    },
    plugins: [flowbite.plugin(),],
}

