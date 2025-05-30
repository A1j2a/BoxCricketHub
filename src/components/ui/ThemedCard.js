import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Surface } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';

export default function ThemedCard({ 
  children, 
  style, 
  onPress, 
  elevation = 2,
  variant = 'elevated',
  ...props 
}) {
  const { theme } = useTheme();

  const cardStyles = StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      marginVertical: 8,
      marginHorizontal: 16,
      shadowColor: theme.shadow,
      shadowOffset: {
        width: 0,
        height: elevation,
      },
      shadowOpacity: 0.1,
      shadowRadius: elevation * 2,
      elevation: elevation,
      borderWidth: variant === 'outlined' ? 1 : 0,
      borderColor: theme.border,
    },
    content: {
      padding: 16,
    }
  });

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      onPress={onPress}
      style={[cardStyles.card, style]}
      activeOpacity={onPress ? 0.7 : 1}
      {...props}
    >
      <View style={cardStyles.content}>
        {children}
      </View>
    </CardComponent>
  );
}