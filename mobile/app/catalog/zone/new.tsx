import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { Card, Field, Muted, PrimaryButton, Screen, SecondaryButton, Title } from '@/src/components/ui';
import { api, formatGs } from '@/src/services/api';

export default function NewZoneScreen() {
  const router = useRouter();
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const parsedServiceId = Number(serviceId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('30');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!Number.isFinite(parsedServiceId)) {
      Alert.alert('Error', 'Servicio invalido');
      return;
    }
    const priceValue = Number(String(price).replace(/\./g, '').replace(',', '.'));
    const durationValue = Number(duration);
    if (!name.trim()) {
      Alert.alert('Datos incompletos', 'El nombre es obligatorio');
      return;
    }
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      Alert.alert('Precio invalido', 'Ingresa un precio en guaranies');
      return;
    }
    if (!Number.isFinite(durationValue) || durationValue < 1) {
      Alert.alert('Duracion invalida', 'La duracion debe ser al menos 1 minuto');
      return;
    }

    setSaving(true);
    try {
      await api.createZone({
        name: name.trim(),
        description: description.trim() || undefined,
        serviceId: parsedServiceId,
        price: priceValue,
        durationMinutes: durationValue,
      });
      Alert.alert('Zona creada', `${name.trim()} · ${formatGs(priceValue)}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo crear la zona');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Title>Nueva zona</Title>
          <Muted>Se asociara al servicio actual y aparecera al agendar citas.</Muted>

          <Card>
            <Field label="Nombre" value={name} onChangeText={setName} placeholder="Axilas" />
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
              placeholder="50000"
            />
            <Field
              label="Duracion (minutos)"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
            <Muted>
              Vista previa: {formatGs(Number(price) || 0)} · {Number(duration) || 0} min
            </Muted>
          </Card>

          <PrimaryButton label={saving ? 'Guardando...' : 'Crear zona'} onPress={save} disabled={saving} />
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
