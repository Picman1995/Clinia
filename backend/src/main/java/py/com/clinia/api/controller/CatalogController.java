package py.com.clinia.api.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import py.com.clinia.api.dto.ServiceCategoryRequest;
import py.com.clinia.api.dto.ServiceCategoryResponse;
import py.com.clinia.api.dto.ServiceRequest;
import py.com.clinia.api.dto.ServiceResponse;
import py.com.clinia.api.dto.ServiceZoneRequest;
import py.com.clinia.api.dto.ServiceZoneResponse;
import py.com.clinia.api.enums.EntityStatus;
import py.com.clinia.api.enums.ServiceCategoryType;
import py.com.clinia.api.service.CatalogService;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/service-categories")
    public List<ServiceCategoryResponse> listCategories(
            @RequestParam(required = false) EntityStatus status
    ) {
        return catalogService.listCategories(status);
    }

    @PostMapping("/service-categories")
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceCategoryResponse createCategory(@Valid @RequestBody ServiceCategoryRequest request) {
        return catalogService.createCategory(request);
    }

    @PutMapping("/service-categories/{id}")
    public ServiceCategoryResponse updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody ServiceCategoryRequest request
    ) {
        return catalogService.updateCategory(id, request);
    }

    @PostMapping("/service-categories/{id}/deactivate")
    public ServiceCategoryResponse deactivateCategory(@PathVariable Long id) {
        return catalogService.deactivateCategory(id);
    }

    @GetMapping("/services")
    public List<ServiceResponse> searchServices(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) ServiceCategoryType type,
            @RequestParam(required = false) EntityStatus status
    ) {
        return catalogService.searchServices(q, categoryId, type, status);
    }

    @GetMapping("/services/{id}")
    public ServiceResponse getService(@PathVariable Long id) {
        return catalogService.getService(id);
    }

    @PostMapping("/services")
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceResponse createService(@Valid @RequestBody ServiceRequest request) {
        return catalogService.createService(request);
    }

    @PutMapping("/services/{id}")
    public ServiceResponse updateService(
            @PathVariable Long id,
            @Valid @RequestBody ServiceRequest request
    ) {
        return catalogService.updateService(id, request);
    }

    @PostMapping("/services/{id}/deactivate")
    public ServiceResponse deactivateService(@PathVariable Long id) {
        return catalogService.deactivateService(id);
    }

    @PostMapping("/services/{id}/activate")
    public ServiceResponse activateService(@PathVariable Long id) {
        return catalogService.activateService(id);
    }

    @GetMapping("/service-zones")
    public List<ServiceZoneResponse> searchZones(
            @RequestParam(required = false) Long serviceId,
            @RequestParam(required = false) EntityStatus status
    ) {
        return catalogService.searchZones(serviceId, status);
    }

    @GetMapping("/service-zones/{id}")
    public ServiceZoneResponse getZone(@PathVariable Long id) {
        return catalogService.getZone(id);
    }

    @PostMapping("/service-zones")
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceZoneResponse createZone(@Valid @RequestBody ServiceZoneRequest request) {
        return catalogService.createZone(request);
    }

    @PutMapping("/service-zones/{id}")
    public ServiceZoneResponse updateZone(
            @PathVariable Long id,
            @Valid @RequestBody ServiceZoneRequest request
    ) {
        return catalogService.updateZone(id, request);
    }

    @PostMapping("/service-zones/{id}/deactivate")
    public ServiceZoneResponse deactivateZone(@PathVariable Long id) {
        return catalogService.deactivateZone(id);
    }

    @PostMapping("/service-zones/{id}/activate")
    public ServiceZoneResponse activateZone(@PathVariable Long id) {
        return catalogService.activateZone(id);
    }
}
