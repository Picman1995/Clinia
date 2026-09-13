import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Badge, Card, Muted, PrimaryButton, Screen, Title } from '@/src/components/ui';
import {
  addDays,
  api,
  AppointmentResponse,
  dayRange,
  formatGs,
  formatTime,
  todayPy,
} from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

export default function AgendaScreen() {
  const router = useRouter();
  const { colors } = useThemePreference();
  const [date, setDate] = useState(todayPy());
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (selectedDate: string) => {
    setError(null);
    setLoading(true);
    try {
      const range = dayRange(selectedDate);
      const data = await api.listAppointments(range.from, range.to);
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la agenda');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(date);
    }, [date, load])
  );

  return (
    <Screen>
      <Title>Agenda</Title>
      <Muted>Citas del dia seleccionado</Muted>

      <View style={styles.dateRow}>
        <Pressable
          onPress={() => setDate((current) => addDays(current, -1))}
          style={[styles.dateButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{'<'}</Text>
        </Pressable>
        <Text style={[styles.dateLabel, { color: colors.text }]}>{date}</Text>
        <Pressable
          onPress={() => setDate((current) => addDays(current, 1))}
          style={[styles.dateButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{'>'}</Text>
        </Pressable>
      </View>

      <PrimaryButton label="Nueva reserva" onPress={() => router.push('/appointment/new')} />

      {loading ? (
        <ActivityIndicator color={colors.tint} />
      ) : error ? (
        <Muted>{error}</Muted>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ gap: 10, paddingBottom: 30 }}
          ListEmptyComponent={<Muted>No hay citas para este dia</Muted>}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/appointment/${item.id}`)}>
              <Card>
                <View style={styles.row}>
                  <Text style={[styles.time, { color: colors.tint }]}>
                    {formatTime(item.startAt)} - {formatTime(item.endAt)}
                  </Text>
                  <Badge label={item.appointmentStatus} />
                </View>
                <Text style={[styles.patient, { color: colors.text }]}>{item.patientName}</Text>
                <Muted>
                  {item.items.map((entry) => entry.nameSnapshot).join(' + ') || 'Sin servicios'}
                </Muted>
                <Muted>
                  {item.durationMinutes} min · {formatGs(item.totalAmount)} · saldo{' '}
                  {formatGs(item.balanceAmount)}
                </Muted>
              </Card>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  time: {
    fontSize: 15,
    fontWeight: '700',
  },
  patient: {
    fontSize: 17,
    fontWeight: '700',
  },
});
