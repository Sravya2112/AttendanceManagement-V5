package com.example.attendance.controller;

import com.example.attendance.entity.*;
import com.example.attendance.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@CrossOrigin("*")
public class CourseSubjectController {
    @Autowired private CourseSubjectRepository repo;

    @GetMapping
    public List<CourseSubject> getAll() { return repo.findAll(); }

    @PostMapping
    public CourseSubject create(@RequestBody CourseSubject c) { return repo.save(c); }
}
