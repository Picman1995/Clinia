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
import py.com.clinia.api.dto.PromotionRequest;
import py.com.clinia.api.dto.PromotionResponse;
import py.com.clinia.api.enums.EntityStatus;
import py.com.clinia.api.service.PromotionService;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping
    public List<PromotionResponse> list(
            @RequestParam(required = false) EntityStatus status,
            @RequestParam(required = false) Boolean onlyValidToday
    ) {
        return promotionService.list(status, onlyValidToday);
    }

    @GetMapping("/{id}")
    public PromotionResponse getById(@PathVariable Long id) {
        return promotionService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PromotionResponse create(@Valid @RequestBody PromotionRequest request) {
        return promotionService.create(request);
    }

    @PutMapping("/{id}")
    public PromotionResponse update(@PathVariable Long id, @Valid @RequestBody PromotionRequest request) {
        return promotionService.update(id, request);
    }

    @PostMapping("/{id}/deactivate")
    public PromotionResponse deactivate(@PathVariable Long id) {
        return promotionService.deactivate(id);
    }

    @PostMapping("/{id}/activate")
    public PromotionResponse activate(@PathVariable Long id) {
        return promotionService.activate(id);
    }
}
