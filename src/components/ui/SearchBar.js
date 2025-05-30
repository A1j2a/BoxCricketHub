import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Searchbar, IconButton } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';

export default function SearchBar({ 
  onSearch, 
  onFilter = null,
  placeholder = "Search venues...",
  value = "",
  style 
}) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState(value);

  const handleSearch = (query) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const searchStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.background,
    },
    searchbar: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 8,
      elevation: 2,
    },
    filterButton: {
      marginLeft: 8,
      backgroundColor: theme.surface,
      borderRadius: 8,
    }
  });

  return (
    <View style={[searchStyles.container, style]}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={handleSearch}
        value={searchQuery}
        style={searchStyles.searchbar}
        iconColor={theme.primary}
        placeholderTextColor={theme.textLight}
      />
      {onFilter && (
        <IconButton
          icon="filter-variant"
          size={24}
          iconColor={theme.primary}
          style={searchStyles.filterButton}
          onPress={onFilter}
        />
      )}
    </View>
  );
}