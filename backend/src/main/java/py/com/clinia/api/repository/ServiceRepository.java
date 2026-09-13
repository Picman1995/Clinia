package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import py.com.clinia.api.entity.Service;
import py.com.clinia.api.enums.EntityStatus;
import py.com.clinia.api.enums.ServiceCategoryType;

import java.util.List;

public interface ServiceRepository extends JpaRepository<Service, Long> {

    @Query("""
            SELECT s FROM Service s
            JOIN FETCH s.category c
            WHERE (:status IS NULL OR s.status = :status)
              AND (:categoryId IS NULL OR c.id = :categoryId)
              AND (:type IS NULL OR c.type = :type)
              AND (
                :q IS NULL OR :q = '' OR
                LOWER(s.name) LIKE LOWER(CONCAT('%', :q, '%'))
              )
            ORDER BY c.name ASC, s.name ASC
            """)
    List<Service> search(
            @Param("q") String q,
            @Param("categoryId") Long categoryId,
            @Param("type") ServiceCategoryType type,
            @Param("status") EntityStatus status
    );
}
