package anhdung.project1.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class StudentViewController {

    @GetMapping("/students")
    public String viewStudents() {
        return "students";
    }

    @GetMapping("/admin")
    public String viewAdmin() {
        return "admin_students";
    }
}