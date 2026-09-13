package py.com.clinia.api.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import py.com.clinia.api.dto.AppointmentItemRequest;
import py.com.clinia.api.dto.AppointmentRequest;
import py.com.clinia.api.dto.AppointmentResponse;
import py.com.clinia.api.dto.AppointmentStatusRequest;
import py.com.clinia.api.entity.Appointment;
import py.com.clinia.api.entity.AppointmentItem;
import py.com.clinia.api.entity.Patient;
import py.com.clinia.api.entity.Professional;
import py.com.clinia.api.entity.ServiceZone;
import py.com.clinia.api.enums.AppointmentStatus;
import py.com.clinia.api.enums.EntityStatus;
import py.com.clinia.api.enums.PaymentStatus;
import py.com.clinia.api.exception.BusinessException;
import py.com.clinia.api.exception.ResourceNotFoundException;
import py.com.clinia.api.mapper.AppointmentMapper;
import py.com.clinia.api.repository.AppointmentRepository;
import py.com.clinia.api.repository.PatientRepository;
import py.com.clinia.api.repository.ProfessionalRepository;
import py.com.clinia.api.repository.ServiceRepository;
import py.com.clinia.api.repository.ServiceZoneRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;

@Service
@Transactional
public class AppointmentService {

    private static final List<AppointmentStatus> BLOCKING_STATUSES = List.copyOf(
            EnumSet.of(AppointmentStatus.PENDIENTE, AppointmentStatus.CONFIRMADA, AppointmentStatus.ATENDIDA)
    );

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final ProfessionalRepository professionalRepository;
    private final ServiceRepository serviceRepository;
    private final ServiceZoneRepository serviceZoneRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            ProfessionalRepository professionalRepository,
            ServiceRepository serviceRepository,
            ServiceZoneRepository serviceZoneRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.professionalRepository = professionalRepository;
        this.serviceRepository = serviceRepository;
        this.serviceZoneRepository = serviceZoneRepository;
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> list(OffsetDateTime from, OffsetDateTime to, Long professionalId) {
        if (from == null || to == null) {
            throw new BusinessException("Debes indicar el rango de fechas from y to");
        }
        if (!from.isBefore(to)) {
            throw new BusinessException("El rango de fechas es invalido");
        }
        return appointmentRepository.findInRange(from, to, professionalId).stream()
                .map(AppointmentMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getById(Long id) {
        return AppointmentMapper.toResponse(findDetailed(id));
    }

    public AppointmentResponse create(AppointmentRequest request) {
        Patient patient = findActivePatient(request.patientId());
        Professional professional = resolveProfessional(request.professionalId());
        BuiltItems built = buildItems(request.items());

        OffsetDateTime startAt = request.startAt();
        OffsetDateTime endAt = startAt.plusMinutes(built.durationMinutes());
        ensureNoOverlap(professional.getId(), startAt, endAt, null);

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setProfessional(professional);
        appointment.setStartAt(startAt);
        appointment.setEndAt(endAt);
        appointment.setDurationMinutes(built.durationMinutes());
        appointment.setSubtotal(built.subtotal());
        appointment.setDiscountAmount(BigDecimal.ZERO);
        appointment.setTotalAmount(built.subtotal());
        applyDeposit(appointment, money(request.depositAmount()));
        appointment.setNotes(normalize(request.notes()));
        appointment.setAppointmentStatus(AppointmentStatus.PENDIENTE);

        for (AppointmentItem item : built.items()) {
            item.setAppointment(appointment);
            appointment.getItems().add(item);
        }

        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    public AppointmentResponse updateStatus(Long id, AppointmentStatusRequest request) {
        Appointment appointment = findDetailed(id);
        AppointmentStatus next = request.appointmentStatus();
        AppointmentStatus current = appointment.getAppointmentStatus();

        if (current == AppointmentStatus.CANCELADA && next != AppointmentStatus.CANCELADA) {
            ensureNoOverlap(
                    appointment.getProfessional().getId(),
                    appointment.getStartAt(),
                    appointment.getEndAt(),
                    appointment.getId()
            );
        }

        appointment.setAppointmentStatus(next);
        return AppointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    private BuiltItems buildItems(List<AppointmentItemRequest> requests) {
        List<AppointmentItem> items = new ArrayList<>();
        int durationMinutes = 0;
        BigDecimal subtotal = BigDecimal.ZERO;

        for (AppointmentItemRequest request : requests) {
            if (request.serviceId() == null && request.serviceZoneId() == null) {
                throw new BusinessException("Debe indicar un servicio o una zona");
            }
            int quantity = request.quantity() == null ? 1 : request.quantity();
            AppointmentItem item = new AppointmentItem();
            item.setQuantity(quantity);

            if (request.serviceZoneId() != null) {
                ServiceZone zone = serviceZoneRepository.findDetailedById(request.serviceZoneId())
                        .orElseThrow(() -> new ResourceNotFoundException("Zona no encontrada"));
                ensureActive(zone.getStatus(), "La zona esta inactiva");
                ensureActive(zone.getService().getStatus(), "El servicio de la zona esta inactivo");
                if (request.serviceId() != null && !request.serviceId().equals(zone.getService().getId())) {
                    throw new BusinessException("La zona no pertenece al servicio indicado");
                }
                item.setServiceZone(zone);
                item.setService(zone.getService());
                item.setNameSnapshot(zone.getName());
                item.setDurationMinutes(zone.getDurationMinutes() * quantity);
                item.setUnitPriceSnapshot(money(zone.getPrice()));
            } else {
                py.com.clinia.api.entity.Service service = serviceRepository.findDetailedById(request.serviceId())
                        .orElseThrow(() -> new ResourceNotFoundException("Servicio no encontrado"));
                ensureActive(service.getStatus(), "El servicio esta inactivo");
                item.setService(service);
                item.setNameSnapshot(service.getName());
                item.setDurationMinutes(service.getDurationMinutes() * quantity);
                item.setUnitPriceSnapshot(money(service.getPrice()));
            }

            BigDecimal lineTotal = item.getUnitPriceSnapshot().multiply(BigDecimal.valueOf(quantity));
            item.setLineTotalSnapshot(money(lineTotal));
            durationMinutes += item.getDurationMinutes();
            subtotal = subtotal.add(item.getLineTotalSnapshot());
            items.add(item);
        }

        if (durationMinutes <= 0) {
            throw new BusinessException("La duracion calculada es invalida");
        }

        return new BuiltItems(items, durationMinutes, money(subtotal));
    }

    private void applyDeposit(Appointment appointment, BigDecimal depositAmount) {
        BigDecimal total = appointment.getTotalAmount();
        if (depositAmount.compareTo(total) > 0) {
            throw new BusinessException("La sena no puede superar el total");
        }
        appointment.setDepositAmount(depositAmount);
        appointment.setPaidAmount(depositAmount);
        appointment.setBalanceAmount(money(total.subtract(depositAmount)));

        if (depositAmount.compareTo(BigDecimal.ZERO) == 0) {
            appointment.setPaymentStatus(PaymentStatus.PENDIENTE);
        } else if (depositAmount.compareTo(total) == 0) {
            appointment.setPaymentStatus(PaymentStatus.PAGADO);
        } else {
            appointment.setPaymentStatus(PaymentStatus.SENIA_PAGADA);
        }
    }

    private void ensureNoOverlap(Long professionalId, OffsetDateTime startAt, OffsetDateTime endAt, Long excludeId) {
        boolean overlap = appointmentRepository.existsOverlap(
                professionalId,
                startAt,
                endAt,
                excludeId,
                BLOCKING_STATUSES
        );
        if (overlap) {
            throw new BusinessException("El horario se solapa con otra cita del profesional");
        }
    }

    private Patient findActivePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado"));
        ensureActive(patient.getStatus(), "El paciente esta inactivo");
        return patient;
    }

    private Professional resolveProfessional(Long professionalId) {
        Professional professional;
        if (professionalId == null) {
            professional = professionalRepository.findFirstByDefaultProfessionalTrue()
                    .orElseThrow(() -> new ResourceNotFoundException("No hay profesional por defecto"));
        } else {
            professional = professionalRepository.findById(professionalId)
                    .orElseThrow(() -> new ResourceNotFoundException("Profesional no encontrado"));
        }
        ensureActive(professional.getStatus(), "El profesional esta inactivo");
        return professional;
    }

    private Appointment findDetailed(Long id) {
        return appointmentRepository.findDetailedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada"));
    }

    private void ensureActive(EntityStatus status, String message) {
        if (status != EntityStatus.ACTIVO) {
            throw new BusinessException(message);
        }
    }

    private BigDecimal money(BigDecimal value) {
        return value.setScale(0, RoundingMode.HALF_UP);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private record BuiltItems(List<AppointmentItem> items, int durationMinutes, BigDecimal subtotal) {
    }
}
