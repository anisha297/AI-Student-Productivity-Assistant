import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT } from '../constants/theme';

/**
 * SectionHeader — titled section row with optional "See all" link
 *
 * @param {string}   title   - Section heading
 * @param {function} onPress - Called when "See all" is tapped (omit to hide)
 */
export default function SectionHeader({ title, onPress }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {onPress && (
        <TouchableOpacity onPress={onPress} style={styles.link} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.linkText}>See all</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT.lg,
    fontWeight: '700',
    color: '#0F172A',
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: FONT.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
