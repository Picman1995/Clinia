package py.com.clinia.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import py.com.clinia.api.enums.PaymentType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PaymentRequest(
        @NotNull(message = "La cita es obligatoria")
        Long appointmentId,

        @NotNull(message = "El monto es obligatorio")
        @DecimalMin(value = "1", inclusive = true, message = "El monto debe ser mayor a 0")
        BigDecimal amount,

        @NotNull(message = "El tipo de pago es obligatorio")
        PaymentType paymentType,

        OffsetDateTime paidAt,

        @Size(max = 500)
        String notes
) {
}
