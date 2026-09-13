import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { Card, Field, Muted, PrimaryButton, Screen, SecondaryButton, Title } from '@/src/components/ui';
import { api, formatGs, ServiceZoneResponse } from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

export default function EditZoneScreen() {
  const router = useRouter();
  const { colors } = useThemePreference();
  const { id } = useLocalSearchParams<{ id: string }>();
  const zoneId = Number(id);

  const [zone, setZone] = useState<ServiceZoneResponse | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isFinite(zoneId)) {
      return;
    }
    setLoading(true);
    try {
      const data = await api.getZone(zoneId);
      setZone(data);
      setName(data.name);
      setDescription(data.description ?? '');
      setPrice(String(Math.round(Number(data.price))));
      setDuration(String(data.durationMinutes));
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo cargar la zona');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [router, zoneId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!zone) {
      return;
    }
    const priceValue = Number(String(price).replace(/\./g, '').replace(',', '.'));
    const durationValue = Number(duration);
    if (!name.trim()) {
      Alert.alert('Datos incompletos', 'El nombre es obligatorio');
      return;
    }
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      Alert.alert('Precio invalido', 'Ingresa un precio en guaranies (ej. 120000)');
      return;
    }
    if (!Number.isFinite(durationValue) || durationValue < 1) {
      Alert.alert('Duracion invalida', 'La duracion debe ser al menos 1 minuto');
      return;
    }

    setSaving(true);
    try {
      const updated = await api.updateZone(zone.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        serviceId: zone.serviceId,
        price: priceValue,
        durationMinutes: durationValue,
      });
      setZone(updated);
      Alert.alert('Guardado', 'La zona se actualizo.', [
        { text: 'Seguir editando' },
        { text: 'Volver', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !zone) {
    return (
      <Screen>
        <ActivityIndicator color={colors.tint} />
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Title>Editar zona</Title>
          <Muted>
            {zone.serviceName} · este precio se usa cuando elegis la zona al crear una reserva.
          </Muted>

          <Card>
            <Field label="Nombre de la zona" value={name} onChangeText={setName} placeholder="Piernas" />
            <Field
              label="Descripcion (opcional)"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <Field
              label="Precio (Gs.)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="120000"
            />
            <Field
              label="Duracion (minutos)"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="45"
            />
            <Muted>
              Vista previa: {formatGs(Number(price) || 0)} · {Number(duration) || 0} min
            </Muted>
          </Card>

          <PrimaryButton label={saving ? 'Guardando...' : 'Guardar zona'} onPress={save} disabled={saving} />
          <SecondaryButton label="Cancelar" onPress={() => router.back()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 40,
  },
});
