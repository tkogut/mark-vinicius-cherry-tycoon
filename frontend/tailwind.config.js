/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			screens: {
				'xs': '475px',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				/* Neo-Steampunk Cherry Palette */
				brass: {
					DEFAULT: '#d4af37',
					light: '#e8cc6e',
					dark: '#a68929',
				},
				copper: {
					DEFAULT: '#b87333',
					light: '#d49a5e',
					dark: '#8a5626',
				},
				ruby: {
					DEFAULT: '#9b111e',
					light: '#c9232f',
					dark: '#6e0c15',
				},
				charcoal: {
					DEFAULT: '#121212',
					light: '#1e1e1e',
					dark: '#0a0a0a',
				},
				hull: {
					DEFAULT: '#1a1510',
					border: '#d4af3780',
					glow: '#d4af3730',
				},
			},
			boxShadow: {
				'hull-glow': 'inset 0 1px 1px rgba(212,175,55,0.15), 0 0 20px rgba(212,175,55,0.08), 0 4px 20px rgba(0,0,0,0.6)',
				'hull-glow-hover': 'inset 0 1px 2px rgba(212,175,55,0.25), 0 0 30px rgba(212,175,55,0.15), 0 8px 30px rgba(0,0,0,0.7)',
				'brass-rim': '0 0 0 2px #d4af37, 0 0 15px rgba(212,175,55,0.3)',
			},
			keyframes: {
				shimmer: {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' },
				},
				'god-ray': {
					'0%': { transform: 'rotate(-5deg) scale(1)', opacity: '0.15' },
					'50%': { transform: 'rotate(5deg) scale(1.1)', opacity: '0.35' },
					'100%': { transform: 'rotate(-5deg) scale(1)', opacity: '0.15' },
				},
				'gear-spin': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' },
				},
				shake: {
					'0%, 100%': { transform: 'translateX(0)' },
					'10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
					'20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
				},
			},
			animation: {
				shimmer: 'shimmer 2s infinite',
				'god-ray': 'god-ray 8s ease-in-out infinite',
				'gear-spin': 'gear-spin 12s linear infinite',
				shake: 'shake 0.5s ease-in-out',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
}
