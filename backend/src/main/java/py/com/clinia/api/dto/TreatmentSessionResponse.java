package py.com.clinia.api.dto;

import py.com.clinia.api.enums.SessionStatus;

import java.time.OffsetDateTime;

public record TreatmentSessionResponse(
        Long id,
        Integer sessionNumber,
        SessionStatus sessionStatus,
        OffsetDateTime performedAt,
        Long appointmentId,
        String notes
) {
}
