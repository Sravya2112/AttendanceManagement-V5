package com.example.attendance.repository;
import com.example.attendance.entity.SubjectMark;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubjectMarkRepository extends JpaRepository<SubjectMark, Long> {
    List<SubjectMark> findByStudentId(Long studentId);
}
