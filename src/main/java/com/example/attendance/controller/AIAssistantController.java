package com.example.attendance.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin("*")
public class AIAssistantController {

    @PostMapping("/chat")
    public Map<String, String> chatWithAdmin(@RequestBody Map<String, String> prompt) {
        String query = prompt.get("query").toLowerCase();
        String response = "I don't understand that query yet.";
        
        if (query.contains("lowest attendance")) {
            response = "AI Insight: CSE-B (62%) and ECE-A (58%) possess the lowest aggregations.";
        } else if (query.contains("defaulter")) {
            response = "AI Insight: Found defaulters: Bob, Alice (< 75% attendance).";
        } else if (query.contains("irregular marking")) {
            response = "AI Alert: Professor Smith shows irregular marking in morning slots.";
        } else {
            response = "AI Insight: All systems operate normally. Ask me about defaulters or low attendance.";
        }
        
        return java.util.Collections.singletonMap("response", response);
    }
    
    @GetMapping("/reminders")
    public List<String> getSmartReminders() {
        return java.util.Arrays.asList("Reminder: Attendance not marked for 10 AM CSE-B class.", "System Notice: 2 duplicates prevented yesterday.");
    }
}
