package py.com.clinia.api.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import py.com.clinia.api.dto.CompleteSessionRequest;
import py.com.clinia.api.dto.PatientHistoryResponse;
import py.com.clinia.api.dto.TreatmentPackageRequest;
import py.com.clinia.api.dto.TreatmentPackageResponse;
import py.com.clinia.api.dto.TreatmentSessionResponse;
import py.com.clinia.api.entity.Appointment;
import py.com.clinia.api.entity.Patient;
import py.com.clinia.api.entity.TreatmentPackage;
import py.com.clinia.api.entity.TreatmentSession;
import py.com.clinia.api.enums.AppointmentStatus;
import py.com.clinia.api.enums.EntityStatus;
import py.com.clinia.api.enums.SessionStatus;
import py.com.clinia.api.exception.BusinessException;
import py.com.clinia.api.exception.ResourceNotFoundException;
import py.com.clinia.api.mapper.AppointmentMapper;
import py.com.clinia.api.mapper.PaymentMapper;
import py.com.clinia.api.mapper.TreatmentPackageMapper;
import py.com.clinia.api.repository.AppointmentRepository;
import py.com.clinia.api.repository.PatientRepository;
import py.com.clinia.api.repository.PaymentRepository;
import py.com.clinia.api.repository.ServiceRepository;
import py.com.clinia.api.repository.TreatmentPackageRepository;
import py.com.clinia.api.repository.TreatmentSessionRepository;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class TreatmentPackageService {

    private final TreatmentPackageRepository treatmentPackageRepository;
    private final TreatmentSessionRepository treatmentSessionRepository;
    private final PatientRepository patientRepository;
    private final ServiceRepository serviceRepository;
    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;

    public TreatmentPackageService(
            TreatmentPackageRepository treatmentPackageRepository,
            TreatmentSessionRepository treatmentSessionRepository,
            PatientRepository patientRepository,
            ServiceRepository serviceRepository,
            AppointmentRepository appointmentRepository,
            PaymentRepository paymentRepository
    ) {
        this.treatmentPackageRepository = treatmentPackageRepository;
        this.treatmentSessionRepository = treatmentSessionRepository;
        this.patientRepository = patientRepository;
        this.serviceRepository = serviceRepository;
        this.appointmentRepository = appointmentRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public List<TreatmentPackageResponse> listByPatient(Long patientId, EntityStatus status) {
        return treatmentPackageRepository.findByPatient(patientId, status).stream()
                .map(TreatmentPackageMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TreatmentPackageResponse getById(Long id) {
        return TreatmentPackageMapper.toResponse(findDetailed(id));
    }

    public TreatmentPackageResponse create(TreatmentPackageRequest request) {
        Patient patient = patientRepository.findById(request.patientId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado"));
        if (patient.getStatus() != EntityStatus.ACTIVO) {
            throw new BusinessException("El paciente esta inactivo");
        }

        TreatmentPackage treatmentPackage = new TreatmentPackage();
        treatmentPackage.setPatient(patient);
        treatmentPackage.setName(request.name().trim());
        treatmentPackage.setTotalSessions(request.totalSessions());
        treatmentPackage.setCompletedSessions(0);
        treatmentPackage.setTotalPrice(AppointmentBalanceSupport.money(request.totalPrice()));
        treatmentPackage.setNotes(normalize(request.notes()));

        if (request.serviceId() != null) {
            py.com.clinia.api.entity.Service service = serviceRepository.findDetailedById(request.serviceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Servicio no encontrado"));
            if (service.getStatus() != EntityStatus.ACTIVO) {
                throw new BusinessException("El servicio esta inactivo");
            }
            treatmentPackage.setService(service);
        }

        List<TreatmentSession> sessions = new ArrayList<>();
        for (int number = 1; number <= request.totalSessions(); number++) {
            TreatmentSession session = new TreatmentSession();
            session.setTreatmentPackage(treatmentPackage);
            session.setSessionNumber(number);
            session.setSessionStatus(SessionStatus.PENDIENTE);
            sessions.add(session);
        }
        treatmentPackage.getSessions().addAll(sessions);

        return TreatmentPackageMapper.toResponse(treatmentPackageRepository.save(treatmentPackage));
    }

    public TreatmentPackageResponse deactivate(Long id) {
        TreatmentPackage treatmentPackage = findDetailed(id);
        treatmentPackage.setStatus(EntityStatus.INACTIVO);
        return TreatmentPackageMapper.toResponse(treatmentPackageRepository.save(treatmentPackage));
    }

    public TreatmentSessionResponse completeSession(Long sessionId, CompleteSessionRequest request) {
        TreatmentSession session = treatmentSessionRepository.findDetailedById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Sesion no encontrada"));
        complete(session, request.appointmentId(), request.notes());
        return TreatmentPackageMapper.toSessionResponse(session);
    }

    public TreatmentSessionResponse cancelSession(Long sessionId) {
        TreatmentSession session = treatmentSessionRepository.findDetailedById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Sesion no encontrada"));
        if (session.getSessionStatus() == SessionStatus.REALIZADA) {
            throw new BusinessException("No se puede cancelar una sesion ya realizada");
        }
        session.setSessionStatus(SessionStatus.CANCELADA);
        treatmentSessionRepository.save(session);
        refreshCompletedCount(session.getTreatmentPackage());
        return TreatmentPackageMapper.toSessionResponse(session);
    }

    public TreatmentSessionResponse completeNextPending(Long packageId, Long appointmentId, String notes) {
        TreatmentPackage treatmentPackage = findDetailed(packageId);
        if (treatmentPackage.getStatus() != EntityStatus.ACTIVO) {
            throw new BusinessException("El paquete esta inactivo");
        }
        TreatmentSession session = treatmentPackage.getSessions().stream()
                .filter(item -> item.getSessionStatus() == SessionStatus.PENDIENTE)
                .min(Comparator.comparing(TreatmentSession::getSessionNumber))
                .orElseThrow(() -> new BusinessException("No hay sesiones pendientes en el paquete"));
        complete(session, appointmentId, notes);
        return TreatmentPackageMapper.toSessionResponse(session);
    }

    @Transactional(readOnly = true)
    public PatientHistoryResponse history(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado"));

        OffsetDateTime now = OffsetDateTime.now();
        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);

        List<py.com.clinia.api.dto.AppointmentResponse> upcoming = appointments.stream()
                .filter(item -> !item.getStartAt().isBefore(now))
                .filter(item -> item.getAppointmentStatus() != AppointmentStatus.CANCELADA)
                .sorted(Comparator.comparing(Appointment::getStartAt))
                .limit(20)
                .map(AppointmentMapper::toResponse)
                .toList();

        List<py.com.clinia.api.dto.AppointmentResponse> recent = appointments.stream()
                .filter(item -> item.getStartAt().isBefore(now))
                .sorted(Comparator.comparing(Appointment::getStartAt).reversed())
                .limit(20)
                .map(AppointmentMapper::toResponse)
                .toList();

        return new PatientHistoryResponse(
                patient.getId(),
                patient.getFirstName() + " " + patient.getLastName(),
                listByPatient(patientId, null),
                upcoming,
                recent,
                paymentRepository.findByPatient(patientId, EntityStatus.ACTIVO).stream()
                        .limit(20)
                        .map(PaymentMapper::toResponse)
                        .toList()
        );
    }

    private void complete(TreatmentSession session, Long appointmentId, String notes) {
        TreatmentPackage treatmentPackage = session.getTreatmentPackage();
        if (treatmentPackage.getStatus() != EntityStatus.ACTIVO) {
            throw new BusinessException("El paquete esta inactivo");
        }
        if (session.getSessionStatus() == SessionStatus.REALIZADA) {
            throw new BusinessException("La sesion ya fue registrada como realizada");
        }
        if (session.getSessionStatus() == SessionStatus.CANCELADA) {
            throw new BusinessException("La sesion esta cancelada");
        }

        long completed = treatmentPackage.getSessions().stream()
                .filter(item -> item.getSessionStatus() == SessionStatus.REALIZADA)
                .count();
        if (completed >= treatmentPackage.getTotalSessions()) {
            throw new BusinessException("No se pueden consumir mas sesiones de las contratadas");
        }

        if (appointmentId != null) {
            if (treatmentSessionRepository.existsByAppointmentAndStatus(appointmentId, SessionStatus.REALIZADA)) {
                throw new BusinessException("La cita ya tiene una sesion consumida");
            }
            Appointment appointment = appointmentRepository.findDetailedById(appointmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada"));
            if (!appointment.getPatient().getId().equals(treatmentPackage.getPatient().getId())) {
                throw new BusinessException("La cita no pertenece al paciente del paquete");
            }
            session.setAppointment(appointment);
        }

        session.setSessionStatus(SessionStatus.REALIZADA);
        session.setPerformedAt(OffsetDateTime.now());
        session.setNotes(normalize(notes));
        treatmentSessionRepository.save(session);
        refreshCompletedCount(treatmentPackage);
    }

    private void refreshCompletedCount(TreatmentPackage treatmentPackage) {
        int completed = (int) treatmentPackage.getSessions().stream()
                .filter(session -> session.getSessionStatus() == SessionStatus.REALIZADA)
                .count();
        treatmentPackage.setCompletedSessions(completed);
        treatmentPackageRepository.save(treatmentPackage);
    }

    private TreatmentPackage findDetailed(Long id) {
        return treatmentPackageRepository.findDetailedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paquete no encontrado"));
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
