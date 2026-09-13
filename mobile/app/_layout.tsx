import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { ThemePreferenceProvider, useThemePreference } from '@/src/theme/ThemeContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemePreferenceProvider>
      <RootLayoutNav />
    </ThemePreferenceProvider>
  );
}

function RootLayoutNav() {
  const { colorScheme, colors } = useThemePreference();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="patient/new" options={{ title: 'Nuevo paciente' }} />
        <Stack.Screen name="patient/edit" options={{ title: 'Editar paciente' }} />
        <Stack.Screen name="patient/[id]" options={{ title: 'Detalle' }} />
        <Stack.Screen name="appointment/new" options={{ title: 'Nueva reserva' }} />
        <Stack.Screen name="appointment/[id]" options={{ title: 'Cita' }} />
        <Stack.Screen name="promotion/index" options={{ title: 'Promociones' }} />
        <Stack.Screen name="promotion/new" options={{ title: 'Nueva promocion' }} />
        <Stack.Screen name="promotion/[id]" options={{ title: 'Promocion' }} />
        <Stack.Screen name="catalog/index" options={{ title: 'Editar catalogo' }} />
        <Stack.Screen name="catalog/service/[id]" options={{ title: 'Editar servicio' }} />
        <Stack.Screen name="catalog/zone/[id]" options={{ title: 'Editar zona' }} />
        <Stack.Screen name="catalog/zone/new" options={{ title: 'Nueva zona' }} />
        <Stack.Screen name="package/new" options={{ title: 'Nuevo paquete' }} />
        <Stack.Screen name="package/[id]" options={{ title: 'Paquete' }} />
        <Stack.Screen name="reports" options={{ title: 'Reportes' }} />
        <Stack.Screen name="import-horarios" options={{ title: 'Importar horarios' }} />
      </Stack>
    </ThemeProvider>
  );
}
