package py.com.clinia.api.dto;

import py.com.clinia.api.enums.EntityStatus;
import py.com.clinia.api.enums.ServiceCategoryType;

public record ServiceCategoryResponse(
        Long id,
        String name,
        ServiceCategoryType type,
        String description,
        EntityStatus status
) {
}
