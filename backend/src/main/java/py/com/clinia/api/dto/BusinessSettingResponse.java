package py.com.clinia.api.dto;

public record BusinessSettingResponse(
        String key,
        String value,
        String description
) {
}
