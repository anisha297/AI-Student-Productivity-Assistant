import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Avatar, ProgressBar, List, IconButton, useTheme, Surface } from 'react-native-paper';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const theme = useTheme();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text variant="titleMedium">Good Morning, Alex!</Text>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Your AI Briefing is ready</Text>
        </View>
        <Avatar.Image size={50} source={{ uri: 'https://i.pravatar.cc/150?img=11' }} />
      </View>

      <Card style={styles.card} onPress={() => router.push('/ai-briefing')}>
        <Card.Title
          title="AI Daily Briefing"
          subtitle="You have a busy day ahead."
          left={(props) => <Avatar.Icon {...props} icon="robot-outline" style={{backgroundColor: theme.colors.primary}}/>}
          right={(props) => <IconButton {...props} icon="chevron-right" />}
        />
        <Card.Content>
          <Text variant="bodyMedium">
            Focus on your "Data Structures Assignment" due today at 11:59 PM. 
            You also have a study group meeting at 3:00 PM.
          </Text>
        </Card.Content>
      </Card>

      <Surface style={styles.scoreContainer} elevation={1}>
        <View style={styles.scoreText}>
          <Text variant="titleMedium">Productivity Score</Text>
          <Text variant="headlineMedium" style={{color: theme.colors.primary, fontWeight: 'bold'}}>85</Text>
        </View>
        <ProgressBar progress={0.85} color={theme.colors.primary} style={styles.progressBar} />
        <Text variant="bodySmall" style={{marginTop: 5, alignSelf: 'flex-end'}}>Top 15% of students</Text>
      </Surface>

      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Important Emails</Text>
        <IconButton icon="arrow-right" size={20} onPress={() => router.push('/(tabs)/gmail')} />
      </View>
      <Card style={styles.card} onPress={() => router.push('/email-details')}>
        <List.Item
          title="Prof. Smith"
          description="Update on Final Project Guidelines..."
          left={props => <List.Icon {...props} icon="email-alert" color={theme.colors.error} />}
        />
      </Card>
      <Card style={styles.card} onPress={() => router.push('/email-details')}>
        <List.Item
          title="Career Services"
          description="Upcoming Resume Review Session"
          left={props => <List.Icon {...props} icon="email" />}
        />
      </Card>

      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Assignments Due</Text>
        <IconButton icon="arrow-right" size={20} onPress={() => router.push('/classroom')} />
      </View>
      <Card style={styles.card}>
        <List.Item
          title="Data Structures - Graph Traversal"
          description="Due Today, 11:59 PM"
          left={props => <List.Icon {...props} icon="book-open-variant" color={theme.colors.secondary} />}
          right={props => <Text {...props} style={{alignSelf: 'center', color: theme.colors.error, fontWeight: 'bold'}}>High</Text>}
        />
      </Card>

      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Today's Events</Text>
        <IconButton icon="arrow-right" size={20} onPress={() => router.push('/(tabs)/calendar')} />
      </View>
      <Card style={styles.card}>
        <List.Item
          title="CS Study Group"
          description="3:00 PM - 5:00 PM • Library Room 2A"
          left={props => <List.Icon {...props} icon="calendar-clock" color={theme.colors.tertiary} />}
        />
      </Card>

      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Pending Tasks</Text>
        <IconButton icon="arrow-right" size={20} onPress={() => router.push('/(tabs)/tasks')} />
      </View>
      <Card style={[styles.card, { marginBottom: 40 }]}>
        <List.Item
          title="Review notes for Calculus quiz"
          left={props => <List.Icon {...props} icon="checkbox-blank-outline" />}
        />
        <List.Item
          title="Buy groceries"
          left={props => <List.Icon {...props} icon="checkbox-blank-outline" />}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  card: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  scoreContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  scoreText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
  }
});
