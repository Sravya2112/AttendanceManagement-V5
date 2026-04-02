package com.example.attendance.controller;

import com.example.attendance.entity.Attendance;
import com.example.attendance.entity.Student;
import com.example.attendance.service.AttendanceService;
import com.example.attendance.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin("*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private StudentService studentService;

    @GetMapping
    public List<Attendance> getAllAttendance() {
        return attendanceService.getAllAttendance();
    }

    @GetMapping("/student/{studentId}")
    public List<Attendance> getAttendanceByStudent(@PathVariable Long studentId) {
        return attendanceService.getAttendanceByStudentId(studentId);
    }

    @PostMapping
    public ResponseEntity<?> markAttendance(@RequestBody Attendance attendance) {
        // AI Validation Logic
        if (attendance.getDate() != null) {
            LocalDate attDate = attendance.getDate();
            LocalDate today = LocalDate.now();
            if (attDate.isBefore(today)) {
                return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("ai_error", "Auto Attendance Validation AI: Backdated entries ("+attDate+") are not permitted."));
            }
        }
        LocalTime now = LocalTime.now();
        if (now.isBefore(LocalTime.of(9, 0)) || now.isAfter(LocalTime.of(16, 0))) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("ai_error", "Auto Attendance Validation AI: Error: Attendance marked outside scheduled class time (9 AM - 4 PM)."));
        }

        // We need to fetch the real student to associate with
        if (attendance.getStudent() != null && attendance.getStudent().getId() != null) {
            Optional<Student> studentOpt = studentService.getStudentById(attendance.getStudent().getId());
            studentOpt.ifPresent(attendance::setStudent);
        }
        return ResponseEntity.ok(attendanceService.markAttendance(attendance));
    }
}
