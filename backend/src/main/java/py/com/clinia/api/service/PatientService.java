package py.com.clinia.api.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import py.com.clinia.api.dto.PatientRequest;
import py.com.clinia.api.dto.PatientResponse;
import py.com.clinia.api.entity.Patient;
import py.com.clinia.api.enums.EntityStatus;
import py.com.clinia.api.exception.BusinessException;
import py.com.clinia.api.exception.ResourceNotFoundException;
import py.com.clinia.api.mapper.PatientMapper;
import py.com.clinia.api.repository.PatientRepository;

import java.util.List;

@Service
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Transactional(readOnly = true)
    public List<PatientResponse> search(String q, EntityStatus status) {
        String query = q == null ? null : q.trim();
        return patientRepository.search(query, status).stream()
                .map(PatientMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PatientResponse getById(Long id) {
        return PatientMapper.toResponse(findActiveOrAny(id));
    }

    public PatientResponse create(PatientRequest request) {
        if (patientRepository.existsByDocumentNumberIgnoreCase(request.documentNumber().trim())) {
            throw new BusinessException("Ya existe un paciente con ese documento");
        }
        Patient patient = PatientMapper.toEntity(request);
        return PatientMapper.toResponse(patientRepository.save(patient));
    }

    public PatientResponse update(Long id, PatientRequest request) {
        Patient patient = findActiveOrAny(id);
        String document = request.documentNumber().trim();
        if (patientRepository.existsByDocumentNumberIgnoreCaseAndIdNot(document, id)) {
            throw new BusinessException("Ya existe un paciente con ese documento");
        }
        PatientMapper.apply(patient, request);
        return PatientMapper.toResponse(patientRepository.save(patient));
    }

    public PatientResponse deactivate(Long id) {
        Patient patient = findActiveOrAny(id);
        patient.setStatus(EntityStatus.INACTIVO);
        return PatientMapper.toResponse(patientRepository.save(patient));
    }

    public PatientResponse activate(Long id) {
        Patient patient = findActiveOrAny(id);
        patient.setStatus(EntityStatus.ACTIVO);
        return PatientMapper.toResponse(patientRepository.save(patient));
    }

    private Patient findActiveOrAny(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado"));
    }
}
