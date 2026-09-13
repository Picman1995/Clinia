package py.com.clinia.api.dto;

public record HealthResponse(
        String status,
        String application,
        String timezone
) {
}
