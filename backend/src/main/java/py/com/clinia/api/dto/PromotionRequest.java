package py.com.clinia.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PromotionRequest(
        @NotBlank(message = "El nombre de la promocion es obligatorio")
        @Size(max = 150)
        String name,

        @Size(max = 1000)
        String description,

        @NotNull(message = "El precio normal es obligatorio")
        @DecimalMin(value = "0", inclusive = true, message = "El precio normal no puede ser negativo")
        BigDecimal normalPrice,

        @NotNull(message = "El precio promocional es obligatorio")
        @DecimalMin(value = "0", inclusive = true, message = "El precio promocional no puede ser negativo")
        BigDecimal promotionalPrice,

        LocalDate startDate,
        LocalDate endDate,

        @Valid
        List<PromotionItemRequest> items
) {
}
