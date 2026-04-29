/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#060a10',
        'bg-panel': '#0b1220',
        'bg-card': '#0e1a2e',
        'neon-cyan': '#00f5ff',
        'neon-orange': '#ff6b00',
        'neon-yellow': '#f5e642',
        'neon-green': '#39ff14',
        'neon-pink': '#ff2d78',
        'text-primary': '#c8dcff',
        'text-dim': 'rgba(200,220,255,0.45)',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'rajdhani': ['Rajdhani', 'sans-serif'],
        'mono': ['Share Tech Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0,245,255,0.3)',
        'glow-orange': '0 0 20px rgba(255,107,0,0.3)',
        'glow-green': '0 0 20px rgba(57,255,20,0.3)',
      },
    },
  },
  plugins: [],
}