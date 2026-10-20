/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        headline: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        brand: {
          dark: '#0B0B14',
          body: 'rgba(17, 17, 17, 0.9)',
          blue: '#4F8FF7',
          'blue-from': '#5B9BFA',
          'blue-to': '#3B7FF0',
          secondary: '#F5F5F7',
          'secondary-hover': '#ECECF0',
        },
      },
      boxShadow: {
        'mockup': '0 30px 80px rgba(20, 30, 60, 0.12)',
        'mockup-hover': '0 40px 95px rgba(20, 30, 60, 0.20)',
        'btn-blue': '0 14px 28px -4px rgba(59, 127, 240, 0.4)',
        'halo': '0 0 0 6px rgba(79, 143, 247, 0.15)',
        'badge': '0 4px 14px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
