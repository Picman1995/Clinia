import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';

import { Field, Muted, PrimaryButton, Screen, Title } from '@/src/components/ui';
import { api, ServiceResponse } from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

export default function NewPackageScreen() {
  const router = useRouter();
  const { colors } = useThemePreference();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const parsedPatientId = Number(patientId);

  const [name, setName] = useState('');
  const [totalSessions, setTotalSessions] = useState('6');
  const [totalPrice, setTotalPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .searchServices({ status: 'ACTIVO' })
      .then(setServices)
      .catch((err) => Alert.alert('Error', err.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!Number.isFinite(parsedPatientId)) {
      Alert.alert('Error', 'Paciente invalido');
      return;
    }
    const sessions = Number(totalSessions);
    const price = Number(totalPrice);
    if (!name.trim()) {
      Alert.alert('Datos incompletos', 'El nombre es obligatorio');
      return;
    }
    if (!Number.isFinite(sessions) || sessions < 1) {
      Alert.alert('Datos invalidos', 'La cantidad de sesiones debe ser al menos 1');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      Alert.alert('Datos invalidos', 'El precio debe ser un numero valido');
      return;
    }

    setSaving(true);
    try {
      const created = await api.createTreatmentPackage({
        patientId: parsedPatientId,
        serviceId: serviceId ?? undefined,
        name: name.trim(),
        totalSessions: sessions,
        totalPrice: price,
        notes: notes.trim() || undefined,
      });
      router.replace(`/package/${created.id}`);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo crear el paquete');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.tint} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Title>Nuevo paquete</Title>
        <Muted>Define sesiones contratadas y precio total</Muted>

        <Field label="Nombre" value={name} onChangeText={setName} placeholder="Depilacion piernas" />
        <Field
          label="Sesiones"
          value={totalSessions}
          onChangeText={setTotalSessions}
          keyboardType="numeric"
        />
        <Field
          label="Precio total (Gs.)"
          value={totalPrice}
          onChangeText={setTotalPrice}
          keyboardType="numeric"
        />
        <Field label="Observaciones" value={notes} onChangeText={setNotes} multiline />

        <Muted>Servicio asociado (opcional)</Muted>
        {services.map((service) => {
          const selected = serviceId === service.id;
          return (
            <PrimaryButton
              key={service.id}
              label={`${selected ? '✓ ' : ''}${service.name}`}
              onPress={() => setServiceId(selected ? null : service.id)}
            />
          );
        })}

        <PrimaryButton label={saving ? 'Guardando...' : 'Crear paquete'} onPress={save} disabled={saving} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 10,
    paddingBottom: 40,
  },
});
