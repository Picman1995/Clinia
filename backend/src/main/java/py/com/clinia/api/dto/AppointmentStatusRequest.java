package py.com.clinia.api.dto;

import jakarta.validation.constraints.NotNull;
import py.com.clinia.api.enums.AppointmentStatus;

public record AppointmentStatusRequest(
        @NotNull(message = "El estado de la cita es obligatorio")
        AppointmentStatus appointmentStatus
) {
}
