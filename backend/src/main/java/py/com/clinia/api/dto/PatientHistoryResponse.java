package py.com.clinia.api.dto;

import java.util.List;

public record PatientHistoryResponse(
        Long patientId,
        String patientName,
        List<TreatmentPackageResponse> packages,
        List<AppointmentResponse> upcomingAppointments,
        List<AppointmentResponse> recentAppointments,
        List<PaymentResponse> recentPayments
) {
}
