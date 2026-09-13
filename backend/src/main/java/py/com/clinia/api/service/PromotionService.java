package py.com.clinia.api.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import py.com.clinia.api.dto.PromotionItemRequest;
import py.com.clinia.api.dto.PromotionRequest;
import py.com.clinia.api.dto.PromotionResponse;
import py.com.clinia.api.entity.Promotion;
import py.com.clinia.api.entity.PromotionItem;
import py.com.clinia.api.entity.ServiceZone;
import py.com.clinia.api.enums.EntityStatus;
import py.com.clinia.api.exception.BusinessException;
import py.com.clinia.api.exception.ResourceNotFoundException;
import py.com.clinia.api.mapper.PromotionMapper;
import py.com.clinia.api.repository.PromotionRepository;
import py.com.clinia.api.repository.ServiceRepository;
import py.com.clinia.api.repository.ServiceZoneRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final ServiceRepository serviceRepository;
    private final ServiceZoneRepository serviceZoneRepository;

    public PromotionService(
            PromotionRepository promotionRepository,
            ServiceRepository serviceRepository,
            ServiceZoneRepository serviceZoneRepository
    ) {
        this.promotionRepository = promotionRepository;
        this.serviceRepository = serviceRepository;
        this.serviceZoneRepository = serviceZoneRepository;
    }

    @Transactional(readOnly = true)
    public List<PromotionResponse> list(EntityStatus status, Boolean onlyValidToday) {
        List<Promotion> promotions;
        if (Boolean.TRUE.equals(onlyValidToday)) {
            promotions = promotionRepository.findActiveOnDate(
                    status == null ? EntityStatus.ACTIVO : status,
                    LocalDate.now()
            );
        } else if (status == null) {
            promotions = promotionRepository.findAllByOrderByNameAsc();
        } else {
            promotions = promotionRepository.findByStatusOrderByNameAsc(status);
        }
        return promotions.stream().map(this::toDetailedResponse).toList();
    }

    @Transactional(readOnly = true)
    public PromotionResponse getById(Long id) {
        return PromotionMapper.toResponse(findDetailed(id));
    }

    public PromotionResponse create(PromotionRequest request) {
        validatePrices(request);
        validateDates(request.startDate(), request.endDate());
        Promotion promotion = new Promotion();
        apply(promotion, request);
        return PromotionMapper.toResponse(promotionRepository.save(promotion));
    }

    public PromotionResponse update(Long id, PromotionRequest request) {
        validatePrices(request);
        validateDates(request.startDate(), request.endDate());
        Promotion promotion = findDetailed(id);
        promotion.getItems().clear();
        apply(promotion, request);
        return PromotionMapper.toResponse(promotionRepository.save(promotion));
    }

    public PromotionResponse deactivate(Long id) {
        Promotion promotion = findDetailed(id);
        promotion.setStatus(EntityStatus.INACTIVO);
        return PromotionMapper.toResponse(promotionRepository.save(promotion));
    }

    public PromotionResponse activate(Long id) {
        Promotion promotion = findDetailed(id);
        promotion.setStatus(EntityStatus.ACTIVO);
        return PromotionMapper.toResponse(promotionRepository.save(promotion));
    }

    private void apply(Promotion promotion, PromotionRequest request) {
        promotion.setName(request.name().trim());
        promotion.setDescription(normalize(request.description()));
        promotion.setNormalPrice(AppointmentBalanceSupport.money(request.normalPrice()));
        promotion.setPromotionalPrice(AppointmentBalanceSupport.money(request.promotionalPrice()));
        promotion.setStartDate(request.startDate());
        promotion.setEndDate(request.endDate());

        List<PromotionItemRequest> itemRequests = request.items() == null ? List.of() : request.items();
        List<PromotionItem> items = new ArrayList<>();
        for (PromotionItemRequest itemRequest : itemRequests) {
            if (itemRequest.serviceId() == null && itemRequest.serviceZoneId() == null) {
                throw new BusinessException("Cada item de promocion debe tener servicio o zona");
            }
            PromotionItem item = new PromotionItem();
            item.setPromotion(promotion);
            if (itemRequest.serviceZoneId() != null) {
                ServiceZone zone = serviceZoneRepository.findDetailedById(itemRequest.serviceZoneId())
                        .orElseThrow(() -> new ResourceNotFoundException("Zona no encontrada"));
                item.setServiceZone(zone);
                item.setService(zone.getService());
            } else {
                py.com.clinia.api.entity.Service service = serviceRepository.findDetailedById(itemRequest.serviceId())
                        .orElseThrow(() -> new ResourceNotFoundException("Servicio no encontrado"));
                item.setService(service);
            }
            items.add(item);
        }
        promotion.getItems().addAll(items);
    }

    private PromotionResponse toDetailedResponse(Promotion promotion) {
        return PromotionMapper.toResponse(
                promotionRepository.findDetailedById(promotion.getId()).orElse(promotion)
        );
    }

    private Promotion findDetailed(Long id) {
        return promotionRepository.findDetailedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promocion no encontrada"));
    }

    private void validatePrices(PromotionRequest request) {
        if (request.promotionalPrice().compareTo(request.normalPrice()) > 0) {
            throw new BusinessException("El precio promocional no puede superar el precio normal");
        }
    }

    private void validateDates(LocalDate start, LocalDate end) {
        if (start != null && end != null && end.isBefore(start)) {
            throw new BusinessException("La fecha de fin no puede ser anterior al inicio");
        }
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
