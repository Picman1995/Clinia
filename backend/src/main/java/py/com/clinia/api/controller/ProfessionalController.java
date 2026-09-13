package py.com.clinia.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import py.com.clinia.api.dto.ProfessionalResponse;
import py.com.clinia.api.entity.Professional;
import py.com.clinia.api.exception.ResourceNotFoundException;
import py.com.clinia.api.repository.ProfessionalRepository;

import java.util.List;

@RestController
@RequestMapping("/api/professionals")
public class ProfessionalController {

    private final ProfessionalRepository professionalRepository;

    public ProfessionalController(ProfessionalRepository professionalRepository) {
        this.professionalRepository = professionalRepository;
    }

    @GetMapping
    public List<ProfessionalResponse> list() {
        return professionalRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/default")
    public ProfessionalResponse defaultProfessional() {
        Professional professional = professionalRepository.findFirstByDefaultProfessionalTrue()
                .orElseThrow(() -> new ResourceNotFoundException("No hay profesional por defecto"));
        return toResponse(professional);
    }

    private ProfessionalResponse toResponse(Professional professional) {
        return new ProfessionalResponse(
                professional.getId(),
                professional.getFirstName(),
                professional.getLastName(),
                professional.getDocumentNumber(),
                professional.getSpecialty(),
                professional.getBirthDate(),
                professional.isDefaultProfessional()
        );
    }
}
