package py.com.clinia.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import py.com.clinia.api.enums.ServiceCategoryType;

public record ServiceCategoryRequest(
        @NotBlank(message = "El nombre de la categoria es obligatorio")
        @Size(max = 100)
        String name,

        @NotNull(message = "El tipo de categoria es obligatorio")
        ServiceCategoryType type,

        @Size(max = 500)
        String description
) {
}
