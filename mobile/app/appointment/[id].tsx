import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, Card, Muted, Screen, Title } from '@/src/components/ui';
import {
  api,
  AppointmentResponse,
  AppointmentStatus,
  formatGs,
  formatTime,
} from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

const STATUS_OPTIONS: AppointmentStatus[] = [
  'PENDIENTE',
  'CONFIRMADA',
  'ATENDIDA',
  'CANCELADA',
  'NO_ASISTIO',
];

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const { colors } = useThemePreference();
  const { id } = useLocalSearchParams<{ id: string }>();
  const appointmentId = Number(id);
  const [appointment, setAppointment] = useState<AppointmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isFinite(appointmentId)) {
      return;
    }
    setLoading(true);
    try {
      setAppointment(await api.getAppointment(appointmentId));
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo cargar la cita');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [appointmentId, router]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const changeStatus = async (appointmentStatus: AppointmentStatus) => {
    if (!appointment || appointment.appointmentStatus === appointmentStatus || updating) {
      return;
    }
    setUpdating(true);
    try {
      setAppointment(await api.updateAppointmentStatus(appointment.id, appointmentStatus));
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !appointment) {
    return (
      <Screen>
        <ActivityIndicator color={colors.tint} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Title>{appointment.patientName}</Title>
        <Badge label={appointment.appointmentStatus} />
      </View>

      <Card>
        <Muted>
          {formatTime(appointment.startAt)} - {formatTime(appointment.endAt)} · {appointment.durationMinutes} min
        </Muted>
        <Muted>Profesional: {appointment.professionalName}</Muted>
        <Muted>CI: {appointment.patientDocument}</Muted>
        <Muted>Pago: {appointment.paymentStatus}</Muted>
        <Text style={{ color: colors.text, fontWeight: '700' }}>
          Total {formatGs(appointment.totalAmount)} · Saldo {formatGs(appointment.balanceAmount)}
        </Text>
        {appointment.notes ? <Muted>Obs: {appointment.notes}</Muted> : null}
      </Card>

      <Card>
        {appointment.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={{ color: colors.text, flex: 1 }}>{item.nameSnapshot}</Text>
            <Text style={{ color: colors.tint, fontWeight: '700' }}>
              {formatGs(item.lineTotalSnapshot)}
            </Text>
          </View>
        ))}
      </Card>

      <Text style={[styles.section, { color: colors.text }]}>Cambiar estado</Text>
      <View style={styles.wrap}>
        {STATUS_OPTIONS.map((status) => {
          const selected = appointment.appointmentStatus === status;
          return (
            <Pressable
              key={status}
              disabled={updating}
              onPress={() => changeStatus(status)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? colors.tint : colors.card,
                  borderColor: colors.border,
                  opacity: updating ? 0.6 : 1,
                },
              ]}>
              <Text style={{ color: selected ? '#FFFFFF' : colors.text, fontWeight: '700' }}>
                {status}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  section: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
