import { useFocusEffect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Badge, Card, Field, Muted, PrimaryButton, Screen, SecondaryButton, Title } from '@/src/components/ui';
import { api, formatGs, ServiceResponse, ServiceZoneResponse } from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

export default function EditServiceScreen() {
  const router = useRouter();
  const { colors } = useThemePreference();
  const { id } = useLocalSearchParams<{ id: string }>();
  const serviceId = Number(id);

  const [service, setService] = useState<ServiceResponse | null>(null);
  const [zones, setZones] = useState<ServiceZoneResponse[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isFinite(serviceId)) {
      return;
    }
    setLoading(true);
    try {
      const [serviceData, zoneData] = await Promise.all([
        api.getService(serviceId),
        api.searchZones(serviceId, 'ACTIVO'),
      ]);
      setService(serviceData);
      setZones(zoneData);
      setName(serviceData.name);
      setDescription(serviceData.description ?? '');
      setPrice(String(Math.round(Number(serviceData.price))));
      setDuration(String(serviceData.durationMinutes));
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo cargar el servicio');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [router, serviceId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const save = async () => {
    if (!service) {
      return;
    }
    const priceValue = Number(price.replace(/\./g, '').replace(',', '.'));
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
      const updated = await api.updateService(service.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        categoryId: service.categoryId,
        durationMinutes: durationValue,
        price: priceValue,
      });
      setService(updated);
      Alert.alert('Guardado', 'El servicio se actualizo. Las citas nuevas usaran estos valores.');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !service) {
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
          <View style={styles.header}>
            <Title>Editar servicio</Title>
            <Badge label={service.categoryType === 'DEPILACION' ? 'Depilacion' : 'Estetica'} />
          </View>
          <Muted>
            {zones.length > 0
              ? 'Si este servicio tiene zonas, al agendar suele usarse el precio de cada zona. El precio base queda como referencia.'
              : 'Este precio y duracion se usan al agendar este servicio.'}
          </Muted>

          <Card>
            <Field label="Nombre" value={name} onChangeText={setName} />
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
              placeholder="30"
            />
            <Muted>Vista previa: {formatGs(Number(price) || 0)} · {Number(duration) || 0} min</Muted>
          </Card>

          <PrimaryButton label={saving ? 'Guardando...' : 'Guardar cambios'} onPress={save} disabled={saving} />

          <View style={styles.sectionHeader}>
            <Text style={[styles.section, { color: colors.text }]}>Zonas</Text>
            <Pressable
              onPress={() =>
                router.push(`/catalog/zone/new?serviceId=${service.id}` as Href)
              }>
              <Text style={{ color: colors.tint, fontWeight: '700' }}>Agregar zona</Text>
            </Pressable>
          </View>
          <Muted>
            {zones.length > 0
              ? 'Toca una zona para cambiar su precio o duracion.'
              : 'Sin zonas todavia. Podes agregar Axilas, Piernas, etc.'}
          </Muted>

          {zones.map((zone) => (
            <Pressable key={zone.id} onPress={() => router.push(`/catalog/zone/${zone.id}` as Href)}>
              <Card>
                <View style={styles.row}>
                  <Text style={[styles.zoneName, { color: colors.text }]}>{zone.name}</Text>
                  <Text style={{ color: colors.tint, fontWeight: '700' }}>{formatGs(zone.price)}</Text>
                </View>
                <Muted>{zone.durationMinutes} min · Editar</Muted>
              </Card>
            </Pressable>
          ))}

          <SecondaryButton label="Volver al catalogo" onPress={() => router.back()} />
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
  header: {
    gap: 8,
  },
  sectionHeader: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: {
    fontSize: 17,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoneName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
});
