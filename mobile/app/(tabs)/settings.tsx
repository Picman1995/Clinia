import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemePreference, useThemePreference } from '@/src/theme/ThemeContext';

const OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: 'Sistema', value: 'system' },
  { label: 'Claro', value: 'light' },
  { label: 'Oscuro', value: 'dark' },
];

export default function SettingsScreen() {
  const { colors, preference, setPreference } = useThemePreference();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Configuracion</Text>
      <Text style={{ color: colors.textMuted }}>Tema de la aplicacion</Text>

      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const selected = preference === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setPreference(option.value)}
              style={[
                styles.option,
                {
                  backgroundColor: selected ? colors.tint : colors.card,
                  borderColor: colors.border,
                },
              ]}>
              <Text style={{ color: selected ? '#FFFFFF' : colors.text, fontWeight: '600' }}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  option: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
});
