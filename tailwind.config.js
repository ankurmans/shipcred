/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF5C00',
          light: '#FF8533',
          dark: '#E54D00',
          50: '#FFF7ED',
          100: '#FFEDD5',
          500: '#FF5C00',
          600: '#E54D00',
        },
        surface: {
          primary: '#FFFFFF',
          secondary: '#F7F8FA',
          muted: '#F3F4F6',
          inverse: '#1A1A1A',
          'inverse-subtle': '#111111',
          border: '#F3F4F6',
          'border-dark': '#2A2A2A',
        },
        fg: {
          primary: '#1A1A1A',
          secondary: '#666666',
          muted: '#767676',
          faint: '#CCCCCC',
          inverse: '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['"Funnel Sans"', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'monospace'],
      },
      borderRadius: {
        'card': '20px',
        'proof': '10px',
        'icon': '6px',
      },
      boxShadow: {
        'card': '0 4px 16px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'card-dark': '0 8px 32px rgba(255, 92, 0, 0.08)',
        'cta': '0 4px 16px rgba(255, 92, 0, 0.25)',
      },
    },
  },
  plugins: [],
};
