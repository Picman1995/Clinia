package py.com.clinia.api.dto;

import java.time.LocalDate;

public record ProfessionalResponse(
        Long id,
        String firstName,
        String lastName,
        String documentNumber,
        String specialty,
        LocalDate birthDate,
        boolean defaultProfessional
) {
}
