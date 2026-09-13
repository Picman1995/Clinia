package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import py.com.clinia.api.entity.ServiceZone;

public interface ServiceZoneRepository extends JpaRepository<ServiceZone, Long> {
}
