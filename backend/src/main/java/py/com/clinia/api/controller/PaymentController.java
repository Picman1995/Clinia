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
import py.com.clinia.api.dto.PaymentRequest;
import py.com.clinia.api.dto.PaymentResponse;
import py.com.clinia.api.exception.BusinessException;
import py.com.clinia.api.service.PaymentService;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public List<PaymentResponse> list(
            @RequestParam(required = false) Long appointmentId,
            @RequestParam(required = false) Long patientId
    ) {
        if (appointmentId != null) {
            return paymentService.listByAppointment(appointmentId);
        }
        if (patientId != null) {
            return paymentService.listByPatient(patientId);
        }
        throw new BusinessException("Debes indicar appointmentId o patientId");
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse create(@Valid @RequestBody PaymentRequest request) {
        return paymentService.create(request);
    }

    @PostMapping("/{id}/deactivate")
    public PaymentResponse deactivate(@PathVariable Long id) {
        return paymentService.deactivate(id);
    }
}
