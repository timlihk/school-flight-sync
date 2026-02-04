import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				lg: '2rem',
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				'border-subtle': 'hsl(var(--border-subtle))',
				'border-strong': 'hsl(var(--border-strong))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					light: 'hsl(var(--primary-light))',
					subtle: 'hsl(var(--primary-subtle))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					light: 'hsl(var(--secondary-light))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					light: 'hsl(var(--accent-light))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// School colors with full palette
				benenden: {
					DEFAULT: 'hsl(var(--benenden))',
					subtle: 'hsl(var(--benenden-subtle))',
					light: 'hsl(var(--benenden-light))',
					glow: 'hsl(var(--benenden-glow))',
				},
				wycombe: {
					DEFAULT: 'hsl(var(--wycombe))',
					subtle: 'hsl(var(--wycombe-subtle))',
					light: 'hsl(var(--wycombe-light))',
					glow: 'hsl(var(--wycombe-glow))',
				},
				// Journey states
				'journey-complete': 'hsl(var(--journey-complete))',
				'journey-pending': 'hsl(var(--journey-pending))',
				'journey-missing': 'hsl(var(--journey-missing))',
				// Transport types with full palette
				'transport-flight': {
					DEFAULT: 'hsl(var(--transport-flight))',
					subtle: 'hsl(var(--transport-flight-subtle))',
					glow: 'hsl(var(--transport-flight-glow))',
				},
				'transport-ground': {
					DEFAULT: 'hsl(var(--transport-ground))',
					subtle: 'hsl(var(--transport-ground-subtle))',
					glow: 'hsl(var(--transport-ground-glow))',
				},
				// Success/Warning/Danger for semantic use
				success: 'hsl(var(--journey-complete))',
				warning: 'hsl(var(--journey-pending))',
				danger: 'hsl(var(--journey-missing))',
				// Sidebar
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xl: 'var(--radius-xl)',
				'2xl': 'var(--radius-2xl)',
				full: 'var(--radius-full)'
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
				display: ['Inter', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				'2xs': ['0.625rem', { lineHeight: '0.875rem' }],
			},
			backgroundImage: {
				'gradient-sky': 'var(--gradient-sky)',
				'gradient-sunset': 'var(--gradient-sunset)',
				'gradient-ocean': 'var(--gradient-ocean)',
				'gradient-forest': 'var(--gradient-forest)',
				'gradient-warm': 'var(--gradient-warm)',
				'gradient-cool': 'var(--gradient-cool)',
				'gradient-premium': 'var(--gradient-premium)',
				'gradient-academic': 'var(--gradient-academic)',
				'gradient-elegant': 'var(--gradient-elegant)',
				'mesh-primary': 'var(--mesh-primary)',
			},
			boxShadow: {
				// Glassmorphism shadows
				'glass': 'var(--glass-shadow)',
				'glass-lg': 'var(--glass-shadow-lg)',
				// Elevation shadows
				'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
				'elevated-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
				'elevated-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
				// Button hover shadows
				'elegant': '0 4px 14px -3px rgba(0, 0, 0, 0.12), 0 2px 6px -2px rgba(0, 0, 0, 0.08)',
				'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
				'warm': '0 4px 14px -3px rgba(250, 112, 154, 0.3), 0 2px 6px -2px rgba(254, 225, 64, 0.2)',
				// Glow shadows
				'glow-primary': '0 0 20px -5px hsl(var(--primary) / 0.4)',
				'glow-benenden': '0 0 20px -5px hsl(var(--benenden) / 0.4)',
				'glow-wycombe': '0 0 20px -5px hsl(var(--wycombe) / 0.4)',
				'glow-success': '0 0 20px -5px hsl(var(--journey-complete) / 0.4)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					from: { opacity: '0', transform: 'translateY(10px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					from: { opacity: '1', transform: 'translateY(0)' },
					to: { opacity: '0', transform: 'translateY(10px)' }
				},
				'slide-in': {
					from: { transform: 'translateX(-20px)', opacity: '0' },
					to: { transform: 'translateX(0)', opacity: '1' }
				},
				'slide-in-right': {
					from: { transform: 'translateX(20px)', opacity: '0' },
					to: { transform: 'translateX(0)', opacity: '1' }
				},
				'slide-up': {
					from: { transform: 'translateY(20px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				'scale-in': {
					from: { transform: 'scale(0.95)', opacity: '0' },
					to: { transform: 'scale(1)', opacity: '1' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'bounce-soft': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'spin-slow': {
					from: { transform: 'rotate(0deg)' },
					to: { transform: 'rotate(360deg)' }
				},
				'ping-slow': {
					'75%, 100%': {
						transform: 'scale(1.5)',
						opacity: '0'
					}
				},
				'countdown-pulse': {
					'0%, 100%': { transform: 'scale(1)', opacity: '1' },
					'50%': { transform: 'scale(1.02)', opacity: '0.9' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'slide-in': 'slide-in 0.4s ease-out',
				'slide-in-right': 'slide-in-right 0.4s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				'scale-in': 'scale-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'float': 'float 6s ease-in-out infinite',
				'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite',
				'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
				'spin-slow': 'spin-slow 3s linear infinite',
				'ping-slow': 'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
				'countdown-pulse': 'countdown-pulse 2s ease-in-out infinite',
			},
			transitionTimingFunction: {
				'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
				'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
			},
			transitionDuration: {
				'400': '400ms',
				'600': '600ms',
			}
		}
	},
	plugins: [
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		require("tailwindcss-animate")
	],
} satisfies Config;
