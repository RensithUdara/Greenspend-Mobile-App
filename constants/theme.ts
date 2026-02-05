// Greenspend Professional Green Theme

export const Colors = {
  // Primary Brand Colors
  deepForestGreen: '#1B4332',
  emeraldGreen: '#2D6A4F',
  mintGreen: '#D8F3DC',

  // UI Colors
  white: '#FFFFFF',
  background: '#F8FAFB',
  cardBackground: '#FFFFFF',
  slateGrey: '#64748B',
  lightGrey: '#E2E8F0',
  borderGrey: '#E5E7EB',

  // Semantic Colors
  income: '#10B981',
  expense: '#EF4444',
  warning: '#F59E0B',
  danger: '#DC2626',

  // Text Colors
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  // Status Colors for Budget Gauges
  gaugeGreen: '#22C55E',
  gaugeYellow: '#EAB308',
  gaugeOrange: '#F97316',
  gaugeRed: '#EF4444',
} as const;

export const Typography = {
  // Font Sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  // Font Weights (system fonts)
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export const CategoryIcons: Record<string, string> = {
  'Groceries': 'cart',
  'Dining': 'restaurant',
  'Transport': 'car',
  'Rent': 'home',
  'Utilities': 'flash',
  'Entertainment': 'game-controller',
  'Shopping': 'bag-handle',
  'Healthcare': 'medkit',
  'Education': 'school',
  'Travel': 'airplane',
  'Subscriptions': 'repeat',
  'Fitness': 'fitness',
  'Income': 'wallet',
  'Salary': 'cash',
  'Investment': 'trending-up',
  'Gift': 'gift',
  'Others': 'ellipsis-horizontal',
} as const;

export const CategoryColors: Record<string, string> = {
  'Groceries': '#22C55E',
  'Dining': '#F97316',
  'Transport': '#3B82F6',
  'Rent': '#8B5CF6',
  'Utilities': '#EAB308',
  'Entertainment': '#EC4899',
  'Shopping': '#F43F5E',
  'Healthcare': '#14B8A6',
  'Education': '#6366F1',
  'Travel': '#0EA5E9',
  'Subscriptions': '#A855F7',
  'Fitness': '#10B981',
  'Income': '#22C55E',
  'Salary': '#10B981',
  'Investment': '#059669',
  'Gift': '#F472B6',
  'Others': '#64748B',
} as const;

export const DefaultCategories = [
  'Groceries',
  'Dining',
  'Transport',
  'Rent',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Education',
  'Travel',
  'Subscriptions',
  'Fitness',
  'Income',
  'Salary',
  'Investment',
  'Gift',
  'Others',
] as const;
