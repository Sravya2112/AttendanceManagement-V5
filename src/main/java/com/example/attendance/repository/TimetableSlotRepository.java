package com.example.attendance.repository;
import com.example.attendance.entity.TimetableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, Long> {
    List<TimetableSlot> findByClassSectionId(Long classSectionId);
}
