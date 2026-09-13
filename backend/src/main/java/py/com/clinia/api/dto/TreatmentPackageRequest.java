package py.com.clinia.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record TreatmentPackageRequest(
        @NotNull(message = "El paciente es obligatorio")
        Long patientId,

        Long serviceId,

        @NotBlank(message = "El nombre del paquete es obligatorio")
        @Size(max = 150)
        String name,

        @NotNull(message = "La cantidad de sesiones es obligatoria")
        @Min(value = 1, message = "Debe contratar al menos 1 sesion")
        Integer totalSessions,

        @NotNull(message = "El precio total es obligatorio")
        @DecimalMin(value = "0", inclusive = true, message = "El precio no puede ser negativo")
        BigDecimal totalPrice,

        @Size(max = 1000)
        String notes
) {
}
