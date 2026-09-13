import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Muted, Screen, Title } from '@/src/components/ui';
import { ThemePreference, useThemePreference } from '@/src/theme/ThemeContext';

const OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: 'Sistema', value: 'system' },
  { label: 'Claro', value: 'light' },
  { label: 'Oscuro', value: 'dark' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, preference, setPreference } = useThemePreference();

  return (
    <Screen>
      <Title>Configuracion</Title>
      <Muted>Tema de la aplicacion</Muted>

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

      <Muted>Modulos</Muted>
      <Pressable
        onPress={() => router.push('/promotion')}
        style={[styles.link, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>Promociones</Text>
        <Muted>Gestionar precios especiales</Muted>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  link: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
});
