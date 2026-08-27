import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, FONT } from '../constants/theme';

/**
 * AppButton — shared button component
 *
 * @param {string}   label    - Button text
 * @param {function} onPress  - Press handler
 * @param {'primary'|'outlined'|'google'} variant
 * @param {boolean}  loading  - Shows spinner, disables press
 * @param {boolean}  disabled - Greyed out, disables press
 * @param {object}   style    - Extra style overrides
 */
export default function AppButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) {
  const isOutlined = variant === 'outlined';
  const isGoogle   = variant === 'google';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        isOutlined && styles.outlined,
        isGoogle   && styles.google,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator
          color={isOutlined ? COLORS.primary : COLORS.white}
          size="small"
        />
      ) : (
        <View style={styles.inner}>
          {isGoogle && (
            <MaterialCommunityIcons
              name="google"
              size={18}
              color={COLORS.dark}
              style={{ marginRight: SPACING.sm }}
            />
          )}
          <Text
            style={[
              styles.label,
              isOutlined && styles.labelOutlined,
              isGoogle   && styles.labelGoogle,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xs,
    minHeight: 50,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  google: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  disabled: {
    opacity: 0.5,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: COLORS.white,
    fontSize: FONT.base,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  labelOutlined: {
    color: COLORS.primary,
  },
  labelGoogle: {
    color: COLORS.dark,
  },
});
