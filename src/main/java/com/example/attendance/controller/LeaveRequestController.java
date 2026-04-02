package com.example.attendance.controller;

import com.example.attendance.entity.LeaveRequest;
import com.example.attendance.entity.Attendance;
import com.example.attendance.repository.LeaveRequestRepository;
import com.example.attendance.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Optional;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin("*")
public class LeaveRequestController {

    @Autowired
    private LeaveRequestRepository leaveRepo;

    @Autowired
    private AttendanceRepository attendanceRepo;

    @GetMapping
    public Iterable<LeaveRequest> getAllLeaves() {
        return leaveRepo.findAll();
    }

    @PostMapping
    public LeaveRequest applyLeave(@RequestBody LeaveRequest leave) {
        leave.setStatus("PENDING");
        return leaveRepo.save(leave);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveLeave(@PathVariable Long id) {
        Optional<LeaveRequest> leaveOpt = leaveRepo.findById(id);
        if (leaveOpt.isPresent()) {
            LeaveRequest leave = leaveOpt.get();
            leave.setStatus("APPROVED");
            leaveRepo.save(leave);

            // Auto-mark attendance as ON_LEAVE for the range
            LocalDate start = LocalDate.parse(leave.getStartDate());
            LocalDate end = LocalDate.parse(leave.getEndDate());
            
            for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
                Attendance att = new Attendance();
                att.setStudent(leave.getStudent());
                att.setDate(date);
                att.setStatus("ON_LEAVE");
                attendanceRepo.save(att);
            }

            return ResponseEntity.ok(leave);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectLeave(@PathVariable Long id) {
        Optional<LeaveRequest> leaveOpt = leaveRepo.findById(id);
        if (leaveOpt.isPresent()) {
            LeaveRequest leave = leaveOpt.get();
            leave.setStatus("REJECTED");
            leaveRepo.save(leave);
            return ResponseEntity.ok(leave);
        }
        return ResponseEntity.notFound().build();
    }
}
