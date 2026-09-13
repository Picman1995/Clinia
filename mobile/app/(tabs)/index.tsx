import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { api, HealthResponse, ProfessionalResponse } from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

export default function DashboardScreen() {
  const { colors } = useThemePreference();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [professional, setProfessional] = useState<ProfessionalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.health(), api.defaultProfessional()])
      .then(([healthData, professionalData]) => {
        setHealth(healthData);
        setProfessional(professionalData);
      })
      .catch(() => setError('No se pudo conectar con la API. Verifica que el backend este en marcha.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.brand, { color: colors.tint }]}>Clinia</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Gestion de pacientes, agenda y finanzas
      </Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Estado del sistema</Text>
        {loading ? (
          <ActivityIndicator color={colors.tint} />
        ) : error ? (
          <Text style={{ color: colors.danger }}>{error}</Text>
        ) : (
          <>
            <Text style={{ color: colors.success }}>API: {health?.status}</Text>
            <Text style={{ color: colors.textMuted }}>App: {health?.application}</Text>
            <Text style={{ color: colors.textMuted }}>Zona: {health?.timezone}</Text>
            <Text style={{ color: colors.textMuted }}>URL: {api.getBaseUrl()}</Text>
          </>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Profesional por defecto</Text>
        {professional ? (
          <>
            <Text style={[styles.professionalName, { color: colors.text }]}>
              {professional.firstName} {professional.lastName}
            </Text>
            <Text style={{ color: colors.textMuted }}>{professional.specialty}</Text>
            <Text style={{ color: colors.textMuted }}>CI: {professional.documentNumber}</Text>
          </>
        ) : (
          <Text style={{ color: colors.textMuted }}>Sin datos</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  brand: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  professionalName: {
    fontSize: 18,
    fontWeight: '600',
  },
});
