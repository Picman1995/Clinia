package py.com.clinia.api.dto;

public record PromotionItemResponse(
        Long id,
        Long serviceId,
        String serviceName,
        Long serviceZoneId,
        String serviceZoneName
) {
}
