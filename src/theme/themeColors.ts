// src/theme/themeColors.ts

interface ThemeColors {
    light: {
        primary: string;
        secondary: string;
    };
    dark: {
        primary: string;
        secondary: string;
    };
}

export const themeColors: { [key: string]: ThemeColors } = {
    default: {
        light: {
            primary: 'blue-400',
            secondary: 'blue-100',
        },
        dark: {
            primary: 'blue-500',
            secondary: 'blue-700',
        },
    },
    pink: {
        light: {
            primary: 'pink-300',
            secondary: 'pink-100',
        },
        dark: {
            primary: 'pink-500',
            secondary: 'pink-600',
        },
    },
    green: {
        light: {
            primary: 'green-300',
            secondary: 'green-100',
        },
        dark: {
            primary: 'green-500',
            secondary: 'green-600',
        },
    },
    orange: {
        light: {
            primary: 'orange-300',
            secondary: 'orange-100',
        },
        dark: {
            primary: 'orange-500',
            secondary: 'orange-600',
        },
    },
    purple: {
        light: {
            primary: 'purple-300',
            secondary: 'purple-100',
        },
        dark: {
            primary: 'purple-500',
            secondary: 'purple-600',
        },
    },
    yellow: {
        light: {
            primary: 'yellow-300',
            secondary: 'yellow-100',
        },
        dark: {
            primary: 'yellow-500',
            secondary: 'yellow-600',
        },
    },
};
