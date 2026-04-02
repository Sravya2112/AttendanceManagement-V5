package com.example.attendance.controller;
import com.example.attendance.entity.Feedback;
import com.example.attendance.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin("*")
public class FeedbackController {
    @Autowired
    private FeedbackService service;
    @PostMapping
    public Feedback submitFeedback(@RequestBody Feedback feedback) {
        return service.save(feedback);
    }
    @GetMapping
    public List<Feedback> getAllFeedback() {
        return service.getAll();
    }
}
