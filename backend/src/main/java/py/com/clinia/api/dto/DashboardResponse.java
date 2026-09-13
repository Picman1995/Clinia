package py.com.clinia.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record DashboardResponse(
        LocalDate date,
        long appointmentsToday,
        long patientsToday,
        long servicesToday,
        BigDecimal incomeToday,
        BigDecimal depositsToday,
        BigDecimal pendingBalances,
        long pendingDepositAppointments,
        String professionalName
) {
}
