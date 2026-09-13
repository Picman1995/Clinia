import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text } from 'react-native';

import { Badge, Card, Muted, PrimaryButton, Screen, Title } from '@/src/components/ui';
import { api, formatGs, PromotionResponse } from '@/src/services/api';
import { useThemePreference } from '@/src/theme/ThemeContext';

export default function PromotionDetailScreen() {
  const router = useRouter();
  const { colors } = useThemePreference();
  const { id } = useLocalSearchParams<{ id: string }>();
  const promotionId = Number(id);
  const [promotion, setPromotion] = useState<PromotionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Number.isFinite(promotionId)) {
      return;
    }
    api
      .getPromotion(promotionId)
      .then(setPromotion)
      .catch((err) => {
        Alert.alert('Error', err.message);
        router.back();
      })
      .finally(() => setLoading(false));
  }, [promotionId, router]);

  const deactivate = async () => {
    if (!promotion) {
      return;
    }
    try {
      setPromotion(await api.deactivatePromotion(promotion.id));
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo desactivar');
    }
  };

  if (loading || !promotion) {
    return (
      <Screen>
        <ActivityIndicator color={colors.tint} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title>{promotion.name}</Title>
      <Badge label={promotion.status} tone={promotion.status === 'ACTIVO' ? 'success' : 'danger'} />
      <Card>
        <Muted>{promotion.description || 'Sin descripcion'}</Muted>
        <Text style={{ color: colors.text, fontWeight: '700' }}>
          {formatGs(promotion.promotionalPrice)}
        </Text>
        <Muted>Precio normal: {formatGs(promotion.normalPrice)}</Muted>
        <Muted>
          Vigencia: {promotion.startDate || '-'} a {promotion.endDate || '-'}
        </Muted>
      </Card>
      <Card>
        {promotion.items.length === 0 ? (
          <Muted>Sin items especificos</Muted>
        ) : (
          promotion.items.map((item) => (
            <Text key={item.id} style={{ color: colors.text }}>
              {item.serviceZoneName || item.serviceName}
            </Text>
          ))
        )}
      </Card>
      {promotion.status === 'ACTIVO' ? (
        <PrimaryButton label="Desactivar" onPress={deactivate} />
      ) : null}
    </Screen>
  );
}
