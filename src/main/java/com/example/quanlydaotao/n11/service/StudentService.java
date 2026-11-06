package com.example.quanlydaotao.n11.service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Service;

import com.example.quanlydaotao.n11.entity.Student;
import com.example.quanlydaotao.n11.repository.StudentRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final List<Student> fallbackStudents = new CopyOnWriteArrayList<>();

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
        initFallbackStudents();
    }

    private void initFallbackStudents() {
        try (InputStream is = getClass().getResourceAsStream("/data/students_800.json")) {
            if (is != null) {
                ObjectMapper mapper = new ObjectMapper();
                List<Student> list = mapper.readValue(is, new TypeReference<List<Student>>() {});
                if (list != null && !list.isEmpty()) {
                    fallbackStudents.addAll(list);
                    return;
                }
            }
        } catch (Exception e) {
            System.err.println("Không thể đọc /data/students_800.json: " + e.getMessage());
        }

        // Dự phòng tối thiểu nếu không đọc được file
        fallbackStudents.add(createSample("8f64a671-de50-4c87-8b39-ff5bdbf387e8", "26687", "Hứa Tiến Tiến", "tien.hua@donga.edu.vn", "0901234561", "IT24AB"));
        fallbackStudents.add(createSample("35f6941e-b583-4625-8ce2-ff4d1990a891", "26563", "Ngô Hữu Tuấn", "tuan.ngo@donga.edu.vn", "0901234562", "IT24AB"));
        fallbackStudents.add(createSample("c21b452a-bb86-4054-a619-ff21dc207a19", "25549", "Hồ Hoàng Hùng", "hung.ho@donga.edu.vn", "0901234563", "IT24AB"));
        fallbackStudents.add(createSample("0e374a91-d6e6-4174-b7df-ff19e2e5876f", "23017", "Vũ Khánh Tùng", "tung.vu@donga.edu.vn", "0901234564", "IT24AB"));
        fallbackStudents.add(createSample("861670d3-393c-4c59-93b9-fea33e67b71f", "26395", "Hoàng Hoàng Tâm", "tam.hoang@donga.edu.vn", "0901234565", "IT24AB"));
        fallbackStudents.add(createSample("e86e5ca4-db05-436a-9ab0-fe6a6e9d1afc", "26666", "Chu Hà Linh", "linh.chu@donga.edu.vn", "0901234566", "IT24AB"));
    }

    private Student createSample(String idStr, String code, String name, String email, String phone, String className) {
        Student s = new Student(code, name, email, phone, className);
        s.setId(UUID.fromString(idStr));
        return s;
    }

    public static String cleanStudentName(String name, String code) {
        if (name == null) return "";
        String cleaned = name.trim();
        if (code != null && !code.trim().isEmpty()) {
            String c = java.util.regex.Pattern.quote(code.trim());
            cleaned = cleaned.replaceAll("(?i)(\\s*[-–/|,]?\\s*\\(?\\[?" + c + "\\)?\\]?\\s*)$", "");
        }
        cleaned = cleaned.replaceAll("\\s*\\([A-Za-z0-9_.-]+\\)\\s*$", "");
        cleaned = cleaned.replaceAll("\\s*\\[[A-Za-z0-9_.-]+\\]\\s*$", "");
        cleaned = cleaned.replaceAll("\\s*[-–]\\s*[A-Za-z0-9_.-]+\\s*$", "");
        cleaned = cleaned.replaceAll("(?i)\\s+(?:SV|sv|it|IT)?[0-9]{3,8}\\s*$", "");
        cleaned = cleaned.replaceAll("\\s+\\d+\\s*$", "");
        return cleaned.trim();
    }

    private String getVietnameseSortKey(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) return "";
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length <= 1) return fullName.trim();
        String firstName = parts[parts.length - 1];
        StringBuilder sb = new StringBuilder(firstName);
        for (int i = 0; i < parts.length - 1; i++) {
            sb.append(" ").append(parts[i]);
        }
        return sb.toString();
    }

    private void sortStudentsAlphabetically(List<Student> list) {
        if (list == null || list.isEmpty()) return;
        java.text.Collator collator = java.text.Collator.getInstance(new java.util.Locale("vi", "VN"));
        collator.setStrength(java.text.Collator.PRIMARY);
        list.sort((s1, s2) -> {
            String key1 = getVietnameseSortKey(s1.getFullName());
            String key2 = getVietnameseSortKey(s2.getFullName());
            return collator.compare(key1, key2);
        });
    }

    public List<Student> getFallbackStudents() {
        List<Student> list = new ArrayList<>(fallbackStudents);
        sortStudentsAlphabetically(list);
        return list;
    }

    public List<Student> getAll() {
        // 1. Ưu tiên đọc từ bảng students_ nếu có dữ liệu 800 sinh viên
        try {
            List<Object[]> rows = studentRepository.findAllFromStudents_();
            if (rows != null && !rows.isEmpty()) {
                List<Student> list = new ArrayList<>();
                for (Object[] r : rows) {
                    UUID id = r[0] instanceof UUID ? (UUID) r[0] : UUID.fromString(r[0].toString());
                    String code = r[1] != null ? r[1].toString() : "SV";
                    String rawName = r[2] != null ? r[2].toString() : "Sinh viên";
                    String name = cleanStudentName(rawName, code);
                    String email = r[3] != null ? r[3].toString() : ("sv" + code + "@donga.edu.vn");
                    String phone = r[4] != null ? r[4].toString() : "0901234567";
                    String cls = r[5] != null ? r[5].toString() : "IT24AB";
                    Student s = new Student(code, name, email, phone, cls);
                    s.setId(id);
                    list.add(s);
                }
                sortStudentsAlphabetically(list);
                return list;
            }
        } catch (Exception ignored) {
        }

        // 2. Thử đọc từ bảng students
        try {
            List<Student> list = studentRepository.findAll();
            if (list != null && list.size() >= 50) {
                list.forEach(s -> s.setFullName(cleanStudentName(s.getFullName(), s.getStudentCode())));
                sortStudentsAlphabetically(list);
                return list;
            }
        } catch (Exception ignored) {
        }

        // 3. Fallback danh sách 800 sinh viên đã nạp
        return getFallbackStudents();
    }

    public List<Student> search(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAll();
        }
        String kw = keyword.trim().toLowerCase();
        List<Student> all = getAll();
        return all.stream()
                .filter(s -> (s.getStudentCode() != null && s.getStudentCode().toLowerCase().contains(kw))
                        || (s.getFullName() != null && s.getFullName().toLowerCase().contains(kw))
                        || (s.getEmail() != null && s.getEmail().toLowerCase().contains(kw))
                        || (s.getPhone() != null && s.getPhone().toLowerCase().contains(kw))
                        || (s.getClassName() != null && s.getClassName().toLowerCase().contains(kw)))
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
        if (student.getFullName() != null) {
            student.setFullName(cleanStudentName(student.getFullName(), student.getStudentCode()));
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
                fallbackStudents.add(student);
            }
            sortStudentsAlphabetically(fallbackStudents);
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
