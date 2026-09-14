package anhdung.project1;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String sayHello() {
        return "Hello Spring Boot!";
    }

    @GetMapping("/student/{id}")
    public String getStudent(@PathVariable int id) {
        return "Siên viên có mã: " + id;
    }

    @GetMapping("/student")
    public String greet(@RequestParam String name) {
        return "Xin chào " + name;
    }

}