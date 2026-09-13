import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Badge, Card, Muted, PrimaryButton, Screen, Title } from '@/src/components/ui';
import { api, PatientResponse } from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

export default function PatientsScreen() {
  const router = useRouter();
  const { colors } = useThemePreference();
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (search = query) => {
    setError(null);
    try {
      const data = await api.searchPatients(search, 'ACTIVO');
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar pacientes');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  return (
    <Screen>
      <Title>Pacientes</Title>
      <Muted>Busca por nombre o apellido</Muted>

      <TextInput
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => {
          setLoading(true);
          load(query);
        }}
        placeholder="Buscar paciente"
        placeholderTextColor={colors.textMuted}
        style={[
          styles.search,
          { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
        ]}
      />

      <PrimaryButton
        label="Nuevo paciente"
        onPress={() => router.push('/patient/new')}
      />
      <PrimaryButton
        label="Importar desde foto (OCR)"
        onPress={() => router.push('/import-horarios' as Href)}
      />

      {loading ? (
        <ActivityIndicator color={colors.tint} />
      ) : error ? (
        <Muted>{error}</Muted>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => {
                setLoading(true);
                load();
              }}
            />
          }
          contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
          ListEmptyComponent={<Muted>No hay pacientes registrados</Muted>}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/patient/${item.id}`)}>
              <Card>
                <View style={styles.row}>
                  <Text style={[styles.name, { color: colors.text }]}>
                    {item.lastName}, {item.firstName}
                  </Text>
                  <Badge label={item.status} tone={item.status === 'ACTIVO' ? 'success' : 'danger'} />
                </View>
                <Muted>
                  {item.phone
                    ? `Tel: ${item.phone}`
                    : item.documentNumber
                      ? `CI: ${item.documentNumber}`
                      : 'Sin telefono ni CI'}
                </Muted>
                {item.phone && item.documentNumber ? <Muted>CI: {item.documentNumber}</Muted> : null}
              </Card>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
});
