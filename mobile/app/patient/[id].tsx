import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge, Card, Muted, PrimaryButton, Screen, Title } from '@/src/components/ui';
import {
  api,
  formatGs,
  formatTime,
  PatientHistoryResponse,
  PatientResponse,
} from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

export default function PatientDetailScreen() {
  const router = useRouter();
  const { colors } = useThemePreference();
  const { id } = useLocalSearchParams<{ id: string }>();
  const patientId = Number(id);
  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [history, setHistory] = useState<PatientHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!Number.isFinite(patientId)) {
      return;
    }
    setLoading(true);
    try {
      const [patientData, historyData] = await Promise.all([
        api.getPatient(patientId),
        api.getPatientHistory(patientId),
      ]);
      setPatient(patientData);
      setHistory(historyData);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo cargar');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const toggleStatus = async () => {
    if (!patient) {
      return;
    }
    try {
      const updated =
        patient.status === 'ACTIVO'
          ? await api.deactivatePatient(patient.id)
          : await api.activatePatient(patient.id);
      setPatient(updated);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo actualizar');
    }
  };

  if (loading || !patient) {
    return (
      <Screen>
        <ActivityIndicator color={colors.tint} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Title>
            {patient.firstName} {patient.lastName}
          </Title>
          <Badge label={patient.status} tone={patient.status === 'ACTIVO' ? 'success' : 'danger'} />
        </View>

        <Card>
          <Muted>CI: {patient.documentNumber}</Muted>
          <Muted>Telefono: {patient.phone || '-'}</Muted>
          <Muted>Email: {patient.email || '-'}</Muted>
          <Muted>Nacimiento: {patient.birthDate || '-'}</Muted>
          <Muted>Direccion: {patient.address || '-'}</Muted>
          <Muted>Observaciones: {patient.notes || '-'}</Muted>
        </Card>

        <PrimaryButton label="Editar" onPress={() => router.push(`/patient/edit?id=${patient.id}`)} />
        <PrimaryButton
          label={patient.status === 'ACTIVO' ? 'Desactivar' : 'Activar'}
          onPress={toggleStatus}
        />

        <View style={styles.sectionHeader}>
          <Text style={[styles.section, { color: colors.text }]}>Paquetes / sesiones</Text>
          <Pressable onPress={() => router.push(`/package/new?patientId=${patient.id}`)}>
            <Text style={{ color: colors.tint, fontWeight: '700' }}>Nuevo</Text>
          </Pressable>
        </View>

        {history?.packages.length ? (
          history.packages.map((pack) => (
            <Pressable key={pack.id} onPress={() => router.push(`/package/${pack.id}`)}>
              <Card>
                <View style={styles.row}>
                  <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>{pack.name}</Text>
                  <Badge
                    label={`${pack.completedSessions}/${pack.totalSessions}`}
                    tone={pack.remainingSessions > 0 ? 'default' : 'success'}
                  />
                </View>
                <Muted>
                  Restantes {pack.remainingSessions} · {formatGs(pack.totalPrice)}
                </Muted>
              </Card>
            </Pressable>
          ))
        ) : (
          <Muted>Sin paquetes contratados</Muted>
        )}

        <Text style={[styles.section, { color: colors.text }]}>Proximas citas</Text>
        {history?.upcomingAppointments.length ? (
          history.upcomingAppointments.map((item) => (
            <Pressable key={item.id} onPress={() => router.push(`/appointment/${item.id}`)}>
              <Card>
                <Muted>
                  {formatTime(item.startAt)} · {item.appointmentStatus}
                </Muted>
                <Text style={{ color: colors.text }}>
                  {item.items.map((entry) => entry.nameSnapshot).join(' + ')}
                </Text>
              </Card>
            </Pressable>
          ))
        ) : (
          <Muted>Sin citas futuras</Muted>
        )}

        <Text style={[styles.section, { color: colors.text }]}>Historial reciente</Text>
        {history?.recentAppointments.length ? (
          history.recentAppointments.map((item) => (
            <Card key={item.id}>
              <Muted>
                {formatTime(item.startAt)} · {item.appointmentStatus}
              </Muted>
              <Text style={{ color: colors.text }}>
                {item.items.map((entry) => entry.nameSnapshot).join(' + ')}
              </Text>
              <Muted>
                Total {formatGs(item.totalAmount)} · Saldo {formatGs(item.balanceAmount)}
              </Muted>
            </Card>
          ))
        ) : (
          <Muted>Sin atenciones previas</Muted>
        )}

        <Text style={[styles.section, { color: colors.text }]}>Pagos recientes</Text>
        {history?.recentPayments.length ? (
          history.recentPayments.map((payment) => (
            <Card key={payment.id}>
              <Muted>
                {payment.paymentType} · {formatTime(payment.paidAt)}
              </Muted>
              <Text style={{ color: colors.tint, fontWeight: '700' }}>{formatGs(payment.amount)}</Text>
            </Card>
          ))
        ) : (
          <Muted>Sin pagos registrados</Muted>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 10,
    paddingBottom: 40,
  },
  header: {
    gap: 8,
  },
  section: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  sectionHeader: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
