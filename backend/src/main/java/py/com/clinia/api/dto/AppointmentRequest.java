package py.com.clinia.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record AppointmentRequest(
        @NotNull(message = "El paciente es obligatorio")
        Long patientId,

        Long professionalId,

        Long promotionId,

        @NotNull(message = "La fecha y hora de inicio son obligatorias")
        OffsetDateTime startAt,

        @NotNull(message = "La sena es obligatoria")
        @DecimalMin(value = "0", inclusive = true, message = "La sena no puede ser negativa")
        BigDecimal depositAmount,

        @Size(max = 2000)
        String notes,

        @NotEmpty(message = "Debe seleccionar al menos un servicio o zona")
        @Valid
        List<AppointmentItemRequest> items
) {
}
