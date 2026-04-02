package com.example.attendance.entity;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.ManyToOne;
import javax.persistence.JoinColumn;
import javax.persistence.FetchType;
import javax.persistence.CascadeType;
import java.util.List;
import java.util.ArrayList;

@Entity
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
    
    // New fields for marks and remarks
    private Double cgpa;
    private Double midMarks;
    private String remarks;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="class_section_id")
    private ClassSection classSection;
    
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubjectMark> subjectMarks = new ArrayList<>();

    public Student() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }
    public Double getMidMarks() { return midMarks; }
    public void setMidMarks(Double midMarks) { this.midMarks = midMarks; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    
    public List<SubjectMark> getSubjectMarks() { return subjectMarks; }
    public void setSubjectMarks(List<SubjectMark> subjectMarks) { this.subjectMarks = subjectMarks; }
    
    public ClassSection getClassSection() { return classSection; }
    public void setClassSection(ClassSection classSection) { this.classSection = classSection; }
}
