package py.com.clinia.api.mapper;

import py.com.clinia.api.dto.ServiceCategoryRequest;
import py.com.clinia.api.dto.ServiceCategoryResponse;
import py.com.clinia.api.dto.ServiceRequest;
import py.com.clinia.api.dto.ServiceResponse;
import py.com.clinia.api.dto.ServiceZoneRequest;
import py.com.clinia.api.dto.ServiceZoneResponse;
import py.com.clinia.api.entity.Service;
import py.com.clinia.api.entity.ServiceCategory;
import py.com.clinia.api.entity.ServiceZone;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class CatalogMapper {

    private CatalogMapper() {
    }

    public static ServiceCategoryResponse toResponse(ServiceCategory category) {
        return new ServiceCategoryResponse(
                category.getId(),
                category.getName(),
                category.getType(),
                category.getDescription(),
                category.getStatus()
        );
    }

    public static void apply(ServiceCategory category, ServiceCategoryRequest request) {
        category.setName(request.name().trim());
        category.setType(request.type());
        category.setDescription(normalize(request.description()));
    }

    public static ServiceResponse toResponse(Service service) {
        ServiceCategory category = service.getCategory();
        return new ServiceResponse(
                service.getId(),
                service.getName(),
                service.getDescription(),
                category.getId(),
                category.getName(),
                category.getType(),
                service.getDurationMinutes(),
                service.getPrice(),
                service.getStatus()
        );
    }

    public static void apply(Service service, ServiceRequest request, ServiceCategory category) {
        service.setName(request.name().trim());
        service.setDescription(normalize(request.description()));
        service.setCategory(category);
        service.setDurationMinutes(request.durationMinutes());
        service.setPrice(money(request.price()));
    }

    public static ServiceZoneResponse toResponse(ServiceZone zone) {
        Service service = zone.getService();
        return new ServiceZoneResponse(
                zone.getId(),
                zone.getName(),
                zone.getDescription(),
                service.getId(),
                service.getName(),
                zone.getPrice(),
                zone.getDurationMinutes(),
                zone.getStatus()
        );
    }

    public static void apply(ServiceZone zone, ServiceZoneRequest request, Service service) {
        zone.setName(request.name().trim());
        zone.setDescription(normalize(request.description()));
        zone.setService(service);
        zone.setPrice(money(request.price()));
        zone.setDurationMinutes(request.durationMinutes());
    }

    private static BigDecimal money(BigDecimal value) {
        return value.setScale(0, RoundingMode.HALF_UP);
    }

    private static String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
