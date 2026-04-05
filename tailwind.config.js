/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        shipcred: {
          'primary': '#10b981',
          'primary-content': '#ffffff',
          'secondary': '#6366f1',
          'secondary-content': '#ffffff',
          'accent': '#f59e0b',
          'accent-content': '#ffffff',
          'neutral': '#1f2937',
          'neutral-content': '#f9fafb',
          'base-100': '#ffffff',
          'base-200': '#f9fafb',
          'base-300': '#e5e7eb',
          'base-content': '#1f2937',
          'info': '#3b82f6',
          'success': '#10b981',
          'warning': '#f59e0b',
          'error': '#ef4444',
        },
      },
      'night',
    ],
  },
};
