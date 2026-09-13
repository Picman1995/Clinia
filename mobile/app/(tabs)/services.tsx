import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, Card, Muted, Screen, Title } from '@/src/components/ui';
import { api, formatGs, ServiceResponse, ServiceZoneResponse } from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

export default function ServicesScreen() {
  const { colors } = useThemePreference();
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [zones, setZones] = useState<ServiceZoneResponse[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [serviceData, zoneData] = await Promise.all([
        api.searchServices({ status: 'ACTIVO' }),
        api.searchZones(undefined, 'ACTIVO'),
      ]);
      setServices(serviceData);
      setZones(zoneData);
      if (!selectedServiceId && serviceData.length > 0) {
        const depilation = serviceData.find((item) => item.categoryType === 'DEPILACION');
        setSelectedServiceId(depilation?.id ?? serviceData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el catalogo');
    } finally {
      setLoading(false);
    }
  }, [selectedServiceId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const visibleZones = zones.filter((zone) => zone.serviceId === selectedServiceId);

  return (
    <Screen>
      <Title>Servicios</Title>
      <Muted>Catalogo de depilacion y estetica</Muted>

      {loading ? (
        <ActivityIndicator color={colors.tint} />
      ) : error ? (
        <Muted>{error}</Muted>
      ) : (
        <>
          <FlatList
            data={services}
            keyExtractor={(item) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => {
              const selected = item.id === selectedServiceId;
              return (
                <Pressable
                  onPress={() => setSelectedServiceId(item.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.tint : colors.card,
                      borderColor: colors.border,
                    },
                  ]}>
                  <Text style={{ color: selected ? '#FFFFFF' : colors.text, fontWeight: '600' }}>
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />

          <Card>
            {services
              .filter((item) => item.id === selectedServiceId)
              .map((item) => (
                <View key={item.id} style={{ gap: 6 }}>
                  <View style={styles.row}>
                    <Text style={[styles.serviceName, { color: colors.text }]}>{item.name}</Text>
                    <Badge label={item.categoryType} />
                  </View>
                  <Muted>{item.categoryName}</Muted>
                  <Muted>
                    {formatGs(item.price)} · {item.durationMinutes} min
                  </Muted>
                  {item.description ? <Muted>{item.description}</Muted> : null}
                </View>
              ))}
          </Card>

          <Text style={[styles.section, { color: colors.text }]}>Zonas</Text>
          {visibleZones.length === 0 ? (
            <Muted>Este servicio no tiene zonas configuradas</Muted>
          ) : (
            <FlatList
              data={visibleZones}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ gap: 10, paddingBottom: 30 }}
              renderItem={({ item }) => (
                <Card>
                  <View style={styles.row}>
                    <Text style={[styles.zoneName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={{ color: colors.tint, fontWeight: '700' }}>{formatGs(item.price)}</Text>
                  </View>
                  <Muted>{item.durationMinutes} min</Muted>
                </Card>
              )}
            />
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  section: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
});
