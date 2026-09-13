package py.com.clinia.api.mapper;

import py.com.clinia.api.dto.AppointmentItemResponse;
import py.com.clinia.api.dto.AppointmentResponse;
import py.com.clinia.api.entity.Appointment;
import py.com.clinia.api.entity.AppointmentItem;
import py.com.clinia.api.entity.Patient;
import py.com.clinia.api.entity.Professional;

import java.util.Comparator;
import java.util.List;

public final class AppointmentMapper {

    private AppointmentMapper() {
    }

    public static AppointmentResponse toResponse(Appointment appointment) {
        Patient patient = appointment.getPatient();
        Professional professional = appointment.getProfessional();
        List<AppointmentItemResponse> items = appointment.getItems().stream()
                .sorted(Comparator.comparing(AppointmentItem::getId, Comparator.nullsLast(Long::compareTo)))
                .map(AppointmentMapper::toItemResponse)
                .toList();

        return new AppointmentResponse(
                appointment.getId(),
                patient.getId(),
                patient.getFirstName() + " " + patient.getLastName(),
                patient.getDocumentNumber(),
                professional.getId(),
                professional.getFirstName() + " " + professional.getLastName(),
                appointment.getStartAt(),
                appointment.getEndAt(),
                appointment.getDurationMinutes(),
                appointment.getSubtotal(),
                appointment.getDiscountAmount(),
                appointment.getTotalAmount(),
                appointment.getDepositAmount(),
                appointment.getPaidAmount(),
                appointment.getBalanceAmount(),
                appointment.getAppointmentStatus(),
                appointment.getPaymentStatus(),
                appointment.getNotes(),
                appointment.getPromotionNameSnapshot(),
                items
        );
    }

    private static AppointmentItemResponse toItemResponse(AppointmentItem item) {
        return new AppointmentItemResponse(
                item.getId(),
                item.getService() == null ? null : item.getService().getId(),
                item.getServiceZone() == null ? null : item.getServiceZone().getId(),
                item.getNameSnapshot(),
                item.getDurationMinutes(),
                item.getUnitPriceSnapshot(),
                item.getQuantity(),
                item.getLineTotalSnapshot()
        );
    }
}
