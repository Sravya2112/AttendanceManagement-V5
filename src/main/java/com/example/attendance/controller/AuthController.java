package com.example.attendance.controller;

import com.example.attendance.entity.AdminUser;
import com.example.attendance.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {
    
    @Autowired
    private AdminUserRepository adminRepo;

    @Autowired
    private com.example.attendance.security.JwtUtil jwtUtil;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        
        Optional<AdminUser> userOpt = adminRepo.findByUsername(username);
        if (userOpt.isPresent()) {
            AdminUser u = userOpt.get();
            boolean passMatches = false;
            if (u.getPassword() != null && u.getPassword().startsWith("$2a$")) {
                passMatches = passwordEncoder.matches(password, u.getPassword());
            } else {
                // plaintext fallback / migrate
                passMatches = password.equals(u.getPassword());
                if(passMatches) {
                    u.setPassword(passwordEncoder.encode(password));
                    adminRepo.save(u);
                }
            }
            if (passMatches) {
                Map<String, Object> respMap = new java.util.HashMap<>();
                respMap.put("success", true);
                String role = u.getRole() != null ? u.getRole() : "ROLE_ADMIN"; // Default to admin for legacy users
                respMap.put("token", jwtUtil.generateToken(username, role));
                return ResponseEntity.ok(respMap);
            }
        }
        
        Map<String, Object> respMap = new java.util.HashMap<>();
        respMap.put("success", false);
        respMap.put("message", "Invalid credentials");
        return ResponseEntity.status(401).body(respMap);
    }
    
    @GetMapping("/profile/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {
        return adminRepo.findById(id)
                .map(u -> {
                    Map<String, Object> respMap = new java.util.HashMap<>();
                    respMap.put("username", u.getUsername());
                    respMap.put("profilePicBase64", u.getProfilePicBase64() != null ? u.getProfilePicBase64() : "");
                    return ResponseEntity.ok(respMap);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody Map<String, String> profileData) {
        return adminRepo.findById(id).map(u -> {
            if(profileData.containsKey("username")) {
                u.setUsername(profileData.get("username"));
            }
            if(profileData.containsKey("password") && !profileData.get("password").isEmpty()) {
                u.setPassword(profileData.get("password"));
            }
            if(profileData.containsKey("profilePicBase64")) {
                u.setProfilePicBase64(profileData.get("profilePicBase64"));
            }
            adminRepo.save(u);
            Map<String, Object> respMap = new java.util.HashMap<>();
            respMap.put("success", true);
            respMap.put("message", "Profile updated successfully");
            return ResponseEntity.ok(respMap);
        }).orElseGet(() -> {
            Map<String, Object> respMap = new java.util.HashMap<>();
            respMap.put("success", false);
            respMap.put("message", "User not found");
            return ResponseEntity.status(404).body(respMap);
        });
    }
}
