package py.com.clinia.api.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import py.com.clinia.api.dto.DashboardResponse;
import py.com.clinia.api.dto.ReportResponse;
import py.com.clinia.api.entity.Appointment;
import py.com.clinia.api.entity.AppointmentItem;
import py.com.clinia.api.entity.Payment;
import py.com.clinia.api.entity.Professional;
import py.com.clinia.api.enums.AppointmentStatus;
import py.com.clinia.api.enums.EntityStatus;
import py.com.clinia.api.enums.PaymentType;
import py.com.clinia.api.enums.ServiceCategoryType;
import py.com.clinia.api.exception.BusinessException;
import py.com.clinia.api.repository.AppointmentRepository;
import py.com.clinia.api.repository.PaymentRepository;
import py.com.clinia.api.repository.ProfessionalRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class ReportService {

    private static final ZoneId ZONE = ZoneId.of("America/Asuncion");
    private static final List<AppointmentStatus> EXCLUDED_BALANCES = List.of(AppointmentStatus.CANCELADA);

    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;
    private final ProfessionalRepository professionalRepository;
    private final SettingsService settingsService;

    public ReportService(
            AppointmentRepository appointmentRepository,
            PaymentRepository paymentRepository,
            ProfessionalRepository professionalRepository,
            SettingsService settingsService
    ) {
        this.appointmentRepository = appointmentRepository;
        this.paymentRepository = paymentRepository;
        this.professionalRepository = professionalRepository;
        this.settingsService = settingsService;
    }

    public DashboardResponse dashboard(LocalDate date) {
        LocalDate target = date == null ? LocalDate.now(ZONE) : date;
        OffsetDateTime from = target.atStartOfDay(ZONE).toOffsetDateTime();
        OffsetDateTime to = target.plusDays(1).atStartOfDay(ZONE).toOffsetDateTime();

        List<Appointment> appointments = appointmentRepository.findDetailedInStartRange(from, to);
        List<Payment> payments = paymentRepository.findInPaidRange(from, to, EntityStatus.ACTIVO);

        Set<Long> patients = new HashSet<>();
        long servicesToday = 0;
        for (Appointment appointment : appointments) {
            if (appointment.getAppointmentStatus() == AppointmentStatus.CANCELADA) {
                continue;
            }
            patients.add(appointment.getPatient().getId());
            if (appointment.getAppointmentStatus() == AppointmentStatus.ATENDIDA) {
                servicesToday += appointment.getItems().size();
            }
        }

        BigDecimal incomeToday = payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal depositsToday = payments.stream()
                .filter(payment -> payment.getPaymentType() == PaymentType.SENIA)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String professionalName = professionalRepository.findFirstByDefaultProfessionalTrue()
                .map(this::fullName)
                .orElse("Sin profesional");

        return new DashboardResponse(
                target,
                appointments.stream().filter(a -> a.getAppointmentStatus() != AppointmentStatus.CANCELADA).count(),
                patients.size(),
                servicesToday,
                AppointmentBalanceSupport.money(incomeToday),
                AppointmentBalanceSupport.money(depositsToday),
                AppointmentBalanceSupport.money(nullToZero(appointmentRepository.sumPendingBalances(EXCLUDED_BALANCES))),
                appointmentRepository.countWithPendingDepositBalance(EXCLUDED_BALANCES),
                professionalName
        );
    }

    public ReportResponse report(OffsetDateTime from, OffsetDateTime to) {
        if (from == null || to == null) {
            throw new BusinessException("Debes indicar from y to");
        }
        if (!from.isBefore(to)) {
            throw new BusinessException("El rango de fechas es invalido");
        }

        List<Appointment> appointments = appointmentRepository.findDetailedInStartRange(from, to);
        List<Payment> payments = paymentRepository.findInPaidRange(from, to, EntityStatus.ACTIVO);

        Set<Long> patientsAttended = new HashSet<>();
        long servicesPerformed = 0;
        long appointmentsAttended = 0;
        long promotionsApplied = 0;
        BigDecimal incomeDepilation = BigDecimal.ZERO;
        BigDecimal incomeAesthetics = BigDecimal.ZERO;

        for (Appointment appointment : appointments) {
            if (appointment.getAppointmentStatus() != AppointmentStatus.ATENDIDA) {
                continue;
            }
            appointmentsAttended++;
            patientsAttended.add(appointment.getPatient().getId());
            servicesPerformed += appointment.getItems().size();
            if (appointment.getPromotionNameSnapshot() != null && !appointment.getPromotionNameSnapshot().isBlank()) {
                promotionsApplied++;
            }

            CategorySplit split = splitIncome(appointment);
            incomeDepilation = incomeDepilation.add(split.depilation());
            incomeAesthetics = incomeAesthetics.add(split.aesthetics());
        }

        BigDecimal incomeTotal = incomeDepilation.add(incomeAesthetics);
        BigDecimal depositsReceived = payments.stream()
                .filter(payment -> payment.getPaymentType() == PaymentType.SENIA)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal paymentsReceived = payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal ownerPercentage = settingsService.ownerCommissionPercentage();
        BigDecimal ownerShare = incomeTotal
                .multiply(ownerPercentage)
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
        BigDecimal remainingShare = incomeTotal.subtract(ownerShare);

        return new ReportResponse(
                from,
                to,
                patientsAttended.size(),
                servicesPerformed,
                appointmentsAttended,
                promotionsApplied,
                AppointmentBalanceSupport.money(incomeDepilation),
                AppointmentBalanceSupport.money(incomeAesthetics),
                AppointmentBalanceSupport.money(incomeTotal),
                AppointmentBalanceSupport.money(depositsReceived),
                AppointmentBalanceSupport.money(paymentsReceived),
                AppointmentBalanceSupport.money(nullToZero(appointmentRepository.sumPendingBalances(EXCLUDED_BALANCES))),
                ownerPercentage,
                AppointmentBalanceSupport.money(ownerShare),
                AppointmentBalanceSupport.money(remainingShare)
        );
    }

    private CategorySplit splitIncome(Appointment appointment) {
        BigDecimal depilationLines = BigDecimal.ZERO;
        BigDecimal aestheticsLines = BigDecimal.ZERO;

        for (AppointmentItem item : appointment.getItems()) {
            ServiceCategoryType type = resolveType(item);
            BigDecimal line = item.getLineTotalSnapshot() == null ? BigDecimal.ZERO : item.getLineTotalSnapshot();
            if (type == ServiceCategoryType.ESTETICA) {
                aestheticsLines = aestheticsLines.add(line);
            } else {
                depilationLines = depilationLines.add(line);
            }
        }

        BigDecimal linesTotal = depilationLines.add(aestheticsLines);
        BigDecimal appointmentTotal = appointment.getTotalAmount() == null ? BigDecimal.ZERO : appointment.getTotalAmount();

        if (linesTotal.compareTo(BigDecimal.ZERO) == 0) {
            return new CategorySplit(BigDecimal.ZERO, appointmentTotal);
        }

        BigDecimal depilationShare = appointmentTotal
                .multiply(depilationLines)
                .divide(linesTotal, 0, RoundingMode.HALF_UP);
        BigDecimal aestheticsShare = appointmentTotal.subtract(depilationShare);
        return new CategorySplit(depilationShare, aestheticsShare);
    }

    private ServiceCategoryType resolveType(AppointmentItem item) {
        if (item.getService() != null && item.getService().getCategory() != null) {
            return item.getService().getCategory().getType();
        }
        if (item.getServiceZone() != null
                && item.getServiceZone().getService() != null
                && item.getServiceZone().getService().getCategory() != null) {
            return item.getServiceZone().getService().getCategory().getType();
        }
        return ServiceCategoryType.DEPILACION;
    }

    private BigDecimal nullToZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String fullName(Professional professional) {
        return professional.getFirstName() + " " + professional.getLastName();
    }

    private record CategorySplit(BigDecimal depilation, BigDecimal aesthetics) {
    }
}
