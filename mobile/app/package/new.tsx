import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, Field, Muted, PrimaryButton, Screen, Title } from '@/src/components/ui';
import { api, formatGs, ServiceResponse } from '@/src/services/api';
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

  const selectService = (service: ServiceResponse) => {
    const selected = serviceId === service.id;
    if (selected) {
      setServiceId(null);
      return;
    }
    setServiceId(service.id);
    if (!name.trim()) {
      setName(`Pack ${service.name}`);
    }
    if (!totalPrice.trim()) {
      setTotalPrice(String(Math.round(Number(service.price) * Number(totalSessions || '6'))));
    }
  };

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
        <Muted>
          Esto contrata un pack de sesiones para el paciente (ej. 6 depilaciones). No es solo mirar el
          catalogo: completa los datos y toca Crear paquete abajo.
        </Muted>

        <Field label="Nombre del paquete" value={name} onChangeText={setName} placeholder="Depilacion piernas x6" />
        <Field
          label="Cantidad de sesiones"
          value={totalSessions}
          onChangeText={setTotalSessions}
          keyboardType="numeric"
        />
        <Field
          label="Precio total del pack (Gs.)"
          value={totalPrice}
          onChangeText={setTotalPrice}
          keyboardType="numeric"
        />
        <Field label="Observaciones" value={notes} onChangeText={setNotes} multiline />

        <Text style={[styles.section, { color: colors.text }]}>Servicio de referencia (opcional)</Text>
        <Muted>Solo etiqueta el pack; no agenda una cita. Podes dejarlo sin elegir.</Muted>
        <View style={styles.wrap}>
          {services.map((service) => {
            const selected = serviceId === service.id;
            return (
              <Pressable
                key={service.id}
                onPress={() => selectService(service)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? colors.tint : colors.card,
                    borderColor: colors.border,
                  },
                ]}>
                <Text style={{ color: selected ? '#FFFFFF' : colors.text, fontWeight: '600' }}>
                  {service.name}
                </Text>
                <Text style={{ color: selected ? '#FFFFFF' : colors.textMuted, fontSize: 12 }}>
                  {formatGs(service.price)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Card>
          <Muted>
            {serviceId
              ? 'Servicio marcado. Ahora toca Crear paquete para guardar.'
              : 'Sin servicio asociado. Igual podes crear el paquete con nombre, sesiones y precio.'}
          </Muted>
        </Card>

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
  section: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: '46%',
    gap: 2,
  },
});
