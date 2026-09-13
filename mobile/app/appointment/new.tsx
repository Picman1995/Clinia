import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Card, Field, Muted, PrimaryButton, Screen, Title } from '@/src/components/ui';
import {
  api,
  formatGs,
  PatientResponse,
  ServiceResponse,
  ServiceZoneResponse,
  todayPy,
  toPyOffset,
} from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

type SelectedItem = {
  key: string;
  label: string;
  serviceId?: number;
  serviceZoneId?: number;
  price: number;
  durationMinutes: number;
};

export default function NewAppointmentScreen() {
  const router = useRouter();
  const { colors } = useThemePreference();

  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [zones, setZones] = useState<ServiceZoneResponse[]>([]);
  const [patientQuery, setPatientQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientResponse | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [date, setDate] = useState(todayPy());
  const [time, setTime] = useState('09:00');
  const [deposit, setDeposit] = useState('0');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.searchPatients(undefined, 'ACTIVO'),
      api.searchServices({ status: 'ACTIVO' }),
      api.searchZones(undefined, 'ACTIVO'),
    ])
      .then(([patientData, serviceData, zoneData]) => {
        setPatients(patientData);
        setServices(serviceData);
        setZones(zoneData);
      })
      .catch((err) => Alert.alert('Error', err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredPatients = useMemo(() => {
    const q = patientQuery.trim().toLowerCase();
    if (!q) {
      return patients.slice(0, 8);
    }
    return patients
      .filter((patient) => {
        const haystack = `${patient.firstName} ${patient.lastName} ${patient.documentNumber} ${patient.phone ?? ''}`.toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 8);
  }, [patientQuery, patients]);

  const totals = useMemo(() => {
    const durationMinutes = selectedItems.reduce((sum, item) => sum + item.durationMinutes, 0);
    const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);
    const depositAmount = Number(deposit || '0');
    return {
      durationMinutes,
      totalAmount,
      depositAmount,
      balanceAmount: Math.max(totalAmount - depositAmount, 0),
    };
  }, [selectedItems, deposit]);

  const toggleZone = (zone: ServiceZoneResponse) => {
    const key = `zone-${zone.id}`;
    setSelectedItems((current) => {
      if (current.some((item) => item.key === key)) {
        return current.filter((item) => item.key !== key);
      }
      return [
        ...current,
        {
          key,
          label: zone.name,
          serviceZoneId: zone.id,
          serviceId: zone.serviceId,
          price: Number(zone.price),
          durationMinutes: zone.durationMinutes,
        },
      ];
    });
  };

  const toggleService = (service: ServiceResponse) => {
    const hasZones = zones.some((zone) => zone.serviceId === service.id);
    if (hasZones) {
      return;
    }
    const key = `service-${service.id}`;
    setSelectedItems((current) => {
      if (current.some((item) => item.key === key)) {
        return current.filter((item) => item.key !== key);
      }
      return [
        ...current,
        {
          key,
          label: service.name,
          serviceId: service.id,
          price: Number(service.price),
          durationMinutes: service.durationMinutes,
        },
      ];
    });
  };

  const save = async () => {
    if (!selectedPatient) {
      Alert.alert('Falta paciente', 'Selecciona un paciente');
      return;
    }
    if (selectedItems.length === 0) {
      Alert.alert('Faltan servicios', 'Selecciona al menos un servicio o zona');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
      Alert.alert('Fecha u hora invalida', 'Usa formato AAAA-MM-DD y HH:MM');
      return;
    }
    if (Number.isNaN(totals.depositAmount) || totals.depositAmount < 0) {
      Alert.alert('Sena invalida', 'La sena debe ser un numero valido');
      return;
    }
    if (totals.depositAmount > totals.totalAmount) {
      Alert.alert('Sena invalida', 'La sena no puede superar el total');
      return;
    }

    setSaving(true);
    try {
      await api.createAppointment({
        patientId: selectedPatient.id,
        startAt: toPyOffset(date, time),
        depositAmount: totals.depositAmount,
        notes: notes.trim() || undefined,
        items: selectedItems.map((item) => ({
          serviceId: item.serviceId,
          serviceZoneId: item.serviceZoneId,
          quantity: 1,
        })),
      });
      router.replace('/(tabs)/agenda');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo crear la reserva');
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

  const aestheticServices = services.filter(
    (service) => service.categoryType === 'ESTETICA' || !zones.some((zone) => zone.serviceId === service.id)
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Title>Nueva reserva</Title>
        <Muted>Paciente, servicios, horario y sena</Muted>

        <Field
          label="Buscar paciente"
          value={patientQuery}
          onChangeText={setPatientQuery}
          placeholder="Nombre, CI o telefono"
        />

        {selectedPatient ? (
          <Card>
            <Text style={[styles.selected, { color: colors.text }]}>
              {selectedPatient.firstName} {selectedPatient.lastName}
            </Text>
            <Muted>CI: {selectedPatient.documentNumber}</Muted>
            <Pressable onPress={() => setSelectedPatient(null)}>
              <Text style={{ color: colors.danger, fontWeight: '600' }}>Quitar</Text>
            </Pressable>
          </Card>
        ) : (
          <FlatList
            data={filteredPatients}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
            contentContainerStyle={{ gap: 8 }}
            ListEmptyComponent={<Muted>No se encontraron pacientes</Muted>}
            renderItem={({ item }) => (
              <Pressable onPress={() => setSelectedPatient(item)}>
                <Card>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>
                    {item.lastName}, {item.firstName}
                  </Text>
                  <Muted>CI: {item.documentNumber}</Muted>
                </Card>
              </Pressable>
            )}
          />
        )}

        <Text style={[styles.section, { color: colors.text }]}>Zonas de depilacion</Text>
        <View style={styles.wrap}>
          {zones.map((zone) => {
            const selected = selectedItems.some((item) => item.key === `zone-${zone.id}`);
            return (
              <Pressable
                key={zone.id}
                onPress={() => toggleZone(zone)}
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
                <Text style={{ color: selected ? '#FFFFFF' : colors.textMuted, fontSize: 12 }}>
                  {formatGs(zone.price)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.section, { color: colors.text }]}>Servicios</Text>
        <View style={styles.wrap}>
          {aestheticServices.map((service) => {
            const selected = selectedItems.some((item) => item.key === `service-${service.id}`);
            return (
              <Pressable
                key={service.id}
                onPress={() => toggleService(service)}
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

        <Field label="Fecha (AAAA-MM-DD)" value={date} onChangeText={setDate} />
        <Field label="Hora (HH:MM)" value={time} onChangeText={setTime} placeholder="09:00" />
        <Field
          label="Sena (Gs.)"
          value={deposit}
          onChangeText={setDeposit}
          keyboardType="numeric"
        />
        <Field label="Observaciones" value={notes} onChangeText={setNotes} multiline />

        <Card>
          <Muted>Duracion estimada: {totals.durationMinutes} min</Muted>
          <Muted>Total: {formatGs(totals.totalAmount)}</Muted>
          <Muted>Sena: {formatGs(totals.depositAmount)}</Muted>
          <Text style={{ color: colors.text, fontWeight: '700' }}>
            Saldo: {formatGs(totals.balanceAmount)}
          </Text>
        </Card>

        <PrimaryButton label={saving ? 'Guardando...' : 'Crear reserva'} onPress={save} disabled={saving} />
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
  selected: {
    fontSize: 17,
    fontWeight: '700',
  },
});
