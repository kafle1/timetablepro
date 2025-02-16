import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';
import { theme } from './src/lib/config/theme';

const config = {
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: theme.colors,
			borderRadius: theme.radius,
			fontFamily: {
				sans: ['var(--font-sans)', ...fontFamily.sans],
				mono: ['var(--font-mono)', ...fontFamily.mono]
			},
			fontSize: theme.fontSizes,
			fontWeight: theme.fontWeights,
			lineHeight: theme.lineHeights,
			spacing: theme.spacing,
			boxShadow: theme.shadows,
			zIndex: theme.zIndices,
			transitionDuration: {
				DEFAULT: '150ms',
				fast: '100ms',
				slow: '300ms',
				slower: '500ms'
			},
			transitionTimingFunction: {
				DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
				linear: 'linear',
				in: 'cubic-bezier(0.4, 0, 1, 1)',
				out: 'cubic-bezier(0, 0, 0.2, 1)',
				'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)'
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
				'collapsible-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-collapsible-content-height)' }
				},
				'collapsible-up': {
					from: { height: 'var(--radix-collapsible-content-height)' },
					to: { height: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'collapsible-down': 'collapsible-down 0.2s ease-out',
				'collapsible-up': 'collapsible-up 0.2s ease-out'
			}
		}
	},
	plugins: [require('tailwindcss-animate')]
} satisfies Config;

export default config;
