package com.example.attendance.repository;

import com.example.attendance.entity.LeaveRequest;
import org.springframework.data.repository.CrudRepository;

public interface LeaveRequestRepository extends CrudRepository<LeaveRequest, Long> {
}
