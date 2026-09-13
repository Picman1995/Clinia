import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, Muted, Screen } from '@/src/components/ui';
import { api, DashboardResponse, formatGs, todayPy } from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useThemePreference();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setDashboard(await api.getDashboard(todayPy()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              setLoading(true);
              load();
            }}
          />
        }>
        <Text style={[styles.brand, { color: colors.tint }]}>Clinia</Text>
        <Muted>Resumen del dia {dashboard?.date || todayPy()}</Muted>

        {loading && !dashboard ? (
          <ActivityIndicator color={colors.tint} />
        ) : error ? (
          <Muted>{error}</Muted>
        ) : dashboard ? (
          <>
            <View style={styles.grid}>
              <View style={styles.half}>
                <Card>
                  <Muted>Citas hoy</Muted>
                  <Text style={[styles.metric, { color: colors.text }]}>{dashboard.appointmentsToday}</Text>
                </Card>
              </View>
              <View style={styles.half}>
                <Card>
                  <Muted>Pacientes hoy</Muted>
                  <Text style={[styles.metric, { color: colors.text }]}>{dashboard.patientsToday}</Text>
                </Card>
              </View>
            </View>

            <View style={styles.grid}>
              <View style={styles.half}>
                <Card>
                  <Muted>Servicios atendidos</Muted>
                  <Text style={[styles.metric, { color: colors.text }]}>{dashboard.servicesToday}</Text>
                </Card>
              </View>
              <View style={styles.half}>
                <Card>
                  <Muted>Ingresos del dia</Muted>
                  <Text style={[styles.money, { color: colors.tint }]}>
                    {formatGs(dashboard.incomeToday)}
                  </Text>
                </Card>
              </View>
            </View>

            <Card>
              <Muted>Senas cobradas hoy</Muted>
              <Text style={[styles.money, { color: colors.text }]}>
                {formatGs(dashboard.depositsToday)}
              </Text>
              <Muted>Saldos pendientes: {formatGs(dashboard.pendingBalances)}</Muted>
              <Muted>Citas con saldo/sena pendiente: {dashboard.pendingDepositAppointments}</Muted>
            </Card>

            <Card>
              <Muted>Profesional</Muted>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{dashboard.professionalName}</Text>
            </Card>

            <Pressable
              onPress={() => router.push('/reports')}
              style={[styles.link, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>Ver reportes</Text>
              <Muted>Ingresos, % propietario y filtros por fecha</Muted>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 30,
  },
  brand: {
    fontSize: 34,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
  },
  metric: {
    fontSize: 28,
    fontWeight: '700',
  },
  money: {
    fontSize: 20,
    fontWeight: '700',
  },
  link: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
});
