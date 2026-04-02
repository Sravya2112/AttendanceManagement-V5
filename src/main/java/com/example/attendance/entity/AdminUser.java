package com.example.attendance.entity;

import javax.persistence.*;

@Entity
public class AdminUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    private String password;
    
    @Column(columnDefinition = "TEXT")
    private String profilePicBase64;
    
    private String role; // e.g. ROLE_ADMIN, ROLE_TEACHER, ROLE_STUDENT

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getProfilePicBase64() { return profilePicBase64; }
    public void setProfilePicBase64(String profilePicBase64) { this.profilePicBase64 = profilePicBase64; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
