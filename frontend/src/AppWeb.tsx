import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
  },
});

export default function AppWeb() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>ROADSoS</Text>
      <Text style={styles.subtitle}>Mobile app only - use Android or Expo Go</Text>
    </View>
  );
}
