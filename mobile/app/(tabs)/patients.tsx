import { StyleSheet, Text, View } from 'react-native';

import { useThemePreference } from '@/src/theme/ThemeContext';

export default function PatientsScreen() {
  const { colors } = useThemePreference();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Pacientes</Text>
      <Text style={{ color: colors.textMuted }}>
        El modulo de pacientes se implementa en la Fase 2.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
});
