package py.com.clinia.api.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ReportResponse(
        OffsetDateTime from,
        OffsetDateTime to,
        long patientsAttended,
        long servicesPerformed,
        long appointmentsAttended,
        long promotionsApplied,
        BigDecimal incomeDepilation,
        BigDecimal incomeAesthetics,
        BigDecimal incomeTotal,
        BigDecimal depositsReceived,
        BigDecimal paymentsReceived,
        BigDecimal pendingBalances,
        BigDecimal ownerCommissionPercentage,
        BigDecimal ownerShare,
        BigDecimal remainingShare
) {
}
