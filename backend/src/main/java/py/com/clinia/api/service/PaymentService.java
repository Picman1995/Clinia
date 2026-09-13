package py.com.clinia.api.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import py.com.clinia.api.dto.PaymentRequest;
import py.com.clinia.api.dto.PaymentResponse;
import py.com.clinia.api.entity.Appointment;
import py.com.clinia.api.entity.Payment;
import py.com.clinia.api.enums.AppointmentStatus;
import py.com.clinia.api.enums.EntityStatus;
import py.com.clinia.api.enums.PaymentType;
import py.com.clinia.api.exception.BusinessException;
import py.com.clinia.api.exception.ResourceNotFoundException;
import py.com.clinia.api.mapper.PaymentMapper;
import py.com.clinia.api.repository.AppointmentRepository;
import py.com.clinia.api.repository.PaymentRepository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;

    public PaymentService(PaymentRepository paymentRepository, AppointmentRepository appointmentRepository) {
        this.paymentRepository = paymentRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> listByAppointment(Long appointmentId) {
        return paymentRepository.findByAppointment(appointmentId, EntityStatus.ACTIVO).stream()
                .map(PaymentMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> listByPatient(Long patientId) {
        return paymentRepository.findByPatient(patientId, EntityStatus.ACTIVO).stream()
                .map(PaymentMapper::toResponse)
                .toList();
    }

    public PaymentResponse create(PaymentRequest request) {
        Appointment appointment = appointmentRepository.findDetailedById(request.appointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada"));

        if (appointment.getAppointmentStatus() == AppointmentStatus.CANCELADA) {
            throw new BusinessException("No se pueden registrar pagos en una cita cancelada");
        }

        BigDecimal amount = AppointmentBalanceSupport.money(request.amount());
        BigDecimal currentPaid = sumActivePayments(appointment.getId());
        BigDecimal remaining = AppointmentBalanceSupport.money(
                appointment.getTotalAmount().subtract(currentPaid)
        );
        if (amount.compareTo(remaining) > 0) {
            throw new BusinessException("El pago supera el saldo pendiente");
        }

        PaymentType type = request.paymentType();
        if (type == PaymentType.SENIA && currentPaid.compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("La sena ya fue registrada para esta cita");
        }

        Payment payment = new Payment();
        payment.setAppointment(appointment);
        payment.setPatient(appointment.getPatient());
        payment.setAmount(amount);
        payment.setPaymentType(type);
        payment.setPaidAt(request.paidAt() == null ? OffsetDateTime.now() : request.paidAt());
        payment.setNotes(normalize(request.notes()));
        paymentRepository.save(payment);

        BigDecimal newPaid = currentPaid.add(amount);
        if (appointment.getDepositAmount().compareTo(BigDecimal.ZERO) == 0 && type == PaymentType.SENIA) {
            appointment.setDepositAmount(amount);
        }
        AppointmentBalanceSupport.recalculate(appointment, newPaid);
        appointmentRepository.save(appointment);

        return PaymentMapper.toResponse(payment);
    }

    public PaymentResponse deactivate(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado"));
        payment.setStatus(EntityStatus.INACTIVO);
        paymentRepository.save(payment);

        Appointment appointment = appointmentRepository.findDetailedById(payment.getAppointment().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada"));
        BigDecimal paid = sumActivePayments(appointment.getId());
        AppointmentBalanceSupport.recalculate(appointment, paid);
        if (payment.getPaymentType() == PaymentType.SENIA
                && appointment.getDepositAmount().compareTo(payment.getAmount()) == 0) {
            appointment.setDepositAmount(BigDecimal.ZERO);
        }
        appointmentRepository.save(appointment);
        return PaymentMapper.toResponse(payment);
    }

    private BigDecimal sumActivePayments(Long appointmentId) {
        return paymentRepository.findByAppointment(appointmentId, EntityStatus.ACTIVO).stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
