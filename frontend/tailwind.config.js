/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#182232',        // Lighter Main Background: Soft Deep Slate Navy (#182232)
          card: '#222D42',        // Lighter Cards / Sections: Modern Dark Blue Slate (#222D42)
          border: '#33435C',      // Lighter Borders: Soft Gray-Blue (#33435C)
          accent: '#3B82F6',      // Primary Color: Electric Blue (#3B82F6)
          purple: '#8B5CF6',      // Secondary Color: Purple (#8B5CF6)
          emerald: '#22C55E',     // Success: Green (#22C55E)
          gold: '#F59E0B',        // Warning: Amber (#F59E0B)
          danger: '#EF4444',      // Error / Alert: Red (#EF4444)
          text: '#F8FAFC',        // Text: Soft White (#F8FAFC)
          subtext: '#CBD5E1',     // Secondary Text: Light Gray (#CBD5E1)
          lightBg: '#F8FAFC',
          lightCard: '#FFFFFF',
          lightBorder: '#E2E8F0',
          lightText: '#0F172A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
