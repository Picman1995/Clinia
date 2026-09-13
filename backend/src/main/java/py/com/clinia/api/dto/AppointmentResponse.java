package py.com.clinia.api.dto;

import py.com.clinia.api.enums.AppointmentStatus;
import py.com.clinia.api.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record AppointmentResponse(
        Long id,
        Long patientId,
        String patientName,
        String patientDocument,
        Long professionalId,
        String professionalName,
        OffsetDateTime startAt,
        OffsetDateTime endAt,
        Integer durationMinutes,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal totalAmount,
        BigDecimal depositAmount,
        BigDecimal paidAmount,
        BigDecimal balanceAmount,
        AppointmentStatus appointmentStatus,
        PaymentStatus paymentStatus,
        String notes,
        String promotionNameSnapshot,
        List<AppointmentItemResponse> items
) {
}
