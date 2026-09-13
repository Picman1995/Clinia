package py.com.clinia.api.dto;

import py.com.clinia.api.enums.EntityStatus;
import py.com.clinia.api.enums.PaymentType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PaymentResponse(
        Long id,
        Long appointmentId,
        Long patientId,
        String patientName,
        BigDecimal amount,
        PaymentType paymentType,
        OffsetDateTime paidAt,
        String notes,
        EntityStatus status
) {
}
