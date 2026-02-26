export const theme = {
  colors: {
    // Brand
    primary: '#6C3AED',
    primaryDark: '#1E1839',
    primaryLight: '#EDE9FE',
    primaryMuted: '#A78BFA',

    // Functional
    secondary: '#10B981',
    accent: '#F59E0B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',

    // Surfaces
    background: '#F8F7FC',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',

    // Text
    text: '#1A1235',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textOnPrimary: '#FFFFFF',

    // Borders
    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    // Header
    headerDark: '#1E1839',

    // Other
    disabled: '#E5E7EB',
    overlay: 'rgba(30, 24, 57, 0.5)',
  },

  // Gradient presets (for LinearGradient)
  gradients: {
    header: ['#1E1839', '#6C3AED'] as const,
    headerSubtle: ['#1E1839', '#2D2066'] as const,
    primary: ['#6C3AED', '#8B5CF6'] as const,
    success: ['#059669', '#10B981'] as const,
    card: ['#FFFFFF', '#F8F7FC'] as const,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 999,
  },

  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 22,
    xxl: 28,
    hero: 34,
  },

  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  shadows: {
    sm: {
      shadowColor: '#1A1235',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    },
    md: {
      shadowColor: '#1A1235',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#1A1235',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 5,
    },
  },
};
