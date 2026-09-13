package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import py.com.clinia.api.entity.Service;

public interface ServiceRepository extends JpaRepository<Service, Long> {
}
