package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import py.com.clinia.api.entity.TreatmentPackage;

public interface TreatmentPackageRepository extends JpaRepository<TreatmentPackage, Long> {
}
