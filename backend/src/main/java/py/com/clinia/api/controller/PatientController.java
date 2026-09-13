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
import py.com.clinia.api.dto.PatientHistoryResponse;
import py.com.clinia.api.dto.PatientRequest;
import py.com.clinia.api.dto.PatientResponse;
import py.com.clinia.api.enums.EntityStatus;
import py.com.clinia.api.service.PatientService;
import py.com.clinia.api.service.TreatmentPackageService;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;
    private final TreatmentPackageService treatmentPackageService;

    public PatientController(PatientService patientService, TreatmentPackageService treatmentPackageService) {
        this.patientService = patientService;
        this.treatmentPackageService = treatmentPackageService;
    }

    @GetMapping
    public List<PatientResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) EntityStatus status
    ) {
        return patientService.search(q, status);
    }

    @GetMapping("/{id}")
    public PatientResponse getById(@PathVariable Long id) {
        return patientService.getById(id);
    }

    @GetMapping("/{id}/history")
    public PatientHistoryResponse history(@PathVariable Long id) {
        return treatmentPackageService.history(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PatientResponse create(@Valid @RequestBody PatientRequest request) {
        return patientService.create(request);
    }

    @PutMapping("/{id}")
    public PatientResponse update(@PathVariable Long id, @Valid @RequestBody PatientRequest request) {
        return patientService.update(id, request);
    }

    @PostMapping("/{id}/deactivate")
    public PatientResponse deactivate(@PathVariable Long id) {
        return patientService.deactivate(id);
    }

    @PostMapping("/{id}/activate")
    public PatientResponse activate(@PathVariable Long id) {
        return patientService.activate(id);
    }
}
