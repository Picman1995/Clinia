import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge, Card, Muted, PrimaryButton, Screen, SecondaryButton, Title } from '@/src/components/ui';
import { api, formatGs, ServiceResponse, ServiceZoneResponse } from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

export default function CatalogScreen() {
  const router = useRouter();
  const { colors } = useThemePreference();
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [zones, setZones] = useState<ServiceZoneResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'DEPILACION' | 'ESTETICA'>('ALL');

  const load = useCallback(async () => {
    setError(null);
    try {
      const [serviceData, zoneData] = await Promise.all([
        api.searchServices({ status: 'ACTIVO' }),
        api.searchZones(undefined, 'ACTIVO'),
      ]);
      setServices(serviceData);
      setZones(zoneData);
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

  const visibleServices = useMemo(() => {
    if (filter === 'ALL') {
      return services;
    }
    return services.filter((item) => item.categoryType === filter);
  }, [services, filter]);

  const zonesByService = useMemo(() => {
    const map = new Map<number, ServiceZoneResponse[]>();
    for (const zone of zones) {
      const list = map.get(zone.serviceId) ?? [];
      list.push(zone);
      map.set(zone.serviceId, list);
    }
    return map;
  }, [zones]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Title>Editar catalogo</Title>
        <Muted>Aca cambia precios, duracion y nombres. Lo que guardes se usa al agendar citas nuevas.</Muted>

        <View style={styles.filters}>
          {(
            [
              { key: 'ALL', label: 'Todos' },
              { key: 'DEPILACION', label: 'Depilacion' },
              { key: 'ESTETICA', label: 'Estetica' },
            ] as const
          ).map((item) => {
            const selected = filter === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setFilter(item.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selected ? colors.tint : colors.card,
                    borderColor: colors.border,
                  },
                ]}>
                <Text style={{ color: selected ? '#FFFFFF' : colors.text, fontWeight: '600' }}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.tint} />
        ) : error ? (
          <Card>
            <Muted>{error}</Muted>
            <SecondaryButton label="Reintentar" onPress={load} />
          </Card>
        ) : visibleServices.length === 0 ? (
          <Card>
            <Muted>No hay servicios en este filtro.</Muted>
          </Card>
        ) : (
          visibleServices.map((service) => {
            const serviceZones = zonesByService.get(service.id) ?? [];
            return (
              <Card key={service.id}>
                <View style={styles.row}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[styles.serviceName, { color: colors.text }]}>{service.name}</Text>
                    <Muted>{service.categoryName}</Muted>
                  </View>
                  <Badge label={service.categoryType === 'DEPILACION' ? 'Depilacion' : 'Estetica'} />
                </View>

                <View style={[styles.priceRow, { borderColor: colors.border }]}>
                  <View style={styles.metric}>
                    <Muted>Precio base</Muted>
                    <Text style={[styles.metricValue, { color: colors.tint }]}>
                      {formatGs(service.price)}
                    </Text>
                  </View>
                  <View style={styles.metric}>
                    <Muted>Duracion</Muted>
                    <Text style={[styles.metricValue, { color: colors.text }]}>
                      {service.durationMinutes} min
                    </Text>
                  </View>
                </View>

                {serviceZones.length > 0 ? (
                  <View style={styles.zonePreview}>
                    <Muted>
                      {serviceZones.length} zona{serviceZones.length === 1 ? '' : 's'} · toca una para
                      editar su precio
                    </Muted>
                    {serviceZones.slice(0, 3).map((zone) => (
                      <Pressable
                        key={zone.id}
                        onPress={() => router.push(`/catalog/zone/${zone.id}` as Href)}
                        style={[styles.zoneLine, { borderColor: colors.border }]}>
                        <Text style={{ color: colors.text, flex: 1 }}>{zone.name}</Text>
                        <Text style={{ color: colors.tint, fontWeight: '700' }}>
                          {formatGs(zone.price)}
                        </Text>
                      </Pressable>
                    ))}
                    {serviceZones.length > 3 ? (
                      <Muted>+{serviceZones.length - 3} zonas mas</Muted>
                    ) : null}
                  </View>
                ) : (
                  <Muted>Sin zonas: el precio base es el que se cobra al agendar.</Muted>
                )}

                <PrimaryButton
                  label="Editar servicio"
                  onPress={() => router.push(`/catalog/service/${service.id}` as Href)}
                />
              </Card>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 40,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  metric: {
    flex: 1,
    gap: 2,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  zonePreview: {
    gap: 8,
    marginTop: 4,
  },
  zoneLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
