package py.com.clinia.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import py.com.clinia.api.entity.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
}
