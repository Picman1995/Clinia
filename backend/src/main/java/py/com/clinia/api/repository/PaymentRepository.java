package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import py.com.clinia.api.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
