package py.com.clinia.api.dto;

import py.com.clinia.api.enums.EntityStatus;

import java.math.BigDecimal;

public record ServiceZoneResponse(
        Long id,
        String name,
        String description,
        Long serviceId,
        String serviceName,
        BigDecimal price,
        Integer durationMinutes,
        EntityStatus status
) {
}
