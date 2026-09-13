package py.com.clinia.api.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import py.com.clinia.api.dto.BusinessSettingResponse;
import py.com.clinia.api.dto.BusinessSettingUpdateRequest;
import py.com.clinia.api.service.SettingsService;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public List<BusinessSettingResponse> list() {
        return settingsService.list();
    }

    @GetMapping("/{key}")
    public BusinessSettingResponse get(@PathVariable String key) {
        return settingsService.get(key);
    }

    @PutMapping("/{key}")
    public BusinessSettingResponse update(
            @PathVariable String key,
            @Valid @RequestBody BusinessSettingUpdateRequest request
    ) {
        return settingsService.update(key, request);
    }
}
