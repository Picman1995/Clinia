package py.com.clinia.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;
import py.com.clinia.api.entity.BusinessSetting;
import py.com.clinia.api.entity.Professional;
import py.com.clinia.api.entity.Service;
import py.com.clinia.api.entity.ServiceCategory;
import py.com.clinia.api.entity.ServiceZone;
import py.com.clinia.api.enums.ServiceCategoryType;
import py.com.clinia.api.repository.BusinessSettingRepository;
import py.com.clinia.api.repository.ProfessionalRepository;
import py.com.clinia.api.repository.ServiceCategoryRepository;
import py.com.clinia.api.repository.ServiceRepository;
import py.com.clinia.api.repository.ServiceZoneRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Configuration
public class DataInitializer {

    @Value("${clinia.owner-commission-percentage:40}")
    private String ownerCommissionPercentage;

    @Bean
    CommandLineRunner seedDefaults(
            ProfessionalRepository professionalRepository,
            BusinessSettingRepository businessSettingRepository,
            ServiceCategoryRepository serviceCategoryRepository,
            ServiceRepository serviceRepository,
            ServiceZoneRepository serviceZoneRepository
    ) {
        return args -> seed(
                professionalRepository,
                businessSettingRepository,
                serviceCategoryRepository,
                serviceRepository,
                serviceZoneRepository
        );
    }

    @Transactional
    void seed(
            ProfessionalRepository professionalRepository,
            BusinessSettingRepository businessSettingRepository,
            ServiceCategoryRepository serviceCategoryRepository,
            ServiceRepository serviceRepository,
            ServiceZoneRepository serviceZoneRepository
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

        if (serviceRepository.count() == 0) {
            ServiceCategory depilation = serviceCategoryRepository
                    .findByTypeAndStatusOrderByNameAsc(ServiceCategoryType.DEPILACION, py.com.clinia.api.enums.EntityStatus.ACTIVO)
                    .stream()
                    .findFirst()
                    .orElseThrow();
            ServiceCategory aesthetics = serviceCategoryRepository
                    .findByTypeAndStatusOrderByNameAsc(ServiceCategoryType.ESTETICA, py.com.clinia.api.enums.EntityStatus.ACTIVO)
                    .stream()
                    .findFirst()
                    .orElseThrow();

            Service depilationService = new Service();
            depilationService.setName("Depilacion por zona");
            depilationService.setDescription("Depilacion laser o definitiva por zona corporal");
            depilationService.setCategory(depilation);
            depilationService.setDurationMinutes(30);
            depilationService.setPrice(BigDecimal.valueOf(50000));
            serviceRepository.save(depilationService);

            List<ZoneSeed> zones = List.of(
                    new ZoneSeed("Axilas", 50000, 15),
                    new ZoneSeed("Piernas", 120000, 45),
                    new ZoneSeed("Brazos", 80000, 30),
                    new ZoneSeed("Espalda", 100000, 40),
                    new ZoneSeed("Pecho", 90000, 30),
                    new ZoneSeed("Abdomen", 80000, 25),
                    new ZoneSeed("Ingle", 70000, 20),
                    new ZoneSeed("Rostro", 60000, 20),
                    new ZoneSeed("Zona intima", 90000, 25),
                    new ZoneSeed("Cuerpo completo", 300000, 90)
            );
            for (ZoneSeed zoneSeed : zones) {
                ServiceZone zone = new ServiceZone();
                zone.setName(zoneSeed.name());
                zone.setService(depilationService);
                zone.setPrice(BigDecimal.valueOf(zoneSeed.price()));
                zone.setDurationMinutes(zoneSeed.durationMinutes());
                serviceZoneRepository.save(zone);
            }

            createAesthetic(serviceRepository, aesthetics, "Masaje cuerpo completo", 180000, 60);
            createAesthetic(serviceRepository, aesthetics, "Masaje relajante", 150000, 50);
            createAesthetic(serviceRepository, aesthetics, "Masaje descontracturante", 160000, 50);
            createAesthetic(serviceRepository, aesthetics, "Masaje localizado", 100000, 30);
        }
    }

    private void createAesthetic(
            ServiceRepository serviceRepository,
            ServiceCategory category,
            String name,
            long price,
            int durationMinutes
    ) {
        Service service = new Service();
        service.setName(name);
        service.setCategory(category);
        service.setPrice(BigDecimal.valueOf(price));
        service.setDurationMinutes(durationMinutes);
        serviceRepository.save(service);
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

    private record ZoneSeed(String name, long price, int durationMinutes) {
    }
}
