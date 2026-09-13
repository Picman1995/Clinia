package py.com.clinia.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import py.com.clinia.api.enums.AppointmentStatus;

public record AppointmentStatusRequest(
        @NotNull(message = "El estado de la cita es obligatorio")
        AppointmentStatus appointmentStatus,

        Long treatmentPackageId,

        @Size(max = 1000)
        String sessionNotes
) {
}
