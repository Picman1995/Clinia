package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import py.com.clinia.api.entity.Patient;
import py.com.clinia.api.enums.EntityStatus;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByDocumentNumberIgnoreCase(String documentNumber);

    boolean existsByDocumentNumberIgnoreCase(String documentNumber);

    boolean existsByDocumentNumberIgnoreCaseAndIdNot(String documentNumber, Long id);

    @Query("""
            SELECT p FROM Patient p
            WHERE (:status IS NULL OR p.status = :status)
              AND (
                :q IS NULL OR :q = '' OR
                LOWER(p.firstName) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(p.lastName) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(p.documentNumber) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(COALESCE(p.phone, '')) LIKE LOWER(CONCAT('%', :q, '%'))
              )
            ORDER BY p.lastName ASC, p.firstName ASC
            """)
    List<Patient> search(@Param("q") String q, @Param("status") EntityStatus status);
}
