package com.example.attendance;

import com.example.attendance.entity.*;
import com.example.attendance.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;

@SpringBootApplication
public class AttendanceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AttendanceApplication.class, args);
	}

    @Bean
    public CommandLineRunner initData(
            AdminUserRepository adminRepo, 
            ClassSectionRepository classRepo,
            CourseSubjectRepository subjectRepo,
            EventRepository eventRepo) {
        return args -> {
            if (adminRepo.count() == 0) {
                AdminUser admin = new AdminUser();
                admin.setUsername("admin");
                admin.setPassword("admin123");
                adminRepo.save(admin);
            }
            if (classRepo.count() == 0) {
                classRepo.save(new ClassSection("CSE-A"));
                classRepo.save(new ClassSection("CSE-B"));
                classRepo.save(new ClassSection("ECE-A"));
            }
            if (subjectRepo.count() == 0) {
                subjectRepo.save(new CourseSubject("Mathematics", true));
                subjectRepo.save(new CourseSubject("Physics", true));
                subjectRepo.save(new CourseSubject("Computer Science", true));
                subjectRepo.save(new CourseSubject("English", true));
            }
            if (eventRepo.count() == 0) {
                // Seed some Indian / International holidays
                Event e1 = new Event();
                e1.setTitle("Republic Day (India)");
                e1.setEventDate(LocalDate.now().withMonth(1).withDayOfMonth(26));
                e1.setDescription("National Holiday");
                eventRepo.save(e1);
                
                Event e2 = new Event();
                e2.setTitle("International Workers' Day");
                e2.setEventDate(LocalDate.now().withMonth(5).withDayOfMonth(1));
                e2.setDescription("Global Holiday");
                eventRepo.save(e2);
                
                Event e3 = new Event();
                e3.setTitle("Independence Day (India)");
                e3.setEventDate(LocalDate.now().withMonth(8).withDayOfMonth(15));
                e3.setDescription("National Holiday");
                eventRepo.save(e3);
            }
        };
    }
}
