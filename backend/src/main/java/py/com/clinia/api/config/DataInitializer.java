package py.com.clinia.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;
import py.com.clinia.api.entity.BusinessSetting;
import py.com.clinia.api.entity.Professional;
import py.com.clinia.api.entity.ServiceCategory;
import py.com.clinia.api.enums.ServiceCategoryType;
import py.com.clinia.api.repository.BusinessSettingRepository;
import py.com.clinia.api.repository.ProfessionalRepository;
import py.com.clinia.api.repository.ServiceCategoryRepository;

import java.time.LocalDate;

@Configuration
public class DataInitializer {

    @Value("${clinia.owner-commission-percentage:40}")
    private String ownerCommissionPercentage;

    @Bean
    CommandLineRunner seedDefaults(
            ProfessionalRepository professionalRepository,
            BusinessSettingRepository businessSettingRepository,
            ServiceCategoryRepository serviceCategoryRepository
    ) {
        return args -> seed(professionalRepository, businessSettingRepository, serviceCategoryRepository);
    }

    @Transactional
    void seed(
            ProfessionalRepository professionalRepository,
            BusinessSettingRepository businessSettingRepository,
            ServiceCategoryRepository serviceCategoryRepository
    ) {
        if (professionalRepository.findByDocumentNumber("5230444").isEmpty()) {
            Professional professional = new Professional();
            professional.setFirstName("Maria Laura");
            professional.setLastName("Coronel");
            professional.setDocumentNumber("5230444");
            professional.setSpecialty("Licenciada en Kinesiologia y Fisioterapia");
            professional.setBirthDate(LocalDate.of(1997, 10, 20));
            professional.setDefaultProfessional(true);
            professionalRepository.save(professional);
        }

        upsertSetting(
                businessSettingRepository,
                SettingKeys.OWNER_COMMISSION_PERCENTAGE,
                ownerCommissionPercentage,
                "Porcentaje de participacion del propietario"
        );
        upsertSetting(
                businessSettingRepository,
                SettingKeys.BUSINESS_NAME,
                "Clinia",
                "Nombre del negocio"
        );
        upsertSetting(
                businessSettingRepository,
                SettingKeys.CURRENCY_CODE,
                "PYG",
                "Codigo de moneda"
        );

        if (serviceCategoryRepository.count() == 0) {
            ServiceCategory depilation = new ServiceCategory();
            depilation.setName("Depilacion");
            depilation.setType(ServiceCategoryType.DEPILACION);
            depilation.setDescription("Servicios de depilacion por zonas");
            serviceCategoryRepository.save(depilation);

            ServiceCategory aesthetics = new ServiceCategory();
            aesthetics.setName("Estetica");
            aesthetics.setType(ServiceCategoryType.ESTETICA);
            aesthetics.setDescription("Servicios de estetica y masajes");
            serviceCategoryRepository.save(aesthetics);
        }
    }

    private void upsertSetting(
            BusinessSettingRepository repository,
            String key,
            String value,
            String description
    ) {
        BusinessSetting setting = repository.findBySettingKey(key).orElseGet(BusinessSetting::new);
        setting.setSettingKey(key);
        setting.setSettingValue(value);
        setting.setDescription(description);
        repository.save(setting);
    }
}
