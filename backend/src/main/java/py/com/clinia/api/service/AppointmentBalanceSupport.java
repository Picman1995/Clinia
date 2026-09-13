package py.com.clinia.api.service;

import py.com.clinia.api.entity.Appointment;
import py.com.clinia.api.enums.PaymentStatus;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class AppointmentBalanceSupport {

    private AppointmentBalanceSupport() {
    }

    public static void recalculate(Appointment appointment, BigDecimal paidAmount) {
        BigDecimal total = money(appointment.getTotalAmount());
        BigDecimal paid = money(paidAmount);
        if (paid.compareTo(BigDecimal.ZERO) < 0) {
            paid = BigDecimal.ZERO;
        }
        if (paid.compareTo(total) > 0) {
            paid = total;
        }

        appointment.setPaidAmount(paid);
        appointment.setBalanceAmount(money(total.subtract(paid)));
        appointment.setPaymentStatus(resolveStatus(appointment.getDepositAmount(), total, paid));
    }

    public static PaymentStatus resolveStatus(BigDecimal depositAmount, BigDecimal total, BigDecimal paid) {
        BigDecimal deposit = money(depositAmount == null ? BigDecimal.ZERO : depositAmount);
        BigDecimal safeTotal = money(total);
        BigDecimal safePaid = money(paid);

        if (safePaid.compareTo(BigDecimal.ZERO) == 0) {
            return PaymentStatus.PENDIENTE;
        }
        if (safePaid.compareTo(safeTotal) >= 0) {
            return PaymentStatus.PAGADO;
        }
        if (deposit.compareTo(BigDecimal.ZERO) > 0 && safePaid.compareTo(deposit) == 0) {
            return PaymentStatus.SENIA_PAGADA;
        }
        return PaymentStatus.PAGO_PARCIAL;
    }

    public static BigDecimal money(BigDecimal value) {
        return value.setScale(0, RoundingMode.HALF_UP);
    }
}
