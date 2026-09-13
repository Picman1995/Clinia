package py.com.clinia.api.dto;

import jakarta.validation.constraints.Min;

public record AppointmentItemRequest(
        Long serviceId,
        Long serviceZoneId,

        @Min(value = 1, message = "La cantidad debe ser al menos 1")
        Integer quantity
) {
}
