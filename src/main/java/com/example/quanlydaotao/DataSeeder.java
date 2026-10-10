package com.example.quanlydaotao;

import com.example.quanlydaotao.entity.Department;
import com.example.quanlydaotao.entity.Employee;
import com.example.quanlydaotao.entity.EmployeePosition;
import com.example.quanlydaotao.entity.Position;
import com.example.quanlydaotao.repository.DepartmentRepository;
import com.example.quanlydaotao.repository.EmployeePositionRepository;
import com.example.quanlydaotao.repository.EmployeeRepository;
import com.example.quanlydaotao.repository.PositionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private DepartmentRepository departmentRepository;
    @Autowired
    private PositionRepository positionRepository;
    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    private EmployeePositionRepository employeePositionRepository;

    @Override
    public void run(String... args) throws Exception {
        // Nếu database chưa có khoa nào thì mới nạp dữ liệu mẫu
        if (departmentRepository.count() == 0) {
            System.out.println("Dang nap du lieu gia (Mock Data) vao SQL Server...");

            // 1. Tạo Khoa (Department)
            Department dept1 = new Department();
            dept1.setCode("CNTT");
            dept1.setName("Khoa Công nghệ Thông tin");
            dept1.setPhone("02363123456");
            dept1.setEmail("cntt@donga.edu.vn");
            dept1.setEstablishedDate(LocalDate.of(2009, 5, 15));
            departmentRepository.save(dept1);

            Department dept2 = new Department();
            dept2.setCode("QTKD");
            dept2.setName("Khoa Quản trị Kinh doanh");
            dept2.setPhone("02363789789");
            dept2.setEmail("qtkd@donga.edu.vn");
            dept2.setEstablishedDate(LocalDate.of(2010, 8, 20));
            departmentRepository.save(dept2);

            // 2. Tạo Chức vụ (Position)
            Position pos1 = new Position();
            pos1.setCode("HEAD_DEPT");
            pos1.setTitle("Trưởng khoa");
            pos1.setLevel(1);
            pos1.setDepartment(dept1);
            positionRepository.save(pos1);

            Position pos2 = new Position();
            pos2.setCode("LECTURER");
            pos2.setTitle("Giảng viên cơ hữu");
            pos2.setLevel(3);
            pos2.setDepartment(dept1);
            positionRepository.save(pos2);

            // 3. Tạo Nhân viên/Giảng viên (Employee)
            Employee emp1 = new Employee();
            emp1.setCode("GV202601");
            emp1.setFullName("Nguyễn Văn Hoàng");
            emp1.setDateOfBirth(LocalDate.of(1985, 4, 12));
            emp1.setGender((short) 1);
            emp1.setEmail("nguyenvanhoang@donga.edu.vn");
            emp1.setPhone("0905123999");
            emp1.setAddress("123 Điện Biên Phủ, Đà Nẵng");
            emp1.setDepartment(dept1);
            emp1.setPosition(pos1); // Vị trí chính
            emp1.setHireDate(LocalDate.of(2015, 8, 1));
            emp1.setContractType("Cơ hữu");
            emp1.setSalaryCoefficient(new BigDecimal("4.40"));
            emp1.setAcademicDegree("Tiến sĩ");
            emp1.setAcademicTitle("Phó Giáo sư");
            emp1.setSpecialization("Khoa học Dữ liệu");
            employeeRepository.save(emp1);

            Employee emp2 = new Employee();
            emp2.setCode("GV202602");
            emp2.setFullName("Trần Thị Mai Phương");
            emp2.setDateOfBirth(LocalDate.of(1992, 10, 25));
            emp2.setGender((short) 0);
            emp2.setEmail("tranmaiphuong@donga.edu.vn");
            emp2.setPhone("0934567888");
            emp2.setAddress("45 Nguyễn Văn Linh, Đà Nẵng");
            emp2.setDepartment(dept1);
            emp2.setPosition(pos2);
            emp2.setHireDate(LocalDate.of(2020, 3, 15));
            emp2.setContractType("Hợp đồng 3 năm");
            emp2.setSalaryCoefficient(new BigDecimal("3.00"));
            emp2.setAcademicDegree("Thạc sĩ");
            emp2.setSpecialization("Kỹ thuật phần mềm");
            employeeRepository.save(emp2);

            // 4. Tạo Lịch sử công tác (EmployeePosition)
            EmployeePosition ep1 = new EmployeePosition();
            ep1.setEmployee(emp1);
            ep1.setPosition(pos1);
            ep1.setStartDate(LocalDateTime.of(2015, 8, 1, 8, 0));
            ep1.setDescription("Bổ nhiệm chức danh Trưởng khoa CNTT");
            ep1.setNote("QĐ số 123/QĐ-ĐHA");
            employeePositionRepository.save(ep1);

            EmployeePosition ep2 = new EmployeePosition();
            ep2.setEmployee(emp2);
            ep2.setPosition(pos2);
            ep2.setStartDate(LocalDateTime.of(2020, 3, 15, 8, 0));
            ep2.setDescription("Ký hợp đồng giảng viên cơ hữu");
            employeePositionRepository.save(ep2);

            System.out.println("Da nap du lieu gia thanh cong! Ban co the mo Postman de test cac API GET.");
        }
    }
}
