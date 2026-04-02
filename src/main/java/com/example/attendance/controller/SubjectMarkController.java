package com.example.attendance.controller;

import com.example.attendance.entity.SubjectMark;
import com.example.attendance.entity.Student;
import com.example.attendance.repository.SubjectMarkRepository;
import com.example.attendance.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/students/{studentId}/subjects")
@CrossOrigin("*")
public class SubjectMarkController {
    
    @Autowired private SubjectMarkRepository repo;
    @Autowired private StudentRepository studentRepo;

    @GetMapping
    public List<SubjectMark> getSubjects(@PathVariable Long studentId) {
        return repo.findByStudentId(studentId);
    }

    @PostMapping
    public SubjectMark addSubject(@PathVariable Long studentId, @RequestBody SubjectMark mark) {
        Student student = studentRepo.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found"));
        mark.setStudent(student);
        return repo.save(mark);
    }
}
