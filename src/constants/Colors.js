// Modern cricket-themed color palette with light/dark mode support

export const Colors = {
  light: {
    // Primary cricket greens
    primary: '#1B5E20',        // Deep cricket green
    primaryLight: '#4CAF50',   // Fresh grass green
    primaryDark: '#0D3E0F',    // Dark forest green
    
    // Cricket whites and accent colors
    secondary: '#FF6F00',      // Cricket ball orange
    secondaryLight: '#FFB74D', // Light orange
    tertiary: '#1976D2',       // Sky blue
    
    // Background colors
    background: '#FAFAFA',     // Soft white
    surface: '#FFFFFF',        // Pure white
    card: '#FFFFFF',           // Card background
    
    // Text colors
    text: '#212121',           // Primary text
    textSecondary: '#757575',  // Secondary text
    textLight: '#BDBDBD',      // Light text
    
    // Status colors
    success: '#4CAF50',        // Success green
    error: '#F44336',          // Error red
    warning: '#FF9800',        // Warning orange
    info: '#2196F3',           // Info blue
    
    // UI elements
    border: '#E0E0E0',         // Light border
    divider: '#E0E0E0',        // Divider
    shadow: 'rgba(0,0,0,0.1)', // Shadow
    overlay: 'rgba(0,0,0,0.5)', // Modal overlay
  },
  
  dark: {
    // Dark mode cricket theme
    primary: '#66BB6A',        // Bright cricket green
    primaryLight: '#81C784',   // Light green
    primaryDark: '#4CAF50',    // Medium green
    
    // Cricket accent colors for dark mode
    secondary: '#FF8F00',      // Bright orange
    secondaryLight: '#FFB74D', // Light orange
    tertiary: '#42A5F5',       // Light blue
    
    // Dark backgrounds
    background: '#121212',     // Deep dark
    surface: '#1E1E1E',        // Card surface
    card: '#2D2D2D',           // Card background
    
    // Dark text
    text: '#FFFFFF',           // Primary text
    textSecondary: '#BBBBBB',  // Secondary text
    textLight: '#777777',      // Light text
    
    // Status colors for dark mode
    success: '#4CAF50',        // Success green
    error: '#F44336',          // Error red
    warning: '#FF9800',        // Warning orange
    info: '#2196F3',           // Info blue
    
    // Dark UI elements
    border: '#333333',         // Dark border
    divider: '#333333',        // Dark divider
    shadow: 'rgba(0,0,0,0.3)', // Stronger shadow
    overlay: 'rgba(0,0,0,0.7)', // Darker overlay
  }
};

// Theme provider helper
export const getTheme = (isDark = false) => {
  return isDark ? Colors.dark : Colors.light;
};

// Gradient definitions for enhanced UI
export const Gradients = {
  primary: ['#1B5E20', '#4CAF50'],
  secondary: ['#FF6F00', '#FFB74D'],
  success: ['#2E7D32', '#4CAF50'],
  header: ['#1B5E20', '#2E7D32'],
  card: ['#FFFFFF', '#F5F5F5'],
  dark: ['#1E1E1E', '#2D2D2D'],
};