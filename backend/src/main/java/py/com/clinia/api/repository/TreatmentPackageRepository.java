package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import py.com.clinia.api.entity.TreatmentPackage;
import py.com.clinia.api.enums.EntityStatus;

import java.util.List;
import java.util.Optional;

public interface TreatmentPackageRepository extends JpaRepository<TreatmentPackage, Long> {

    @Query("""
            SELECT DISTINCT p FROM TreatmentPackage p
            JOIN FETCH p.patient
            LEFT JOIN FETCH p.service
            LEFT JOIN FETCH p.sessions
            WHERE p.id = :id
            """)
    Optional<TreatmentPackage> findDetailedById(@Param("id") Long id);

    @Query("""
            SELECT DISTINCT p FROM TreatmentPackage p
            JOIN FETCH p.patient
            LEFT JOIN FETCH p.service
            LEFT JOIN FETCH p.sessions
            WHERE p.patient.id = :patientId
              AND (:status IS NULL OR p.status = :status)
            ORDER BY p.id DESC
            """)
    List<TreatmentPackage> findByPatient(
            @Param("patientId") Long patientId,
            @Param("status") EntityStatus status
    );
}
