import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
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
