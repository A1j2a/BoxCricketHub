import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function EmptyState({ 
  icon = 'information-outline', 
  title = 'No Data', 
  message = 'There is no data to display', 
  buttonText,
  onButtonPress 
}) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={72} color="#cccccc" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {buttonText && onButtonPress && (
        <Button 
          mode="contained" 
          onPress={onButtonPress}
          style={styles.button}
        >
          {buttonText}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  button: {
    paddingHorizontal: 16,
  },
});
