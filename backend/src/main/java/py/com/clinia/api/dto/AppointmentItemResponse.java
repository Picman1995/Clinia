package py.com.clinia.api.dto;

import java.math.BigDecimal;

public record AppointmentItemResponse(
        Long id,
        Long serviceId,
        Long serviceZoneId,
        String nameSnapshot,
        Integer durationMinutes,
        BigDecimal unitPriceSnapshot,
        Integer quantity,
        BigDecimal lineTotalSnapshot
) {
}
