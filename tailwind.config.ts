import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
	  colors: {
		  black: {
			  DEFAULT: '#000000',
			  light: 'rgba(0, 0, 0, 0.75)', // 浅黑色带透明度
			  muted: 'rgba(0, 0, 0, 0.50)', // 中等透明度黑色
			  soft: 'rgba(0, 0, 0, 0.25)', // 更轻的黑色
		  },
		  white: {
			  DEFAULT: '#ffffff',
			  light: 'rgba(255, 255, 255, 0.90)', // 浅白色
			  muted: 'rgba(255, 255, 255, 0.75)', // 中等透明度白色
			  soft: 'rgba(255, 255, 255, 0.50)', // 更轻的白色
		  },
		  transparent: 'transparent',
		  gray: {
			  50: '#f9f9f9',
			  100: '#f0f0f0',
			  200: '#e2e2e2',
			  300: '#d4d4d4',
			  400: '#b8b8b8',
			  500: '#9e9e9e',
			  600: '#7f7f7f',
			  700: '#5f5f5f',
			  800: '#404040',
			  900: '#2a2a2a',
		  },
		  red: {
			  50: '#fff1f1',
			  100: '#ffe4e6',
			  200: '#fecdd3',
			  300: '#fda4af',
			  400: '#fb7185',
			  500: '#f43f5e',
			  600: '#e11d48',
			  700: '#be123c',
			  800: '#9f1239',
			  900: '#881337',
		  },
		  yellow: {
			  50: '#fffbeb',
			  100: '#fef3c7',
			  200: '#fde68a',
			  300: '#fcd34d',
			  400: '#fbbf24',
			  500: '#f59e0b',
			  600: '#d97706',
			  700: '#b45309',
			  800: '#92400e',
			  900: '#78350f',
		  },
		  green: {
			  50: '#f0fdfa',
			  100: '#ccfbf1',
			  200: '#99f6e4',
			  300: '#5eead4',
			  400: '#2dd4bf',
			  500: '#14b8a6',
			  600: '#0d9488',
			  700: '#0f766e',
			  800: '#115e59',
			  900: '#134e4a',
		  },
		  blue: {
			  50: '#eff6ff',
			  100: '#dbeafe',
			  200: '#bfdbfe',
			  300: '#93c5fd',
			  400: '#60a5fa',
			  500: '#3b82f6',
			  600: '#2563eb',
			  700: '#1d4ed8',
			  800: '#1e40af',
			  900: '#1e3a8a',
		  },
		  indigo: {
			  50: '#eef2ff',
			  100: '#e0e7ff',
			  200: '#c7d2fe',
			  300: '#a5b4fc',
			  400: '#818cf8',
			  500: '#6366f1',
			  600: '#4f46e5',
			  700: '#4338ca',
			  800: '#3730a3',
			  900: '#312e81',
		  },
		  purple: {
			  50: '#f5f3ff',
			  100: '#ede9fe',
			  200: '#ddd6fe',
			  300: '#c4b5fd',
			  400: '#a78bfa',
			  500: '#8b5cf6',
			  600: '#7c3aed',
			  700: '#6d28d9',
			  800: '#5b21b6',
			  900: '#4c1d95',
		  },
		  pink: {
			  50: '#fdf2f8',
			  100: '#fce7f3',
			  200: '#fbcfe8',
			  300: '#f9a8d4',
			  400: '#f472b6',
			  500: '#ec4899',
			  600: '#db2777',
			  700: '#be185d',
			  800: '#9d174d',
			  900: '#831843',
		  },
		  orange: {
			  50: '#fff7ed',
			  100: '#ffedd5',
			  200: '#fed7aa',
			  300: '#fdba74',
			  400: '#fb923c',
			  500: '#f97316',
			  600: '#ea580c',
			  700: '#c2410c',
			  800: '#9a3412',
			  900: '#7c2d12',
		  },
		  teal: {
			  50: '#f0fdfa',
			  100: '#ccfbf1',
			  200: '#99f6e4',
			  300: '#5eead4',
			  400: '#2dd4bf',
			  500: '#14b8a6',
			  600: '#0d9488',
			  700: '#0f766e',
			  800: '#115e59',
			  900: '#134e4a',
		  },
		  cyan: {
			  50: '#ecfeff',
			  100: '#cffafe',
			  200: '#a5f3fc',
			  300: '#67e8f9',
			  400: '#22d3ee',
			  500: '#06b6d4',
			  600: '#0891b2',
			  700: '#0e7490',
			  800: '#155e75',
			  900: '#164e63',
		  },
		  lime: {
			  50: '#f7fee7',
			  100: '#ecfccb',
			  200: '#d9f99d',
			  300: '#bef264',
			  400: '#a3e635',
			  500: '#84cc16',
			  600: '#65a30d',
			  700: '#4d7c0f',
			  800: '#3f6212',
			  900: '#365314',
		  },
		  amber: {
			  50: '#fffbeb',
			  100: '#fef3c7',
			  200: '#fde68a',
			  300: '#fcd34d',
			  400: '#fbbf24',
			  500: '#f59e0b',
			  600: '#d97706',
			  700: '#b45309',
			  800: '#92400e',
			  900: '#78350f',
		  },
		  warmGray: {
			  50: '#fafaf9',
			  100: '#f5f5f4',
			  200: '#e7e5e4',
			  300: '#d6d3d1',
			  400: '#a8a29e',
			  500: '#78716c',
			  600: '#57534e',
			  700: '#44403c',
			  800: '#292524',
			  900: '#1c1917',
		  },
		  trueGray: {
			  50: '#fafafa',
			  100: '#f5f5f5',
			  200: '#e5e5e5',
			  300: '#d4d4d4',
			  400: '#a3a3a3',
			  500: '#737373',
			  600: '#525252',
			  700: '#404040',
			  800: '#262626',
			  900: '#171717',
		  },
		  coolGray: {
			  50: '#f9fafb',
			  100: '#f3f4f6',
			  200: '#e5e7eb',
			  300: '#d1d5db',
			  400: '#9ca3af',
			  500: '#6b7280',
			  600: '#4b5563',
			  700: '#374151',
			  800: '#1f2937',
			  900: '#111827',
		  },
		  blueGray: {
			  50: '#f8fafc',
			  100: '#f1f5f9',
			  200: '#e2e8f0',
			  300: '#cbd5e1',
			  400: '#94a3b8',
			  500: '#64748b',
			  600: '#475569',
			  700: '#334155',
			  800: '#1e293b',
			  900: '#0f172a',
		  },
		  opacity: {
			  10: '0.10',
			  25: '0.25',
			  50: '0.50',
			  75: '0.75',
			  90: '0.90',
			  100: '1.0',
		  },
	  },
  	extend: {
		screens: {
			'3xl': '1920px',
			'4xl': '2560px',
			'5xl': '3200px',
		},
		fontFamily: {
			sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
			mono: ['var(--font-mono)', 'monospace'],
		},
		maxWidth: {
			'golden-sm': '61.8%',
			'golden-md': '38.2%',
		},
		fontSize: {
			'ss': '9px',
			'xs-sm': '14px',
			'sm-md': '15px',
			'md-lg': '16px',
			'lg-xl': '18px',
			'xl-2xl': '20px',
			'2xl-3xl': '24px',
			'3xl-4xl': '28px',
			'4xl-5xl': '32px',
			'5xl-6xl': '36px',
			'6xl-7xl': '40px',
			'7xl-8xl': '48px',
			'8xl-9xl': '56px'
		},
  		colors: {
// -----------
// 🚧[Warning] This is TofuUI's TailwindCSS custom theme color, do not modify or move
// Version 1.0.0 - Update through tofu-ui-cli add tailwindcss-config
// https://ui.sdjz.wiki
// Copyright © 2024-2025 TofuUI & Shuakmi, All Rights Reserved.
// ----------------------------------------------------------------------



			'tofu-black': '#080808',
			'tofu-black-ds': '#616161',
			'tofu-black-icon': '#020202',
			'tofu-light-bg': '#F9F9F9',
			'tofu-light-dian': '#D5D5D5',
			'tofu-light-ds-2': '#010101',
			'tofu-light-sc': '#9B9B9B',

			'tofu-light': '#FFFFFF',
			'tofu-dark-ds': '#ABB4B0',
			'tofu-light-icon': '#FFFFFF',
			'tofu-dark-bg': '#080808',
			'tofu-dark-dian': '#2D2D2D',
			'tofu-dark-intro': '#171717',
			'tofu-dark-sc': '#9B9B9B',
			'tofu-dark-header-ds': '#B4B4B4',
			'tofu-dark-modal': '#2F2F2F',


// dropdown-menu
			'tofu-light-dropdown-menu-hover': '#F5F5F5',
			'tofu-black-dropdown-menu-hover': '#424242',
			'tofu-light-dropdown-menu-icon': '#767676',



// SideBar Theme Color
			'tofu-light-sidebar-bg': '#FCFCFD',
			'tofu-light-sidebar-bg-hover': '#EDEDF1',
			'tofu-light-sidebar-icon': '#1C2024',
			'tofu-light-sidebar-hover-text': '#000509e3',
			'tofu-light-sidebar-text': '#0007149f',
			'tofu-light-sidebar-border-r': '#00002d17',
// ----------------------------------
			'tofu-dark-sidebar-bg': '#05050A',
			'tofu-dark-sidebar-bg-hover': '#16171C',
			'tofu-dark-sidebar-icon': '#E0E0E1',
			'tofu-dark-sidebar-border-r': '#d6ebfd30',
			'tofu-dark-sidebar-hover-text': '#B4B4B4',
			'tofu-dark-sidebar-text': '#f1f7feb5',


// Table Theme Color
			'tofu-light-table-hover': '#F2F2F2',
			'tofu-light-table-text': '#000000',
			'tofu-light-table-hang-1': '#fff',
			'tofu-light-table-hang-2': '#FAFAFA',
			'tofu-light-table-ds': '#666666',
// ----------------------------------
			'tofu-dark-table-hover': '#1A1A1A',
			'tofu-dark-table-text': '#FFFFFF',
			'tofu-dark-table-hang-1': '#000000',
			'tofu-dark-table-hang-2': '#0A0A0A',
			'tofu-dark-table-ds': '#A1A1A1',


			'tofu-all-data-table': '#A1A1A1',



			'tofu-black-lighter': 'rgba(0, 0, 0, 0.5)',
			'tofu-black-lightest': 'rgba(0, 0, 0, 0.3)',
			'tofu-white': '#FFFFFF',
			'tofu-white-dark': 'rgba(255, 255, 255, 0.7)',
			'tofu-white-darker': 'rgba(255, 255, 255, 0.5)',
			'tofu-white-darkest': 'rgba(255, 255, 255, 0.3)',

			'tofu-gray-100': '#F7FAFC', // 最浅的灰色，用于背景
			'tofu-gray-200': '#EDF2F7', // 较浅的灰色，用于背景
			'tofu-gray-300': '#E2E8F0', // 浅灰色，用于边框和分割线
			'tofu-gray-400': '#CBD5E0', // 中等灰色，用于次要文字
			'tofu-gray-500': '#A0AEC0', // 深灰色，用于主要文字
			'tofu-gray-600': 'rgba(79, 89, 102, 0.08)', // 较深的灰色，用于强调文字
			'tofu-gray-750': 'rgba(79, 89, 102, 0.12)',
			'tofu-gray-700': '#4A5568', // 更深的灰色，用于重要文字
			'tofu-gray-800': '#2D3748', // 非常深的灰色，用于重要文字
			'tofu-gray-900': '#1A202C', // 最深的灰色，用于重要文字

			'tofu-red': '#FF6B6B', // 鲜明的红色，用于重要提示或警示
			'tofu-red-light': 'rgba(255, 107, 107, 0.7)', // 较浅的红色，用于衬托元素
			'tofu-red-lighter': 'rgba(255, 107, 107, 0.5)', // 更浅的红色，用于强调元素
			'tofu-red-lightest': 'rgba(255, 107, 107, 0.3)', // 最浅的红色，用于背景

			'tofu-orange': '#FFA94D', // 鲜明的橙色，用于提示或警示
			'tofu-orange-light': 'rgba(255, 169, 77, 0.7)', // 较浅的橙色，用于衬托元素
			'tofu-orange-lighter': 'rgba(255, 169, 77, 0.5)', // 更浅的橙色，用于强调元素
			'tofu-orange-lightest': 'rgba(255, 169, 77, 0.3)', // 最浅的橙色，用于背景

			'tofu-yellow': '#FFD166', // 鲜明的黄色，用于提示或警示
			'tofu-yellow-light': 'rgba(255, 209, 102, 0.7)', // 较浅的黄色，用于衬托元素
			'tofu-yellow-lighter': 'rgba(255, 209, 102, 0.5)', // 更浅的黄色，用于强调元素
			'tofu-yellow-lightest': 'rgba(255, 209, 102, 0.3)', // 最浅的黄色，用于背景

			'tofu-green': '#4ad24e', // 鲜明的绿色,用于积极提示或成功提示
			'tofu-green-light': 'rgba(76, 175, 80, 0.7)', // 较浅的绿色,用于衬托元素
			'tofu-green-lighter': 'rgba(76, 175, 80, 0.5)', // 更浅的绿色,用于强调元素
			'tofu-green-lightest': 'rgba(76, 175, 80, 0.3)', // 最浅的绿色,用于背景


			'tofu-teal': '#3AAFA9', // 鲜明的绿蓝色，可作为独立的颜色使用
			'tofu-teal-light': 'rgba(58, 175, 169, 0.7)', // 较浅的绿蓝色，用于衬托元素
			'tofu-teal-lighter': 'rgba(58, 175, 169, 0.5)', // 更浅的绿蓝色，用于强调元素
			'tofu-teal-lightest': 'rgba(58, 175, 169, 0.3)', // 最浅的绿蓝色，用于背景

			'tofu-blue': '#2196F3', // 鲜明的蓝色，用于信息提示
			'tofu-blue-light': 'rgba(33, 150, 243, 0.7)', // 较浅的蓝色，用于衬托元素
			'tofu-blue-lighter': 'rgba(33, 150, 243, 0.5)', // 更浅的蓝色，用于强调元素
			'tofu-blue-lightest': 'rgba(33, 150, 243, 0.3)', // 最浅的蓝色，用于背景

			'tofu-indigo': '#6C63FF', // 鲜明的靛蓝色，用于突出显示
			'tofu-indigo-light': 'rgba(108, 99, 255, 0.7)', // 较浅的靛蓝色，用于衬托元素
			'tofu-indigo-lighter': 'rgba(108, 99, 255, 0.5)', // 更浅的靛蓝色，用于强调元素
			'tofu-indigo-lightest': 'rgba(108, 99, 255, 0.3)', // 最浅的靛蓝色，用于背景

			'tofu-purple': '#c438ff', // 鲜明的紫色，用于突出显示
			'tofu-purple-light': 'rgba(142, 68, 173, 0.7)', // 较浅的紫色，用于衬托元素
			'tofu-purple-lighter': 'rgba(142, 68, 173, 0.5)', // 更浅的紫色，用于强调元素
			'tofu-purple-lightest': 'rgba(192,92,232,0.11)', // 最浅的紫色，用于背景

			'tofu-pink': '#EC407A', // 鲜明的粉色，用于突出显示
			'tofu-pink-light': 'rgba(236, 64, 122, 0.7)', // 较浅的粉色，用于衬托元素
			'tofu-pink-lighter': 'rgba(236, 64, 122, 0.5)', // 更浅的粉色，用于强调元素
			'tofu-pink-lightest': 'rgba(236, 64, 122, 0.3)', // 最浅的粉色，用于背景

			'tofu-brown': '#8D6E63', // 鲜明的棕色，用于突出显示
			'tofu-brown-light': 'rgba(141, 110, 99, 0.7)', // 较浅的棕色，用于衬托元素
			'tofu-brown-lighter': 'rgba(141, 110, 99, 0.5)', // 更浅的棕色，用于强调元素
			'tofu-brown-lightest': 'rgba(141, 110, 99, 0.3)', // 最浅的棕色，用于背景

			'tofu-cyan': '#00BCD4', // 鲜明的青色，用于突出显示
			'tofu-cyan-light': 'rgba(0, 188, 212, 0.7)', // 较浅的青色，用于衬托元素
			'tofu-cyan-lighter': 'rgba(0, 188, 212, 0.5)', // 更浅的青色，用于强调元素
			'tofu-cyan-lightest': 'rgba(0, 188, 212, 0.3)', // 最浅的青色，用于背景

			'tofu-lime': '#CDDC39', // 鲜明的酸橙色，用于突出显示
			'tofu-lime-light': 'rgba(205, 220, 57, 0.7)', // 较浅的酸橙色，用于衬托元素
			'tofu-lime-lighter': 'rgba(205, 220, 57, 0.5)', // 更浅的酸橙色，用于强调元素
			'tofu-lime-lightest': 'rgba(205, 220, 57, 0.3)', // 最浅的酸橙色，用于背景


// border
			'tofu-border': 'rgba(102, 102, 102, 0.24)',


// Alert Warning
			'tofu-warning': '#F4E64D',// 淡黄色基底[背景]
			'tofu-warning-light': 'rgba(244,108,33,1)',// 橙色[文字]
			'tofu-warning-lighter': 'rgba(244, 230, 77, 0.5)',// 更浅黄色[衬托元素]
			'tofu-warning-lightest': 'rgba(244, 230, 77, 0.3)',// 鲜明的黄色[衬托]

// Alert Info
			'tofu-info': '#E6F7FF',// 淡蓝色基底[背景]
			'tofu-info-light': '#BAE7FF',// 较浅蓝色[背景]
			'tofu-info-lighter': '#91D5FF',// 更浅蓝色[衬托元素]
			'tofu-info-lightest': '#1890FF',// 最鲜明的蓝色[文字颜色]

// Alert Error
			'tofu-error': '#FFF2F0',// 淡红色基底[背景]
			'tofu-error-light': '#FFCCC7',// 较浅的红色[背景]
			'tofu-error-lighter': '#FFA39E',// 更浅的红色[衬托元素]
			'tofu-error-lightest': '#FF4D4F', // 最鲜明的红色[文字颜色]

// Alert Success
			'tofu-success': '#F6FFED', // 淡绿色基底[背景]
			'tofu-success-light': '#D9F7BE', // 较浅的淡绿色[衬托元素]
			'tofu-success-lighter': '#B7EB8F', // 更浅的绿色[强调元素]
			'tofu-success-lightest': '#3daf12', // 最鲜明的绿色[文字颜色]


// 渐变专题
			'tofu-gradient-red': 'linear-gradient(45deg, #FF6B6B, #FFE66D)', // 红黄渐变
			'tofu-gradient-orange': 'linear-gradient(45deg, #FFA94D, #FFDD59)', // 橙黄渐变
			'tofu-gradient-green': 'linear-gradient(45deg, #4CAF50, #B9F6CA)', // 绿色渐变
			'tofu-gradient-blue': 'linear-gradient(45deg, #2196F3, #82B1FF)', // 蓝色渐变
			'tofu-gradient-purple': 'linear-gradient(45deg, #8E44AD, #E1BEE7)', // 紫色渐变
			'tofu-gradient-teal': 'linear-gradient(45deg, #3AAFA9, #80DEEA)', // 绿蓝渐变
			'tofu-gradient-indigo': 'linear-gradient(45deg, #6C63FF, #C5CAE9)', // 靛蓝渐变
			'tofu-gradient-pink': 'linear-gradient(45deg, #EC407A, #F8BBD0)', // 粉色渐变
			'tofu-gradient-brown': 'linear-gradient(45deg, #8D6E63, #D7CCC8)', // 棕色渐变
			'tofu-gradient-cyan': 'linear-gradient(45deg, #00BCD4, #80DEEA)', // 青色渐变
			'tofu-gradient-lime': 'linear-gradient(45deg, #CDDC39, #F0F4C3)', // 酸橙渐变
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
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
			golden: '0.618rem',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
