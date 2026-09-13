import { StyleSheet, Text, View } from 'react-native';

import { useThemePreference } from '@/src/theme/ThemeContext';

export default function AgendaScreen() {
  const { colors } = useThemePreference();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Agenda</Text>
      <Text style={{ color: colors.textMuted }}>
        El modulo de agenda y reservas se implementa en la Fase 3.
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
