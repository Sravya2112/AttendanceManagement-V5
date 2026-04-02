package com.example.attendance.entity;

import javax.persistence.*;
import java.time.LocalTime;

@Entity
public class TimetableSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="class_section_id")
    private ClassSection classSection;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="subject_id")
    private CourseSubject subject;
    
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ClassSection getClassSection() { return classSection; }
    public void setClassSection(ClassSection classSection) { this.classSection = classSection; }
    public CourseSubject getSubject() { return subject; }
    public void setSubject(CourseSubject subject) { this.subject = subject; }
    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
}
