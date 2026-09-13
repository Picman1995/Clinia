import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, Card, Field, Muted, PrimaryButton, Screen, Title } from '@/src/components/ui';
import {
  api,
  AppointmentResponse,
  AppointmentStatus,
  formatGs,
  formatTime,
  PaymentResponse,
  PaymentType,
} from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

const STATUS_OPTIONS: AppointmentStatus[] = [
  'PENDIENTE',
  'CONFIRMADA',
  'ATENDIDA',
  'CANCELADA',
  'NO_ASISTIO',
];

const PAYMENT_TYPES: PaymentType[] = ['PARCIAL', 'FINAL', 'OTRO'];

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const { colors } = useThemePreference();
  const { id } = useLocalSearchParams<{ id: string }>();
  const appointmentId = Number(id);
  const [appointment, setAppointment] = useState<AppointmentResponse | null>(null);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('PARCIAL');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isFinite(appointmentId)) {
      return;
    }
    setLoading(true);
    try {
      const [appointmentData, paymentData] = await Promise.all([
        api.getAppointment(appointmentId),
        api.listPayments({ appointmentId }),
      ]);
      setAppointment(appointmentData);
      setPayments(paymentData);
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

  const registerPayment = async () => {
    if (!appointment) {
      return;
    }
    const value = Number(amount);
    if (Number.isNaN(value) || value <= 0) {
      Alert.alert('Monto invalido', 'Ingresa un monto mayor a 0');
      return;
    }
    if (value > Number(appointment.balanceAmount)) {
      Alert.alert('Monto invalido', 'El pago no puede superar el saldo');
      return;
    }

    setUpdating(true);
    try {
      await api.createPayment({
        appointmentId: appointment.id,
        amount: value,
        paymentType,
      });
      setAmount('');
      await load();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo registrar el pago');
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
        {appointment.promotionNameSnapshot ? (
          <Muted>Promo: {appointment.promotionNameSnapshot}</Muted>
        ) : null}
        <Muted>Subtotal: {formatGs(appointment.subtotal)}</Muted>
        <Muted>Descuento: {formatGs(appointment.discountAmount)}</Muted>
        <Text style={{ color: colors.text, fontWeight: '700' }}>
          Total {formatGs(appointment.totalAmount)} · Pagado {formatGs(appointment.paidAmount)} · Saldo{' '}
          {formatGs(appointment.balanceAmount)}
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

      <Text style={[styles.section, { color: colors.text }]}>Pagos</Text>
      <Card>
        {payments.length === 0 ? (
          <Muted>Sin pagos registrados</Muted>
        ) : (
          payments.map((payment) => (
            <View key={payment.id} style={styles.itemRow}>
              <Text style={{ color: colors.text, flex: 1 }}>
                {payment.paymentType} · {formatTime(payment.paidAt)}
              </Text>
              <Text style={{ color: colors.tint, fontWeight: '700' }}>{formatGs(payment.amount)}</Text>
            </View>
          ))
        )}
      </Card>

      {Number(appointment.balanceAmount) > 0 && appointment.appointmentStatus !== 'CANCELADA' ? (
        <Card>
          <Field
            label="Nuevo pago (Gs.)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <View style={styles.wrap}>
            {PAYMENT_TYPES.map((type) => {
              const selected = paymentType === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => setPaymentType(type)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.tint : colors.background,
                      borderColor: colors.border,
                    },
                  ]}>
                  <Text style={{ color: selected ? '#FFFFFF' : colors.text, fontWeight: '700' }}>
                    {type}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <PrimaryButton
            label={updating ? 'Registrando...' : 'Registrar pago'}
            onPress={registerPayment}
            disabled={updating}
          />
        </Card>
      ) : null}

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
