import { Pressable, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { useThemePreference } from '@/src/theme/ThemeContext';

export function Screen({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { colors } = useThemePreference();
  return <View style={[styles.screen, { backgroundColor: colors.background }, style]}>{children}</View>;
}

export function Card({ children }: { children: ReactNode }) {
  const { colors } = useThemePreference();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

export function Title({ children }: { children: ReactNode }) {
  const { colors } = useThemePreference();
  return <Text style={[styles.title, { color: colors.text }]}>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
  const { colors } = useThemePreference();
  return <Text style={{ color: colors.textMuted }}>{children}</Text>;
}

export function Badge({ label, tone = 'default' }: { label: string; tone?: 'default' | 'success' | 'danger' }) {
  const { colors } = useThemePreference();
  const background =
    tone === 'success' ? colors.success : tone === 'danger' ? colors.danger : colors.tint;
  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useThemePreference();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor: colors.tint, opacity: disabled ? 0.5 : 1 },
      ]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useThemePreference();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        styles.secondaryButton,
        {
          borderColor: colors.tint,
          opacity: disabled ? 0.5 : 1,
          backgroundColor: colors.card,
        },
      ]}>
      <Text style={[styles.buttonText, { color: colors.tint }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
  multiline?: boolean;
}) {
  const { colors } = useThemePreference();
  return (
    <View style={styles.field}>
      <Text style={{ color: colors.textMuted, marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[
          styles.input,
          multiline ? styles.multiline : null,
          { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButton: {
    borderWidth: 1.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  field: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
});
