package py.com.clinia.api.dto;

import jakarta.validation.constraints.Size;

public record CompleteSessionRequest(
        Long appointmentId,

        @Size(max = 1000)
        String notes
) {
}
