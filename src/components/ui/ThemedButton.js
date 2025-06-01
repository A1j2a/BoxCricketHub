import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';

export default function ThemedButton({ 
  children, 
  onPress,
  mode = 'contained',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  style,
  ...props 
}) {
  const { theme } = useTheme();

  const getButtonColors = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: theme.secondary,
          textColor: '#FFFFFF'
        };
      case 'success':
        return {
          backgroundColor: theme.success,
          textColor: '#FFFFFF'
        };
      case 'warning':
        return {
          backgroundColor: theme.warning,
          textColor: '#FFFFFF'
        };
      case 'error':
        return {
          backgroundColor: theme.error,
          textColor: '#FFFFFF'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          textColor: theme.primary,
          borderColor: theme.primary
        };
      default:
        return {
          backgroundColor: theme.primary,
          textColor: '#FFFFFF'
        };
    }
  };

  const colors = getButtonColors();
  
  const buttonStyles = StyleSheet.create({
    button: {
      borderRadius: 8,
      marginVertical: 8,
      borderWidth: variant === "outline" ? 1 : 0,
      borderColor: colors.borderColor,
    },
    small: {
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    medium: {
      height: 50,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 24,
    },
  });

  return (
    <Button
      mode={mode}
      onPress={onPress}
      disabled={disabled || loading}
      loading={loading}
      icon={icon}
      buttonColor={colors.backgroundColor}
      textColor={colors.textColor}
      style={[buttonStyles.button, buttonStyles[size], style]}
      contentStyle={buttonStyles[size]}
      {...props}
    >
      {children}
    </Button>
  );
}