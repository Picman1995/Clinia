package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import py.com.clinia.api.entity.TreatmentSession;
import py.com.clinia.api.enums.SessionStatus;

import java.util.Optional;

public interface TreatmentSessionRepository extends JpaRepository<TreatmentSession, Long> {

    @Query("""
            SELECT s FROM TreatmentSession s
            JOIN FETCH s.treatmentPackage p
            JOIN FETCH p.patient
            LEFT JOIN FETCH p.service
            LEFT JOIN FETCH s.appointment
            WHERE s.id = :id
            """)
    Optional<TreatmentSession> findDetailedById(@Param("id") Long id);

    @Query("""
            SELECT COUNT(s) > 0 FROM TreatmentSession s
            WHERE s.appointment.id = :appointmentId
              AND s.sessionStatus = :status
            """)
    boolean existsByAppointmentAndStatus(
            @Param("appointmentId") Long appointmentId,
            @Param("status") SessionStatus status
    );

    Optional<TreatmentSession> findFirstByTreatmentPackageIdAndSessionStatusOrderBySessionNumberAsc(
            Long treatmentPackageId,
            SessionStatus sessionStatus
    );
}
