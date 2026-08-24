const fs = require('fs');
const path = require('path');

const screens = [
  'app/index.js',
  'app/login.js',
  'app/register.js',
  'app/(tabs)/dashboard.js',
  'app/(tabs)/gmail.js',
  'app/(tabs)/calendar.js',
  'app/(tabs)/tasks.js',
  'app/email-details.js',
  'app/classroom.js',
  'app/ai-briefing.js',
  'app/notifications.js',
  'app/analytics.js',
  'app/profile.js',
  'app/settings.js',
];

const template = (name) => `import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';

export default function ${name}Screen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={{marginBottom: 20}}>${name}</Text>
      
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
`;

screens.forEach(file => {
  const filepath = path.join(__dirname, file);
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  const compName = path.basename(file, '.js').split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  fs.writeFileSync(filepath, template(compName));
});

console.log("Scaffolded screens");
