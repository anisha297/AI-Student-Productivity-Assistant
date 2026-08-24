import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={{marginBottom: 20}}>Index</Text>
      
      {name === 'Index' && (
        <>
          <Button mode="contained" onPress={() => router.push('/login')} style={styles.btn}>Login</Button>
          <Button mode="outlined" onPress={() => router.push('/register')} style={styles.btn}>Register</Button>
        </>
      )}
      
      {(name === 'Login' || name === 'Register') && (
        <Button mode="contained" onPress={() => router.replace('/(tabs)/dashboard')} style={styles.btn}>Go to App</Button>
      )}
      
      {(name !== 'Index' && name !== 'Dashboard' && name !== 'Gmail' && name !== 'Calendar' && name !== 'Tasks' && name !== 'Login' && name !== 'Register') && (
        <Button mode="outlined" onPress={() => router.back()} style={styles.btn}>Go Back</Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  btn: { width: '100%', marginVertical: 10 }
});
