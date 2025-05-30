import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { Appbar, Text, IconButton } from "react-native-paper";
import { useTheme } from "../../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ModernHeader({
  title,
  subtitle = null,
  showBack = false,
  onBack = null,
  actions = [],
  showThemeToggle = true,
  style,
}) {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  const headerStyles = StyleSheet.create({
    header: {
      backgroundColor: theme.primary,
      // paddingTop: insets.top,
      elevation: 4,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    content: {
      backgroundColor: "transparent",
    },
    titleContainer: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    title: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "bold",
    },
    subtitle: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 14,
      marginTop: 2,
    },
  });

  return (
    <>
      <StatusBar
        backgroundColor={theme.primary}
        barStyle={isDarkMode ? "light-content" : "light-content"}
      />
      <View style={[headerStyles.header, style]}>
        <Appbar.Header style={headerStyles.content}>
          {showBack && (
            <Appbar.BackAction onPress={onBack} iconColor="#FFFFFF" />
          )}

          <View style={headerStyles.titleContainer}>
            <Text style={headerStyles.title}>{title}</Text>
            {subtitle && <Text style={headerStyles.subtitle}>{subtitle}</Text>}
          </View>

          {actions.map((action, index) => (
            <Appbar.Action
              key={index}
              icon={action.icon}
              onPress={action.onPress}
              iconColor="#FFFFFF"
            />
          ))}

          {showThemeToggle && (
            <Appbar.Action
              icon={isDarkMode ? "weather-sunny" : "weather-night"}
              onPress={toggleTheme}
              iconColor="#FFFFFF"
            />
          )}
        </Appbar.Header>
      </View>
    </>
  );
}
