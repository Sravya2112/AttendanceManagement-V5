package com.example.attendance.controller;

import com.example.attendance.entity.Event;
import com.example.attendance.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin("*")
public class EventController {
    
    @Autowired
    private EventRepository eventRepo;
    
    @GetMapping
    public List<Event> getAllEvents() {
        return eventRepo.findAll();
    }
    
    @PostMapping
    public Event createEvent(@RequestBody Event event) {
        return eventRepo.save(event);
    }
    
    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable Long id) {
        eventRepo.deleteById(id);
    }
}
