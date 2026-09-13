import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { Badge, Card, Muted, PrimaryButton, Screen, Title } from '@/src/components/ui';
import { api, PatientResponse } from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

export default function PatientDetailScreen() {
  const router = useRouter();
  const { colors } = useThemePreference();
  const { id } = useLocalSearchParams<{ id: string }>();
  const patientId = Number(id);
  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!Number.isFinite(patientId)) {
      return;
    }
    setLoading(true);
    try {
      setPatient(await api.getPatient(patientId));
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
});
