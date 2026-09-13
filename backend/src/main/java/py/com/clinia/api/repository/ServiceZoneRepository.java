package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import py.com.clinia.api.entity.ServiceZone;
import py.com.clinia.api.enums.EntityStatus;

import java.util.List;

public interface ServiceZoneRepository extends JpaRepository<ServiceZone, Long> {

    @Query("""
            SELECT z FROM ServiceZone z
            JOIN FETCH z.service s
            WHERE (:status IS NULL OR z.status = :status)
              AND (:serviceId IS NULL OR s.id = :serviceId)
            ORDER BY z.name ASC
            """)
    List<ServiceZone> search(@Param("serviceId") Long serviceId, @Param("status") EntityStatus status);
}
