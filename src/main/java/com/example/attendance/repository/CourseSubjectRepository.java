package com.example.attendance.repository;
import com.example.attendance.entity.CourseSubject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseSubjectRepository extends JpaRepository<CourseSubject, Long> {
}
