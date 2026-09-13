package py.com.clinia.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "appointment_items")
public class AppointmentItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private Service service;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_zone_id")
    private ServiceZone serviceZone;

    @Column(nullable = false, length = 150)
    private String nameSnapshot;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false, precision = 14, scale = 0)
    private BigDecimal unitPriceSnapshot;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(nullable = false, precision = 14, scale = 0)
    private BigDecimal lineTotalSnapshot;

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }

    public Service getService() {
        return service;
    }

    public void setService(Service service) {
        this.service = service;
    }

    public ServiceZone getServiceZone() {
        return serviceZone;
    }

    public void setServiceZone(ServiceZone serviceZone) {
        this.serviceZone = serviceZone;
    }

    public String getNameSnapshot() {
        return nameSnapshot;
    }

    public void setNameSnapshot(String nameSnapshot) {
        this.nameSnapshot = nameSnapshot;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public BigDecimal getUnitPriceSnapshot() {
        return unitPriceSnapshot;
    }

    public void setUnitPriceSnapshot(BigDecimal unitPriceSnapshot) {
        this.unitPriceSnapshot = unitPriceSnapshot;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getLineTotalSnapshot() {
        return lineTotalSnapshot;
    }

    public void setLineTotalSnapshot(BigDecimal lineTotalSnapshot) {
        this.lineTotalSnapshot = lineTotalSnapshot;
    }
}
