import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';

import { Field, Muted, PrimaryButton, Screen, Title } from '@/src/components/ui';
import { api, PatientRequest } from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

const emptyForm: PatientRequest = {
  firstName: '',
  lastName: '',
  documentNumber: '',
  phone: '',
  email: '',
  birthDate: '',
  address: '',
  notes: '',
};

export default function PatientFormScreen() {
  const router = useRouter();
  const { colors } = useThemePreference();
  const params = useLocalSearchParams<{ id?: string }>();
  const patientId = params.id ? Number(params.id) : null;
  const isEdit = Number.isFinite(patientId) && patientId !== null;

  const [form, setForm] = useState<PatientRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit || patientId === null) {
      return;
    }
    api
      .getPatient(patientId)
      .then((patient) => {
        setForm({
          firstName: patient.firstName,
          lastName: patient.lastName,
          documentNumber: patient.documentNumber ?? '',
          phone: patient.phone ?? '',
          email: patient.email ?? '',
          birthDate: patient.birthDate ?? '',
          address: patient.address ?? '',
          notes: patient.notes ?? '',
        });
      })
      .catch((err) => Alert.alert('Error', err.message))
      .finally(() => setLoading(false));
  }, [isEdit, patientId]);

  const update = (key: keyof PatientRequest, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      Alert.alert('Datos incompletos', 'Nombre y apellido son obligatorios');
      return;
    }

    const payload: PatientRequest = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      documentNumber: form.documentNumber?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      email: form.email?.trim() || undefined,
      birthDate: form.birthDate?.trim() || undefined,
      address: form.address?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
    };

    setSaving(true);
    try {
      if (isEdit && patientId !== null) {
        await api.updatePatient(patientId, payload);
      } else {
        await api.createPatient(payload);
      }
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
        <Title>{isEdit ? 'Editar paciente' : 'Nuevo paciente'}</Title>
        <Muted>Completa los datos principales del paciente</Muted>

        <Field label="Nombre" value={form.firstName} onChangeText={(v) => update('firstName', v)} />
        <Field label="Apellido" value={form.lastName} onChangeText={(v) => update('lastName', v)} />
        <Field
          label="Documento / CI (opcional)"
          value={form.documentNumber ?? ''}
          onChangeText={(v) => update('documentNumber', v)}
        />
        <Muted>Si no hay CI, el paciente se busca por nombre</Muted>
        <Field
          label="Telefono"
          value={form.phone ?? ''}
          onChangeText={(v) => update('phone', v)}
          keyboardType="phone-pad"
        />
        <Field
          label="Email"
          value={form.email ?? ''}
          onChangeText={(v) => update('email', v)}
          keyboardType="email-address"
        />
        <Field
          label="Fecha de nacimiento (AAAA-MM-DD)"
          value={form.birthDate ?? ''}
          onChangeText={(v) => update('birthDate', v)}
          placeholder="1997-10-20"
        />
        <Field label="Direccion" value={form.address ?? ''} onChangeText={(v) => update('address', v)} />
        <Field
          label="Observaciones"
          value={form.notes ?? ''}
          onChangeText={(v) => update('notes', v)}
          multiline
        />

        <PrimaryButton label={saving ? 'Guardando...' : 'Guardar'} onPress={save} disabled={saving} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
    paddingBottom: 40,
  },
});
