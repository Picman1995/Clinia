package py.com.clinia.api.mapper;

import py.com.clinia.api.dto.TreatmentPackageResponse;
import py.com.clinia.api.dto.TreatmentSessionResponse;
import py.com.clinia.api.entity.TreatmentPackage;
import py.com.clinia.api.entity.TreatmentSession;
import py.com.clinia.api.enums.SessionStatus;

import java.util.Comparator;
import java.util.List;

public final class TreatmentPackageMapper {

    private TreatmentPackageMapper() {
    }

    public static TreatmentPackageResponse toResponse(TreatmentPackage treatmentPackage) {
        List<TreatmentSessionResponse> sessions = treatmentPackage.getSessions().stream()
                .sorted(Comparator.comparing(TreatmentSession::getSessionNumber))
                .map(TreatmentPackageMapper::toSessionResponse)
                .toList();

        int completed = (int) treatmentPackage.getSessions().stream()
                .filter(session -> session.getSessionStatus() == SessionStatus.REALIZADA)
                .count();
        int remaining = Math.max(treatmentPackage.getTotalSessions() - completed, 0);

        return new TreatmentPackageResponse(
                treatmentPackage.getId(),
                treatmentPackage.getPatient().getId(),
                treatmentPackage.getPatient().getFirstName() + " " + treatmentPackage.getPatient().getLastName(),
                treatmentPackage.getService() == null ? null : treatmentPackage.getService().getId(),
                treatmentPackage.getService() == null ? null : treatmentPackage.getService().getName(),
                treatmentPackage.getName(),
                treatmentPackage.getTotalSessions(),
                completed,
                remaining,
                treatmentPackage.getTotalPrice(),
                treatmentPackage.getNotes(),
                treatmentPackage.getStatus(),
                sessions
        );
    }

    public static TreatmentSessionResponse toSessionResponse(TreatmentSession session) {
        return new TreatmentSessionResponse(
                session.getId(),
                session.getSessionNumber(),
                session.getSessionStatus(),
                session.getPerformedAt(),
                session.getAppointment() == null ? null : session.getAppointment().getId(),
                session.getNotes()
        );
    }
}
