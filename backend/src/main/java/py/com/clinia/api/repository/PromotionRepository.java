package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import py.com.clinia.api.entity.Promotion;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
}
