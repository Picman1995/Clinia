package py.com.clinia.api.dto;

import py.com.clinia.api.enums.EntityStatus;

import java.math.BigDecimal;
import java.util.List;

public record TreatmentPackageResponse(
        Long id,
        Long patientId,
        String patientName,
        Long serviceId,
        String serviceName,
        String name,
        Integer totalSessions,
        Integer completedSessions,
        Integer remainingSessions,
        BigDecimal totalPrice,
        String notes,
        EntityStatus status,
        List<TreatmentSessionResponse> sessions
) {
}
