package py.com.clinia.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BusinessSettingUpdateRequest(
        @NotBlank(message = "El valor es obligatorio")
        @Size(max = 500)
        String value
) {
}
