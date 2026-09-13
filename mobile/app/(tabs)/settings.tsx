import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Field, Muted, PrimaryButton, Screen, Title } from '@/src/components/ui';
import { api } from '@/src/services/api';
import { getOcrBaseUrl } from '@/src/services/ocr';
import { ThemePreference, useThemePreference } from '@/src/theme/ThemeContext';

const OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: 'Sistema', value: 'system' },
  { label: 'Claro', value: 'light' },
  { label: 'Oscuro', value: 'dark' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, preference, setPreference } = useThemePreference();
  const [ownerPercentage, setOwnerPercentage] = useState('40');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const setting = await api.getSetting('OWNER_COMMISSION_PERCENTAGE');
      setOwnerPercentage(setting.value);
    } catch {
      setOwnerPercentage('40');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const saveOwnerPercentage = async () => {
    const value = Number(ownerPercentage);
    if (Number.isNaN(value) || value < 0 || value > 100) {
      Alert.alert('Valor invalido', 'El porcentaje debe estar entre 0 y 100');
      return;
    }
    setSaving(true);
    try {
      await api.updateSetting('OWNER_COMMISSION_PERCENTAGE', String(value));
      Alert.alert('Guardado', 'Porcentaje del propietario actualizado');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Title>Configuracion</Title>
      <Muted>Tema de la aplicacion</Muted>

      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const selected = preference === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setPreference(option.value)}
              style={[
                styles.option,
                {
                  backgroundColor: selected ? colors.tint : colors.card,
                  borderColor: colors.border,
                },
              ]}>
              <Text style={{ color: selected ? '#FFFFFF' : colors.text, fontWeight: '600' }}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Muted>Participacion del propietario</Muted>
      <Field
        label="Porcentaje (%)"
        value={ownerPercentage}
        onChangeText={setOwnerPercentage}
        keyboardType="numeric"
      />
      <PrimaryButton
        label={saving ? 'Guardando...' : 'Guardar porcentaje'}
        onPress={saveOwnerPercentage}
        disabled={saving}
      />

      <Muted>Modulos</Muted>
      <Pressable
        onPress={() => router.push('/promotion')}
        style={[styles.link, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>Promociones</Text>
        <Muted>Gestionar precios especiales</Muted>
      </Pressable>
      <Pressable
        onPress={() => router.push('/import-horarios' as Href)}
        style={[styles.link, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>Importar horarios (OCR)</Text>
        <Muted>Foto de planilla ControleODONTO</Muted>
      </Pressable>
      <Pressable
        onPress={() => router.push('/reports')}
        style={[styles.link, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={{ color: colors.text, fontWeight: '700' }}>Reportes</Text>
        <Muted>Ingresos, PDF e impresion</Muted>
      </Pressable>

      <Muted>API</Muted>
      <Text style={{ color: colors.textMuted, fontSize: 12 }}>{api.getBaseUrl()}</Text>
      <Muted>OCR</Muted>
      <Text style={{ color: colors.textMuted, fontSize: 12 }}>{getOcrBaseUrl()}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  option: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  link: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
});
