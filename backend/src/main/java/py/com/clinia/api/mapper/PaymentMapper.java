package py.com.clinia.api.mapper;

import py.com.clinia.api.dto.PaymentResponse;
import py.com.clinia.api.entity.Payment;

public final class PaymentMapper {

    private PaymentMapper() {
    }

    public static PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getAppointment().getId(),
                payment.getPatient().getId(),
                payment.getPatient().getFirstName() + " " + payment.getPatient().getLastName(),
                payment.getAmount(),
                payment.getPaymentType(),
                payment.getPaidAt(),
                payment.getNotes(),
                payment.getStatus()
        );
    }
}
