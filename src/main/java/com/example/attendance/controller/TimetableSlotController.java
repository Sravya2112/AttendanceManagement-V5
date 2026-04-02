package com.example.attendance.controller;

import com.example.attendance.entity.*;
import com.example.attendance.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/timetable")
@CrossOrigin("*")
public class TimetableSlotController {
    @Autowired private TimetableSlotRepository repo;

    @GetMapping
    public List<TimetableSlot> getAll() { return repo.findAll(); }
    
    @GetMapping("/class/{classId}")
    public List<TimetableSlot> getByClass(@PathVariable Long classId) { return repo.findByClassSectionId(classId); }

    @PostMapping
    public TimetableSlot create(@RequestBody TimetableSlot t) { return repo.save(t); }
    
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { repo.deleteById(id); }
}
