import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, Card, Muted, PrimaryButton, Screen, Title } from '@/src/components/ui';
import { api, formatGs, PromotionResponse } from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

export default function PromotionsScreen() {
  const router = useRouter();
  const { colors } = useThemePreference();
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setPromotions(await api.listPromotions({ status: 'ACTIVO' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar promociones');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen>
      <Title>Promociones</Title>
      <Muted>Precios especiales vigentes o activos</Muted>
      <PrimaryButton label="Nueva promocion" onPress={() => router.push('/promotion/new')} />

      {loading ? (
        <ActivityIndicator color={colors.tint} />
      ) : error ? (
        <Muted>{error}</Muted>
      ) : (
        <FlatList
          data={promotions}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ gap: 10, paddingBottom: 30 }}
          ListEmptyComponent={<Muted>No hay promociones activas</Muted>}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/promotion/${item.id}`)}>
              <Card>
                <View style={styles.row}>
                  <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                  <Badge label={item.status} tone="success" />
                </View>
                <Muted>
                  Normal {formatGs(item.normalPrice)} · Promo {formatGs(item.promotionalPrice)}
                </Muted>
                {item.description ? <Muted>{item.description}</Muted> : null}
                <Muted>
                  Items:{' '}
                  {item.items.length === 0
                    ? 'Libre'
                    : item.items
                        .map((entry) => entry.serviceZoneName || entry.serviceName)
                        .join(', ')}
                </Muted>
              </Card>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    alignItems: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
});
