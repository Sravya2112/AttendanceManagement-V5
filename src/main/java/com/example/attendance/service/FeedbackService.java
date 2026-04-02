package com.example.attendance.service;
import com.example.attendance.entity.Feedback;
import com.example.attendance.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FeedbackService {
    @Autowired
    private FeedbackRepository repository;
    public List<Feedback> getAll() { return repository.findAll(); }
    public Feedback save(Feedback fb) { return repository.save(fb); }
}
