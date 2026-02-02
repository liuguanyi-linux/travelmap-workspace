/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#020617', // slate-950
          dark: '#0f172a', // slate-900
          light: '#1e293b', // slate-800
          text: '#cffafe', // cyan-50
          muted: '#94a3b8', // slate-400
        },
        neon: {
          blue: '#06b6d4', // cyan-500
          purple: '#a855f7', // purple-500
          pink: '#ec4899', // pink-500
          green: '#22c55e', // green-500
        }
      },
      boxShadow: {
        'neon-blue': '0 0 5px theme("colors.cyan.500"), 0 0 20px theme("colors.cyan.500")',
        'neon-purple': '0 0 5px theme("colors.purple.500"), 0 0 20px theme("colors.purple.500")',
        'neon-pink': '0 0 5px theme("colors.pink.500"), 0 0 20px theme("colors.pink.500")',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
