package com.example.quanlydaotao.n11.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Service;

import com.example.quanlydaotao.n11.entity.Student;
import com.example.quanlydaotao.n11.repository.StudentRepository;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final List<Student> fallbackStudents = new CopyOnWriteArrayList<>();

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
        initFallbackStudents();
    }

    private void initFallbackStudents() {
        fallbackStudents.add(createSample("8f64a671-de50-4c87-8b39-ff5bdbf387e8", "26687", "Hứa Tiến Tiến", "tien.hua@donga.edu.vn", "0901234561", "IT24AB"));
        fallbackStudents.add(createSample("35f6941e-b583-4625-8ce2-ff4d1990a891", "26563", "Ngô Hữu Tuấn", "tuan.ngo@donga.edu.vn", "0901234562", "IT24AB"));
        fallbackStudents.add(createSample("c21b452a-bb86-4054-a619-ff21dc207a19", "25549", "Hồ Hoàng Hùng", "hung.ho@donga.edu.vn", "0901234563", "IT24AB"));
        fallbackStudents.add(createSample("0e374a91-d6e6-4174-b7df-ff19e2e5876f", "23017", "Vũ Khánh Tùng", "tung.vu@donga.edu.vn", "0901234564", "IT24AB"));
        fallbackStudents.add(createSample("861670d3-393c-4c59-93b9-fea33e67b71f", "26395", "Hoàng Hoàng Tâm", "tam.hoang@donga.edu.vn", "0901234565", "IT24AB"));
        fallbackStudents.add(createSample("e86e5ca4-db05-436a-9ab0-fe6a6e9d1afc", "26666", "Chu Hà Linh", "linh.chu@donga.edu.vn", "0901234566", "IT24AB"));
        fallbackStudents.add(createSample("11111111-aaaa-bbbb-cccc-000000000001", "SV001", "Nguyễn Văn An", "a@gmail.com", "0901234567", "C2024A"));
        fallbackStudents.add(createSample("22222222-aaaa-bbbb-cccc-000000000002", "SV002", "Trần Thị B", "b@gmail.com", "0912345678", "C2024B"));
        fallbackStudents.add(createSample("33333333-aaaa-bbbb-cccc-000000000003", "SV003", "Lê Hoàng C", "c@gmail.com", "0923456789", "C2024C"));
        fallbackStudents.add(createSample("44444444-aaaa-bbbb-cccc-000000000004", "SV004", "Phạm Minh D", "d@gmail.com", "0933456789", "C2024A"));
    }

    private Student createSample(String idStr, String code, String name, String email, String phone, String className) {
        Student s = new Student(code, name, email, phone, className);
        s.setId(UUID.fromString(idStr));
        return s;
    }

    public List<Student> getFallbackStudents() {
        return new ArrayList<>(fallbackStudents);
    }

    public List<Student> getAll() {
        try {
            List<Student> list = studentRepository.findAll();
            if (list != null && !list.isEmpty()) {
                return list;
            }
            return getFallbackStudents();
        } catch (Exception e) {
            return getFallbackStudents();
        }
    }

    public List<Student> search(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAll();
        }
        try {
            String value = keyword.trim();
            List<Student> list = studentRepository.findByStudentCodeContainingIgnoreCaseOrFullNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContainingIgnoreCase(
                    value, value, value, value);
            if (list != null && !list.isEmpty()) {
                return list;
            }
        } catch (Exception ignored) {
        }
        String kw = keyword.trim().toLowerCase();
        return fallbackStudents.stream()
                .filter(s -> (s.getStudentCode() != null && s.getStudentCode().toLowerCase().contains(kw))
                        || (s.getFullName() != null && s.getFullName().toLowerCase().contains(kw))
                        || (s.getEmail() != null && s.getEmail().toLowerCase().contains(kw))
                        || (s.getPhone() != null && s.getPhone().toLowerCase().contains(kw)))
                .toList();
    }

    public Student getById(UUID id) {
        try {
            return studentRepository.findById(id)
                    .orElseGet(() -> fallbackStudents.stream()
                            .filter(s -> s.getId().equals(id))
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên với id: " + id)));
        } catch (Exception e) {
            return fallbackStudents.stream()
                    .filter(s -> s.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên với id: " + id));
        }
    }

    public Student save(Student student) {
        if (student.getId() == null) {
            student.setId(UUID.randomUUID());
        }
        try {
            return studentRepository.save(student);
        } catch (Exception e) {
            int idx = -1;
            for (int i = 0; i < fallbackStudents.size(); i++) {
                if (fallbackStudents.get(i).getId().equals(student.getId())) {
                    idx = i;
                    break;
                }
            }
            if (idx != -1) {
                fallbackStudents.set(idx, student);
            } else {
                fallbackStudents.add(0, student);
            }
            return student;
        }
    }

    public void delete(UUID id) {
        try {
            studentRepository.deleteById(id);
        } catch (Exception ignored) {
        }
        fallbackStudents.removeIf(s -> s.getId().equals(id));
    }
}
