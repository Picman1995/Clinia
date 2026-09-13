package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import py.com.clinia.api.entity.Professional;

import java.util.Optional;

public interface ProfessionalRepository extends JpaRepository<Professional, Long> {

    Optional<Professional> findByDocumentNumber(String documentNumber);

    Optional<Professional> findFirstByDefaultProfessionalTrue();
}
