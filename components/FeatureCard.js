import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RADIUS, SPACING, FONT } from '../constants/theme';

/**
 * FeatureCard — used on the Welcome screen grid
 *
 * @param {string} icon        - MaterialCommunityIcons name
 * @param {string} title       - Feature name
 * @param {string} description - Short one-liner
 * @param {string} color       - Accent colour for icon tint
 */
export default function FeatureCard({ icon, title, description, color }) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: color + '25' }]}>
        <MaterialCommunityIcons name={icon} size={26} color={color} />
      </View>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      <Text style={styles.desc}  numberOfLines={2}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    margin: SPACING.xs,
    minHeight: 128,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    color: '#FFFFFF',
    fontSize: FONT.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  desc: {
    color: '#94A3B8',
    fontSize: FONT.sm,
    lineHeight: 18,
  },
});
