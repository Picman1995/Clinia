package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import py.com.clinia.api.entity.Appointment;
import py.com.clinia.api.enums.AppointmentStatus;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("""
            SELECT DISTINCT a FROM Appointment a
            JOIN FETCH a.patient
            JOIN FETCH a.professional
            LEFT JOIN FETCH a.items
            WHERE a.startAt < :to
              AND a.endAt > :from
              AND (:professionalId IS NULL OR a.professional.id = :professionalId)
            ORDER BY a.startAt ASC
            """)
    List<Appointment> findInRange(
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to,
            @Param("professionalId") Long professionalId
    );

    @Query("""
            SELECT a FROM Appointment a
            JOIN FETCH a.patient
            JOIN FETCH a.professional
            LEFT JOIN FETCH a.items
            WHERE a.id = :id
            """)
    Optional<Appointment> findDetailedById(@Param("id") Long id);

    @Query("""
            SELECT COUNT(a) > 0 FROM Appointment a
            WHERE a.professional.id = :professionalId
              AND a.appointmentStatus IN :blockingStatuses
              AND a.startAt < :endAt
              AND a.endAt > :startAt
              AND (:excludeId IS NULL OR a.id <> :excludeId)
            """)
    boolean existsOverlap(
            @Param("professionalId") Long professionalId,
            @Param("startAt") OffsetDateTime startAt,
            @Param("endAt") OffsetDateTime endAt,
            @Param("excludeId") Long excludeId,
            @Param("blockingStatuses") List<AppointmentStatus> blockingStatuses
    );

    @Query("""
            SELECT DISTINCT a FROM Appointment a
            JOIN FETCH a.patient
            JOIN FETCH a.professional
            LEFT JOIN FETCH a.items
            WHERE a.patient.id = :patientId
            ORDER BY a.startAt DESC
            """)
    List<Appointment> findByPatientId(@Param("patientId") Long patientId);
}
