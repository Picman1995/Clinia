package py.com.clinia.api.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import py.com.clinia.api.config.SettingKeys;
import py.com.clinia.api.dto.BusinessSettingResponse;
import py.com.clinia.api.dto.BusinessSettingUpdateRequest;
import py.com.clinia.api.entity.BusinessSetting;
import py.com.clinia.api.exception.BusinessException;
import py.com.clinia.api.exception.ResourceNotFoundException;
import py.com.clinia.api.repository.BusinessSettingRepository;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class SettingsService {

    private final BusinessSettingRepository businessSettingRepository;

    public SettingsService(BusinessSettingRepository businessSettingRepository) {
        this.businessSettingRepository = businessSettingRepository;
    }

    @Transactional(readOnly = true)
    public List<BusinessSettingResponse> list() {
        return businessSettingRepository.findAll().stream()
                .map(setting -> new BusinessSettingResponse(
                        setting.getSettingKey(),
                        setting.getSettingValue(),
                        setting.getDescription()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public BusinessSettingResponse get(String key) {
        BusinessSetting setting = businessSettingRepository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Configuracion no encontrada"));
        return new BusinessSettingResponse(setting.getSettingKey(), setting.getSettingValue(), setting.getDescription());
    }

    public BusinessSettingResponse update(String key, BusinessSettingUpdateRequest request) {
        BusinessSetting setting = businessSettingRepository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Configuracion no encontrada"));

        String value = request.value().trim();
        if (SettingKeys.OWNER_COMMISSION_PERCENTAGE.equals(key)) {
            BigDecimal percentage;
            try {
                percentage = new BigDecimal(value);
            } catch (NumberFormatException ex) {
                throw new BusinessException("El porcentaje del propietario debe ser numerico");
            }
            if (percentage.compareTo(BigDecimal.ZERO) < 0 || percentage.compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new BusinessException("El porcentaje del propietario debe estar entre 0 y 100");
            }
            value = percentage.stripTrailingZeros().toPlainString();
        }

        setting.setSettingValue(value);
        businessSettingRepository.save(setting);
        return new BusinessSettingResponse(setting.getSettingKey(), setting.getSettingValue(), setting.getDescription());
    }

    @Transactional(readOnly = true)
    public BigDecimal ownerCommissionPercentage() {
        return businessSettingRepository.findBySettingKey(SettingKeys.OWNER_COMMISSION_PERCENTAGE)
                .map(BusinessSetting::getSettingValue)
                .map(BigDecimal::new)
                .orElse(BigDecimal.valueOf(40));
    }
}
