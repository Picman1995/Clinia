import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Muted, Screen, Title } from '@/src/components/ui';
import { useThemePreference } from '@/src/theme/ThemeContext';

export default function NotFoundScreen() {
  const { colors } = useThemePreference();

  return (
    <>
      <Stack.Screen options={{ title: 'No encontrado' }} />
      <Screen style={styles.container}>
        <Title>Pantalla no encontrada</Title>
        <Muted>Esta ruta no existe en Clinia</Muted>
        <Link href="/" style={[styles.link, { color: colors.tint }]}>
          Volver al inicio
        </Link>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '700',
  },
});
