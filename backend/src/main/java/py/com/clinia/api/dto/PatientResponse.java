package py.com.clinia.api.dto;

import py.com.clinia.api.enums.EntityStatus;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record PatientResponse(
        Long id,
        String firstName,
        String lastName,
        String documentNumber,
        String phone,
        String email,
        LocalDate birthDate,
        String address,
        String notes,
        OffsetDateTime registeredAt,
        EntityStatus status
) {
}
