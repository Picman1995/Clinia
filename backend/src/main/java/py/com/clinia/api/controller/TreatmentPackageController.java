package py.com.clinia.api.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import py.com.clinia.api.dto.CompleteSessionRequest;
import py.com.clinia.api.dto.TreatmentPackageRequest;
import py.com.clinia.api.dto.TreatmentPackageResponse;
import py.com.clinia.api.dto.TreatmentSessionResponse;
import py.com.clinia.api.enums.EntityStatus;
import py.com.clinia.api.service.TreatmentPackageService;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TreatmentPackageController {

    private final TreatmentPackageService treatmentPackageService;

    public TreatmentPackageController(TreatmentPackageService treatmentPackageService) {
        this.treatmentPackageService = treatmentPackageService;
    }

    @GetMapping("/treatment-packages")
    public List<TreatmentPackageResponse> list(
            @RequestParam Long patientId,
            @RequestParam(required = false) EntityStatus status
    ) {
        return treatmentPackageService.listByPatient(patientId, status);
    }

    @GetMapping("/treatment-packages/{id}")
    public TreatmentPackageResponse getById(@PathVariable Long id) {
        return treatmentPackageService.getById(id);
    }

    @PostMapping("/treatment-packages")
    @ResponseStatus(HttpStatus.CREATED)
    public TreatmentPackageResponse create(@Valid @RequestBody TreatmentPackageRequest request) {
        return treatmentPackageService.create(request);
    }

    @PostMapping("/treatment-packages/{id}/deactivate")
    public TreatmentPackageResponse deactivate(@PathVariable Long id) {
        return treatmentPackageService.deactivate(id);
    }

    @PostMapping("/treatment-sessions/{id}/complete")
    public TreatmentSessionResponse completeSession(
            @PathVariable Long id,
            @RequestBody(required = false) CompleteSessionRequest request
    ) {
        CompleteSessionRequest payload = request == null ? new CompleteSessionRequest(null, null) : request;
        return treatmentPackageService.completeSession(id, payload);
    }

    @PostMapping("/treatment-sessions/{id}/cancel")
    public TreatmentSessionResponse cancelSession(@PathVariable Long id) {
        return treatmentPackageService.cancelSession(id);
    }
}
