import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, Card, Muted, PrimaryButton, Screen, Title } from '@/src/components/ui';
import { api, formatGs, TreatmentPackageResponse } from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

export default function PackageDetailScreen() {
  const router = useRouter();
  const { colors } = useThemePreference();
  const { id } = useLocalSearchParams<{ id: string }>();
  const packageId = Number(id);
  const [pack, setPack] = useState<TreatmentPackageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isFinite(packageId)) {
      return;
    }
    setLoading(true);
    try {
      setPack(await api.getTreatmentPackage(packageId));
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo cargar');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [packageId, router]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const completeSession = async (sessionId: number) => {
    setUpdating(true);
    try {
      await api.completeTreatmentSession(sessionId);
      await load();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo completar');
    } finally {
      setUpdating(false);
    }
  };

  const cancelSession = async (sessionId: number) => {
    setUpdating(true);
    try {
      await api.cancelTreatmentSession(sessionId);
      await load();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo cancelar');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !pack) {
    return (
      <Screen>
        <ActivityIndicator color={colors.tint} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title>{pack.name}</Title>
      <Badge label={pack.status} tone={pack.status === 'ACTIVO' ? 'success' : 'danger'} />
      <Card>
        <Muted>Paciente: {pack.patientName}</Muted>
        <Muted>Servicio: {pack.serviceName || '-'}</Muted>
        <Muted>
          Sesiones: {pack.completedSessions}/{pack.totalSessions} · Restantes {pack.remainingSessions}
        </Muted>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{formatGs(pack.totalPrice)}</Text>
      </Card>

      {pack.sessions.map((session) => (
        <Card key={session.id}>
          <View style={styles.row}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>Sesion {session.sessionNumber}</Text>
            <Badge
              label={session.sessionStatus}
              tone={
                session.sessionStatus === 'REALIZADA'
                  ? 'success'
                  : session.sessionStatus === 'CANCELADA'
                    ? 'danger'
                    : 'default'
              }
            />
          </View>
          {session.performedAt ? <Muted>Realizada: {session.performedAt}</Muted> : null}
          {session.appointmentId ? <Muted>Cita #{session.appointmentId}</Muted> : null}
          {session.sessionStatus === 'PENDIENTE' ? (
            <View style={styles.actions}>
              <Pressable
                disabled={updating}
                onPress={() => completeSession(session.id)}
                style={[styles.action, { backgroundColor: colors.tint }]}>
                <Text style={styles.actionText}>Marcar realizada</Text>
              </Pressable>
              <Pressable
                disabled={updating}
                onPress={() => cancelSession(session.id)}
                style={[styles.action, { backgroundColor: colors.danger }]}>
                <Text style={styles.actionText}>Cancelar</Text>
              </Pressable>
            </View>
          ) : null}
        </Card>
      ))}

      {pack.status === 'ACTIVO' ? (
        <PrimaryButton
          label="Desactivar paquete"
          onPress={async () => {
            try {
              setPack(await api.deactivateTreatmentPackage(pack.id));
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo desactivar');
            }
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  action: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
