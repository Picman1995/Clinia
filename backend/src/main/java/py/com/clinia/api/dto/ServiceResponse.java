package py.com.clinia.api.dto;

import py.com.clinia.api.enums.EntityStatus;
import py.com.clinia.api.enums.ServiceCategoryType;

import java.math.BigDecimal;

public record ServiceResponse(
        Long id,
        String name,
        String description,
        Long categoryId,
        String categoryName,
        ServiceCategoryType categoryType,
        Integer durationMinutes,
        BigDecimal price,
        EntityStatus status
) {
}
