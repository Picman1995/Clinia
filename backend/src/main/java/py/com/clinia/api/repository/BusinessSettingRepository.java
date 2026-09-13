package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import py.com.clinia.api.entity.BusinessSetting;

import java.util.Optional;

public interface BusinessSettingRepository extends JpaRepository<BusinessSetting, Long> {

    Optional<BusinessSetting> findBySettingKey(String settingKey);
}
