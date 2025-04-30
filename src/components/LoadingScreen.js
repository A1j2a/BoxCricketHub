import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="cricket" size={64} color="#1E88E5" />
      <ActivityIndicator size="large" color="#1E88E5" style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  spinner: {
    marginVertical: 20,
  },
  message: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});
