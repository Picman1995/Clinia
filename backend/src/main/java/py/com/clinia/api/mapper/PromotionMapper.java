package py.com.clinia.api.mapper;

import py.com.clinia.api.dto.PromotionItemResponse;
import py.com.clinia.api.dto.PromotionResponse;
import py.com.clinia.api.entity.Promotion;
import py.com.clinia.api.entity.PromotionItem;

import java.util.Comparator;
import java.util.List;

public final class PromotionMapper {

    private PromotionMapper() {
    }

    public static PromotionResponse toResponse(Promotion promotion) {
        List<PromotionItemResponse> items = promotion.getItems().stream()
                .sorted(Comparator.comparing(PromotionItem::getId, Comparator.nullsLast(Long::compareTo)))
                .map(PromotionMapper::toItemResponse)
                .toList();

        return new PromotionResponse(
                promotion.getId(),
                promotion.getName(),
                promotion.getDescription(),
                promotion.getNormalPrice(),
                promotion.getPromotionalPrice(),
                promotion.getStartDate(),
                promotion.getEndDate(),
                promotion.getStatus(),
                items
        );
    }

    private static PromotionItemResponse toItemResponse(PromotionItem item) {
        return new PromotionItemResponse(
                item.getId(),
                item.getService() == null ? null : item.getService().getId(),
                item.getService() == null ? null : item.getService().getName(),
                item.getServiceZone() == null ? null : item.getServiceZone().getId(),
                item.getServiceZone() == null ? null : item.getServiceZone().getName()
        );
    }
}
