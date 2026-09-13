package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import py.com.clinia.api.entity.Patient;

public interface PatientRepository extends JpaRepository<Patient, Long> {
}
