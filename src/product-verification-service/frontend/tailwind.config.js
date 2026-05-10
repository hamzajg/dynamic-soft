/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0c1220',
        'bg-secondary': '#121b2e',
        'bg-tertiary': '#1a2640',
        accent: '#00d4ff',
        'accent-hover': '#00b8e6',
        'accent-dim': 'rgba(0, 212, 255, 0.10)',
        'text-primary': '#f0f4f8',
        'text-secondary': '#a8b8c8',
        'text-tertiary': '#7a8a9a',
        'border-subtle': 'rgba(100, 180, 255, 0.12)',
        surface: '#121b2e',
        'surface-hover': '#1a2640',
        'surface-elevated': '#1a2640',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
