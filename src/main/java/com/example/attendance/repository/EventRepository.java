package com.example.attendance.repository;
import com.example.attendance.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
public interface EventRepository extends JpaRepository<Event, Long> {}
