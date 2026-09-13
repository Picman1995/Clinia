package py.com.clinia.api.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import py.com.clinia.api.dto.ServiceCategoryRequest;
import py.com.clinia.api.dto.ServiceCategoryResponse;
import py.com.clinia.api.dto.ServiceRequest;
import py.com.clinia.api.dto.ServiceResponse;
import py.com.clinia.api.dto.ServiceZoneRequest;
import py.com.clinia.api.dto.ServiceZoneResponse;
import py.com.clinia.api.entity.ServiceCategory;
import py.com.clinia.api.entity.ServiceZone;
import py.com.clinia.api.enums.EntityStatus;
import py.com.clinia.api.enums.ServiceCategoryType;
import py.com.clinia.api.exception.BusinessException;
import py.com.clinia.api.exception.ResourceNotFoundException;
import py.com.clinia.api.mapper.CatalogMapper;
import py.com.clinia.api.repository.ServiceCategoryRepository;
import py.com.clinia.api.repository.ServiceRepository;
import py.com.clinia.api.repository.ServiceZoneRepository;

import java.util.List;

@Service
@Transactional
public class CatalogService {

    private final ServiceCategoryRepository categoryRepository;
    private final ServiceRepository serviceRepository;
    private final ServiceZoneRepository zoneRepository;

    public CatalogService(
            ServiceCategoryRepository categoryRepository,
            ServiceRepository serviceRepository,
            ServiceZoneRepository zoneRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.serviceRepository = serviceRepository;
        this.zoneRepository = zoneRepository;
    }

    @Transactional(readOnly = true)
    public List<ServiceCategoryResponse> listCategories(EntityStatus status) {
        List<ServiceCategory> categories = status == null
                ? categoryRepository.findAllByOrderByNameAsc()
                : categoryRepository.findByStatusOrderByNameAsc(status);
        return categories.stream().map(CatalogMapper::toResponse).toList();
    }

    public ServiceCategoryResponse createCategory(ServiceCategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.name().trim())) {
            throw new BusinessException("Ya existe una categoria con ese nombre");
        }
        ServiceCategory category = new ServiceCategory();
        CatalogMapper.apply(category, request);
        return CatalogMapper.toResponse(categoryRepository.save(category));
    }

    public ServiceCategoryResponse updateCategory(Long id, ServiceCategoryRequest request) {
        ServiceCategory category = findCategory(id);
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(request.name().trim(), id)) {
            throw new BusinessException("Ya existe una categoria con ese nombre");
        }
        CatalogMapper.apply(category, request);
        return CatalogMapper.toResponse(categoryRepository.save(category));
    }

    public ServiceCategoryResponse deactivateCategory(Long id) {
        ServiceCategory category = findCategory(id);
        category.setStatus(EntityStatus.INACTIVO);
        return CatalogMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> searchServices(
            String q,
            Long categoryId,
            ServiceCategoryType type,
            EntityStatus status
    ) {
        String query = q == null ? null : q.trim();
        return serviceRepository.search(query, categoryId, type, status).stream()
                .map(CatalogMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ServiceResponse getService(Long id) {
        return CatalogMapper.toResponse(findService(id));
    }

    public ServiceResponse createService(ServiceRequest request) {
        ServiceCategory category = findCategory(request.categoryId());
        ensureCategoryActive(category);
        py.com.clinia.api.entity.Service service = new py.com.clinia.api.entity.Service();
        CatalogMapper.apply(service, request, category);
        return CatalogMapper.toResponse(serviceRepository.save(service));
    }

    public ServiceResponse updateService(Long id, ServiceRequest request) {
        py.com.clinia.api.entity.Service service = findService(id);
        ServiceCategory category = findCategory(request.categoryId());
        CatalogMapper.apply(service, request, category);
        return CatalogMapper.toResponse(serviceRepository.save(service));
    }

    public ServiceResponse deactivateService(Long id) {
        py.com.clinia.api.entity.Service service = findService(id);
        service.setStatus(EntityStatus.INACTIVO);
        return CatalogMapper.toResponse(serviceRepository.save(service));
    }

    public ServiceResponse activateService(Long id) {
        py.com.clinia.api.entity.Service service = findService(id);
        service.setStatus(EntityStatus.ACTIVO);
        return CatalogMapper.toResponse(serviceRepository.save(service));
    }

    @Transactional(readOnly = true)
    public List<ServiceZoneResponse> searchZones(Long serviceId, EntityStatus status) {
        return zoneRepository.search(serviceId, status).stream()
                .map(CatalogMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ServiceZoneResponse getZone(Long id) {
        return CatalogMapper.toResponse(findZone(id));
    }

    public ServiceZoneResponse createZone(ServiceZoneRequest request) {
        py.com.clinia.api.entity.Service service = findService(request.serviceId());
        ensureServiceActive(service);
        ServiceZone zone = new ServiceZone();
        CatalogMapper.apply(zone, request, service);
        return CatalogMapper.toResponse(zoneRepository.save(zone));
    }

    public ServiceZoneResponse updateZone(Long id, ServiceZoneRequest request) {
        ServiceZone zone = findZone(id);
        py.com.clinia.api.entity.Service service = findService(request.serviceId());
        CatalogMapper.apply(zone, request, service);
        return CatalogMapper.toResponse(zoneRepository.save(zone));
    }

    public ServiceZoneResponse deactivateZone(Long id) {
        ServiceZone zone = findZone(id);
        zone.setStatus(EntityStatus.INACTIVO);
        return CatalogMapper.toResponse(zoneRepository.save(zone));
    }

    public ServiceZoneResponse activateZone(Long id) {
        ServiceZone zone = findZone(id);
        zone.setStatus(EntityStatus.ACTIVO);
        return CatalogMapper.toResponse(zoneRepository.save(zone));
    }

    private ServiceCategory findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria no encontrada"));
    }

    private py.com.clinia.api.entity.Service findService(Long id) {
        return serviceRepository.findDetailedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Servicio no encontrado"));
    }

    private ServiceZone findZone(Long id) {
        return zoneRepository.findDetailedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zona no encontrada"));
    }

    private void ensureCategoryActive(ServiceCategory category) {
        if (category.getStatus() != EntityStatus.ACTIVO) {
            throw new BusinessException("La categoria esta inactiva");
        }
    }

    private void ensureServiceActive(py.com.clinia.api.entity.Service service) {
        if (service.getStatus() != EntityStatus.ACTIVO) {
            throw new BusinessException("El servicio esta inactivo");
        }
    }
}
