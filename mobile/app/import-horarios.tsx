import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Card, Field, Muted, PrimaryButton, Screen, SecondaryButton, Title } from '@/src/components/ui';
import { api } from '@/src/services/api';
import {
  extractHorariosFromImage,
  getOcrBaseUrl,
  OcrPatientCandidate,
  ocrHealth,
} from '@/src/services/ocr';
import { useThemePreference } from '@/src/theme/ThemeContext';

type DraftPatient = OcrPatientCandidate & {
  key: string;
  selected: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  notes: string;
};

function toDraft(patients: OcrPatientCandidate[]): DraftPatient[] {
  return patients.map((patient, index) => ({
    ...patient,
    key: `${patient.phone ?? 'sin-tel'}-${patient.fullName ?? index}-${index}`,
    selected: true,
    firstName: patient.firstName ?? '',
    lastName: patient.lastName ?? '',
    phone: patient.phone ?? '',
    notes: patient.notes ?? '',
  }));
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, '');
}

export default function ImportHorariosScreen() {
  const router = useRouter();
  const { colors } = useThemePreference();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftPatient[]>([]);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const selectedCount = useMemo(() => drafts.filter((item) => item.selected).length, [drafts]);

  const ensurePermissions = async (source: 'camera' | 'library') => {
    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a la camara para fotografiar la hoja.');
        return false;
      }
      return true;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la galeria para elegir la foto.');
      return false;
    }
    return true;
  };

  const processImage = async (uri: string) => {
    setBusy(true);
    setStatus('Analizando imagen con OCR...');
    setDrafts([]);
    setConfidence(null);
    try {
      await ocrHealth();
      const result = await extractHorariosFromImage(uri);
      setConfidence(result.ocr?.confidence ?? null);
      setDrafts(toDraft(result.patients));
      setStatus(
        `Detectados ${result.patientsCount} paciente(s). Revisá y confirma antes de guardar.`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo procesar la imagen';
      setStatus(null);
      setDrafts([]);
      Alert.alert('OCR', message);
    } finally {
      setBusy(false);
    }
  };

  const pickImage = async (source: 'camera' | 'library') => {
    const allowed = await ensurePermissions(source);
    if (!allowed) {
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.85,
            allowsEditing: false,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.85,
            allowsEditing: false,
          });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    const uri = result.assets[0].uri;
    setImageUri(uri);
    await processImage(uri);
  };

  const updateDraft = (key: string, patch: Partial<DraftPatient>) => {
    setDrafts((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  };

  const saveSelected = async () => {
    const selected = drafts.filter((item) => item.selected);
    if (selected.length === 0) {
      Alert.alert('Sin seleccion', 'Marcá al menos un paciente para guardar');
      return;
    }

    for (const item of selected) {
      if (!item.firstName.trim() || !item.lastName.trim()) {
        Alert.alert('Datos incompletos', 'Todos los seleccionados deben tener nombre y apellido');
        return;
      }
    }

    setSaving(true);
    try {
      const existing = await api.searchPatients(undefined, 'ACTIVO');
      let created = 0;
      let skipped = 0;

      for (const item of selected) {
        const phoneKey = normalizePhone(item.phone);
        const nameKey = `${item.firstName.trim()} ${item.lastName.trim()}`.toLowerCase();
        const duplicate = existing.find((patient) => {
          const patientPhone = normalizePhone(patient.phone ?? '');
          const patientName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
          if (phoneKey && patientPhone && phoneKey === patientPhone) {
            return true;
          }
          return patientName === nameKey;
        });

        if (duplicate) {
          skipped += 1;
          continue;
        }

        await api.createPatient({
          firstName: item.firstName.trim(),
          lastName: item.lastName.trim(),
          phone: item.phone.trim() || undefined,
          notes: item.notes.trim() || undefined,
        });
        created += 1;
      }

      Alert.alert(
        'Importacion lista',
        `Creados: ${created}. Omitidos por posible duplicado: ${skipped}.`,
        [{ text: 'Ver pacientes', onPress: () => router.replace('/(tabs)/patients') }]
      );
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudieron guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Title>Importar horarios</Title>
        <Muted>Sacá una foto de la hoja HORARIOS ControleODONTO y revisá los pacientes detectados.</Muted>
        <Muted>OCR: {getOcrBaseUrl()}</Muted>

        <PrimaryButton
          label={busy ? 'Procesando...' : 'Sacar foto'}
          onPress={() => pickImage('camera')}
          disabled={busy || saving}
        />
        <SecondaryButton
          label="Elegir de galeria"
          onPress={() => pickImage('library')}
          disabled={busy || saving}
        />

        {imageUri ? (
          <Card>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
            {confidence != null ? <Muted>Confianza OCR: {Math.round(confidence)}%</Muted> : null}
            {status ? <Muted>{status}</Muted> : null}
            {busy ? <ActivityIndicator color={colors.tint} /> : null}
          </Card>
        ) : (
          <Card>
            <Muted>Consejos: luz pareja, hoja completa, sin sombra fuerte, enfoque nítido.</Muted>
          </Card>
        )}

        {drafts.length > 0 ? (
          <>
            <Text style={[styles.section, { color: colors.text }]}>
              Pacientes detectados ({selectedCount}/{drafts.length})
            </Text>
            {drafts.map((item) => (
              <Card key={item.key}>
                <Pressable
                  onPress={() => updateDraft(item.key, { selected: !item.selected })}
                  style={styles.selectRow}>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: colors.tint,
                        backgroundColor: item.selected ? colors.tint : 'transparent',
                      },
                    ]}
                  />
                  <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>
                    {item.selected ? 'Seleccionado' : 'Omitir'}
                  </Text>
                </Pressable>
                <Field
                  label="Nombre"
                  value={item.firstName}
                  onChangeText={(value) => updateDraft(item.key, { firstName: value })}
                />
                <Field
                  label="Apellido"
                  value={item.lastName}
                  onChangeText={(value) => updateDraft(item.key, { lastName: value })}
                />
                <Field
                  label="Telefono"
                  value={item.phone}
                  onChangeText={(value) => updateDraft(item.key, { phone: value })}
                  keyboardType="phone-pad"
                />
                <Field
                  label="Notas"
                  value={item.notes}
                  onChangeText={(value) => updateDraft(item.key, { notes: value })}
                  multiline
                />
                {item.appointmentHint?.serviceText ? (
                  <Muted>
                    Cita sugerida: {item.appointmentHint.date ?? '-'}{' '}
                    {item.appointmentHint.startTime ?? ''} · {item.appointmentHint.serviceText}
                    {item.appointmentHint.depositAmount
                      ? ` · Seña ${item.appointmentHint.depositAmount}`
                      : ''}
                  </Muted>
                ) : null}
              </Card>
            ))}
            <PrimaryButton
              label={saving ? 'Guardando...' : `Guardar ${selectedCount} paciente(s)`}
              onPress={saveSelected}
              disabled={busy || saving || selectedCount === 0}
            />
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 40,
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  section: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 6,
  },
});
