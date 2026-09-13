package py.com.clinia.api.dto;

import py.com.clinia.api.enums.EntityStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PromotionResponse(
        Long id,
        String name,
        String description,
        BigDecimal normalPrice,
        BigDecimal promotionalPrice,
        LocalDate startDate,
        LocalDate endDate,
        EntityStatus status,
        List<PromotionItemResponse> items
) {
}
