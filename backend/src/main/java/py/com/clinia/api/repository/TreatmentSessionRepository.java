package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import py.com.clinia.api.entity.TreatmentSession;

public interface TreatmentSessionRepository extends JpaRepository<TreatmentSession, Long> {
}
