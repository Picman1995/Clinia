import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Field, Muted, PrimaryButton, Screen, Title } from '@/src/components/ui';
import { api, ServiceZoneResponse, todayPy } from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

export default function NewPromotionScreen() {
  const router = useRouter();
  const { colors } = useThemePreference();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [normalPrice, setNormalPrice] = useState('');
  const [promotionalPrice, setPromotionalPrice] = useState('');
  const [startDate, setStartDate] = useState(todayPy());
  const [endDate, setEndDate] = useState('');
  const [zones, setZones] = useState<ServiceZoneResponse[]>([]);
  const [selectedZoneIds, setSelectedZoneIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .searchZones(undefined, 'ACTIVO')
      .then(setZones)
      .catch((err) => Alert.alert('Error', err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleZone = (id: number) => {
    setSelectedZoneIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const save = async () => {
    const normal = Number(normalPrice);
    const promo = Number(promotionalPrice);
    if (!name.trim()) {
      Alert.alert('Datos incompletos', 'El nombre es obligatorio');
      return;
    }
    if (Number.isNaN(normal) || Number.isNaN(promo) || normal < 0 || promo < 0) {
      Alert.alert('Precios invalidos', 'Revisa los montos en guaranies');
      return;
    }
    if (promo > normal) {
      Alert.alert('Precios invalidos', 'El precio promocional no puede superar el normal');
      return;
    }

    setSaving(true);
    try {
      await api.createPromotion({
        name: name.trim(),
        description: description.trim() || undefined,
        normalPrice: normal,
        promotionalPrice: promo,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        items: selectedZoneIds.map((serviceZoneId) => ({ serviceZoneId })),
      });
      router.back();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo guardar');
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
        <Title>Nueva promocion</Title>
        <Muted>Define nombre, precios y zonas incluidas</Muted>

        <Field label="Nombre" value={name} onChangeText={setName} />
        <Field label="Descripcion" value={description} onChangeText={setDescription} multiline />
        <Field
          label="Precio normal (Gs.)"
          value={normalPrice}
          onChangeText={setNormalPrice}
          keyboardType="numeric"
        />
        <Field
          label="Precio promocional (Gs.)"
          value={promotionalPrice}
          onChangeText={setPromotionalPrice}
          keyboardType="numeric"
        />
        <Field label="Inicio (AAAA-MM-DD)" value={startDate} onChangeText={setStartDate} />
        <Field label="Fin (AAAA-MM-DD)" value={endDate} onChangeText={setEndDate} />

        <Text style={[styles.section, { color: colors.text }]}>Zonas incluidas</Text>
        <View style={styles.wrap}>
          {zones.map((zone) => {
            const selected = selectedZoneIds.includes(zone.id);
            return (
              <Pressable
                key={zone.id}
                onPress={() => toggleZone(zone.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? colors.tint : colors.card,
                    borderColor: colors.border,
                  },
                ]}>
                <Text style={{ color: selected ? '#FFFFFF' : colors.text, fontWeight: '600' }}>
                  {zone.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <PrimaryButton label={saving ? 'Guardando...' : 'Guardar'} onPress={save} disabled={saving} />
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
