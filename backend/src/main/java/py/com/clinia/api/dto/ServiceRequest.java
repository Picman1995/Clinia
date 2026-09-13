package py.com.clinia.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ServiceRequest(
        @NotBlank(message = "El nombre del servicio es obligatorio")
        @Size(max = 150)
        String name,

        @Size(max = 1000)
        String description,

        @NotNull(message = "La categoria es obligatoria")
        Long categoryId,

        @NotNull(message = "La duracion es obligatoria")
        @Min(value = 1, message = "La duracion debe ser mayor a 0")
        Integer durationMinutes,

        @NotNull(message = "El precio es obligatorio")
        @DecimalMin(value = "0", inclusive = true, message = "El precio no puede ser negativo")
        BigDecimal price
) {
}
