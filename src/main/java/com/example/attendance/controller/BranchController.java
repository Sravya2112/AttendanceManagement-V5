package com.example.attendance.controller;

import com.example.attendance.entity.Branch;
import com.example.attendance.repository.BranchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/branches")
@CrossOrigin("*")
public class BranchController {
    
    @Autowired
    private BranchRepository repo;

    @GetMapping
    public List<Branch> getAll() {
        return repo.findAll();
    }

    @PostMapping
    public Branch create(@RequestBody Branch b) {
        return repo.save(b);
    }
}
