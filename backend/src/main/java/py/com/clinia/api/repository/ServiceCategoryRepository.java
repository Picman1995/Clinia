package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import py.com.clinia.api.entity.ServiceCategory;
import py.com.clinia.api.enums.EntityStatus;
import py.com.clinia.api.enums.ServiceCategoryType;

import java.util.List;
import java.util.Optional;

public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {

    List<ServiceCategory> findAllByOrderByNameAsc();

    List<ServiceCategory> findByStatusOrderByNameAsc(EntityStatus status);

    Optional<ServiceCategory> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    List<ServiceCategory> findByTypeAndStatusOrderByNameAsc(ServiceCategoryType type, EntityStatus status);
}
