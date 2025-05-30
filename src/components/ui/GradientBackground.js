import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function GradientBackground({ 
  children, 
  style, 
  colors = null,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 }
}) {
  const { theme } = useTheme();
  
  // Fallback gradient colors based on theme
  const defaultColors = colors || [theme.primary, theme.primaryLight];

  const gradientStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: defaultColors[0], // Fallback for web
    },
    content: {
      flex: 1,
    }
  });

  return (
    <View style={[gradientStyles.container, style]}>
      <View style={gradientStyles.content}>
        {children}
      </View>
    </View>
  );
}