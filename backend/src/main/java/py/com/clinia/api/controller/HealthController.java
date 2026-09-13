package py.com.clinia.api.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import py.com.clinia.api.dto.HealthResponse;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Value("${spring.application.name}")
    private String applicationName;

    @Value("${clinia.timezone:America/Asuncion}")
    private String timezone;

    @GetMapping("/health")
    public HealthResponse health() {
        return new HealthResponse("UP", applicationName, timezone);
    }
}
