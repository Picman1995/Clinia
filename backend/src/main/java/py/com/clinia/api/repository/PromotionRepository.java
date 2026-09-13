package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import py.com.clinia.api.entity.Promotion;
import py.com.clinia.api.enums.EntityStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    List<Promotion> findAllByOrderByNameAsc();

    List<Promotion> findByStatusOrderByNameAsc(EntityStatus status);

    @Query("""
            SELECT DISTINCT p FROM Promotion p
            LEFT JOIN FETCH p.items
            WHERE p.id = :id
            """)
    Optional<Promotion> findDetailedById(@Param("id") Long id);

    @Query("""
            SELECT DISTINCT p FROM Promotion p
            LEFT JOIN FETCH p.items
            WHERE p.status = :status
              AND (p.startDate IS NULL OR p.startDate <= :date)
              AND (p.endDate IS NULL OR p.endDate >= :date)
            ORDER BY p.name ASC
            """)
    List<Promotion> findActiveOnDate(@Param("status") EntityStatus status, @Param("date") LocalDate date);
}
