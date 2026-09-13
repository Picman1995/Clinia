package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import py.com.clinia.api.entity.Service;

import java.util.Optional;

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
    java.util.List<Service> search(
            @Param("q") String q,
            @Param("categoryId") Long categoryId,
            @Param("type") py.com.clinia.api.enums.ServiceCategoryType type,
            @Param("status") py.com.clinia.api.enums.EntityStatus status
    );

    @Query("""
            SELECT s FROM Service s
            JOIN FETCH s.category
            WHERE s.id = :id
            """)
    Optional<Service> findDetailedById(@Param("id") Long id);
}
