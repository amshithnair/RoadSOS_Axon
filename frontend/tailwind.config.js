module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'emergency-red': '#EF4444',
        'emergency-orange': '#F97316',
        'emergency-blue': '#3B82F6',
        'emergency-green': '#22C55E',
        'emergency-purple': '#A855F7',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      }
    },
  },
  plugins: [],
}
