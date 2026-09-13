package py.com.clinia.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record PatientRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100)
        String firstName,

        @NotBlank(message = "El apellido es obligatorio")
        @Size(max = 100)
        String lastName,

        @NotBlank(message = "El documento es obligatorio")
        @Size(max = 30)
        String documentNumber,

        @Size(max = 30)
        String phone,

        @Size(max = 150)
        String email,

        LocalDate birthDate,

        @Size(max = 255)
        String address,

        @Size(max = 2000)
        String notes
) {
}
