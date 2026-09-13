export const Colors = {
  light: {
    text: '#0F172A',
    textMuted: '#64748B',
    background: '#F1F5F4',
    card: '#FFFFFF',
    tint: '#0F766E',
    border: '#D1DED9',
    danger: '#BE123C',
    success: '#15803D',
    warning: '#B45309',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#0F766E',
  },
  dark: {
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    background: '#0B1220',
    card: '#152033',
    tint: '#2DD4BF',
    border: '#243247',
    danger: '#FB7185',
    success: '#4ADE80',
    warning: '#FBBF24',
    tabIconDefault: '#64748B',
    tabIconSelected: '#2DD4BF',
  },
};

export type ThemeName = keyof typeof Colors;
