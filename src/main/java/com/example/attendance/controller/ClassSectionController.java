package com.example.attendance.controller;

import com.example.attendance.entity.*;
import com.example.attendance.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin("*")
public class ClassSectionController {
    @Autowired private ClassSectionRepository repo;

    @GetMapping
    public List<ClassSection> getAll() { return repo.findAll(); }

    @PostMapping
    public ClassSection create(@RequestBody ClassSection c) { return repo.save(c); }
}
