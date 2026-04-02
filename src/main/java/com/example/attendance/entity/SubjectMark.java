package com.example.attendance.entity;

import javax.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class SubjectMark {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String subjectName;
    private Double marks;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="student_id")
    @JsonIgnore
    private Student student;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public Double getMarks() { return marks; }
    public void setMarks(Double marks) { this.marks = marks; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
}
