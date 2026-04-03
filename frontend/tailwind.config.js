function themeColor(variable) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variable}) / ${opacityValue})`;
    }
    return `rgb(var(${variable}))`;
  };
}

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: themeColor('--color-background'),
        foreground: themeColor('--color-foreground'),
        card: themeColor('--color-card'),
        'card-foreground': themeColor('--color-card-foreground'),
        muted: themeColor('--color-muted'),
        'muted-foreground': themeColor('--color-muted-foreground'),
        border: themeColor('--color-border'),
        input: themeColor('--color-input'),
        ring: themeColor('--color-ring'),
        primary: themeColor('--color-primary'),
        'primary-foreground': themeColor('--color-primary-foreground'),
        secondary: themeColor('--color-secondary'),
        'secondary-foreground': themeColor('--color-secondary-foreground'),
        accent: themeColor('--color-accent'),
        'accent-foreground': themeColor('--color-accent-foreground'),
        destructive: themeColor('--color-destructive'),
        'destructive-foreground': themeColor('--color-destructive-foreground'),
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
