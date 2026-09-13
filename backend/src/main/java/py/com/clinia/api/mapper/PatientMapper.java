package py.com.clinia.api.mapper;

import py.com.clinia.api.dto.PatientRequest;
import py.com.clinia.api.dto.PatientResponse;
import py.com.clinia.api.entity.Patient;

import java.time.OffsetDateTime;

public final class PatientMapper {

    private PatientMapper() {
    }

    public static PatientResponse toResponse(Patient patient) {
        return new PatientResponse(
                patient.getId(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getDocumentNumber(),
                patient.getPhone(),
                patient.getEmail(),
                patient.getBirthDate(),
                patient.getAddress(),
                patient.getNotes(),
                patient.getRegisteredAt(),
                patient.getStatus()
        );
    }

    public static void apply(Patient patient, PatientRequest request) {
        patient.setFirstName(request.firstName().trim());
        patient.setLastName(request.lastName().trim());
        patient.setDocumentNumber(request.documentNumber().trim());
        patient.setPhone(normalize(request.phone()));
        patient.setEmail(normalize(request.email()));
        patient.setBirthDate(request.birthDate());
        patient.setAddress(normalize(request.address()));
        patient.setNotes(normalize(request.notes()));
    }

    public static Patient toEntity(PatientRequest request) {
        Patient patient = new Patient();
        apply(patient, request);
        patient.setRegisteredAt(OffsetDateTime.now());
        return patient;
    }

    private static String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
