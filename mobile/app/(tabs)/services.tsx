import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
      setSelectedServiceId((current) => {
        if (current && serviceData.some((item) => item.id === current)) {
          return current;
        }
        const depilation = serviceData.find((item) => item.categoryType === 'DEPILACION');
        return depilation?.id ?? serviceData[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el catalogo');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const selectedService = useMemo(
    () => services.find((item) => item.id === selectedServiceId) ?? null,
    [services, selectedServiceId]
  );

  const visibleZones = useMemo(
    () => zones.filter((zone) => zone.serviceId === selectedServiceId),
    [zones, selectedServiceId]
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Title>Servicios</Title>
        <Muted>Catalogo de depilacion y estetica (precios y duracion)</Muted>

        {loading ? (
          <ActivityIndicator color={colors.tint} />
        ) : error ? (
          <Card>
            <Muted>{error}</Muted>
            <Muted>Revisa en Mas que la URL del API sea alcanzable desde el telefono.</Muted>
          </Card>
        ) : services.length === 0 ? (
          <Card>
            <Muted>No hay servicios activos en el catalogo.</Muted>
          </Card>
        ) : (
          <>
            <View style={styles.wrap}>
              {services.map((item) => {
                const selected = item.id === selectedServiceId;
                return (
                  <Pressable
                    key={item.id}
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
              })}
            </View>

            {selectedService ? (
              <Card>
                <View style={styles.row}>
                  <Text style={[styles.serviceName, { color: colors.text }]}>{selectedService.name}</Text>
                  <Badge label={selectedService.categoryType} />
                </View>
                <Muted>{selectedService.categoryName}</Muted>
                <Muted>
                  {formatGs(selectedService.price)} · {selectedService.durationMinutes} min
                </Muted>
                {selectedService.description ? <Muted>{selectedService.description}</Muted> : null}
              </Card>
            ) : null}

            <Text style={[styles.section, { color: colors.text }]}>
              {visibleZones.length > 0 ? 'Zonas y precios' : 'Detalle'}
            </Text>
            {visibleZones.length === 0 ? (
              <Muted>
                Este servicio no tiene zonas: el precio de arriba es el que se usa al agendar.
              </Muted>
            ) : (
              visibleZones.map((item) => (
                <Card key={item.id}>
                  <View style={styles.row}>
                    <Text style={[styles.zoneName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={{ color: colors.tint, fontWeight: '700' }}>{formatGs(item.price)}</Text>
                  </View>
                  <Muted>{item.durationMinutes} min</Muted>
                </Card>
              ))
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 10,
    paddingBottom: 40,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
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
