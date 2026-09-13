package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import py.com.clinia.api.entity.Payment;
import py.com.clinia.api.enums.EntityStatus;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("""
            SELECT p FROM Payment p
            JOIN FETCH p.patient
            JOIN FETCH p.appointment
            WHERE p.appointment.id = :appointmentId
              AND (:status IS NULL OR p.status = :status)
            ORDER BY p.paidAt ASC, p.id ASC
            """)
    List<Payment> findByAppointment(
            @Param("appointmentId") Long appointmentId,
            @Param("status") EntityStatus status
    );

    @Query("""
            SELECT p FROM Payment p
            JOIN FETCH p.patient
            JOIN FETCH p.appointment
            WHERE p.patient.id = :patientId
              AND (:status IS NULL OR p.status = :status)
            ORDER BY p.paidAt DESC, p.id DESC
            """)
    List<Payment> findByPatient(
            @Param("patientId") Long patientId,
            @Param("status") EntityStatus status
    );
}
