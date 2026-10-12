package com.example.quanlydaotao.controller;

import com.example.quanlydaotao.dto.ApiResponse;
import com.example.quanlydaotao.dto.EmployeeRequest;
import com.example.quanlydaotao.dto.EmployeeResponse;
import com.example.quanlydaotao.entity.Department;
import com.example.quanlydaotao.entity.Employee;
import com.example.quanlydaotao.entity.EmployeePosition;
import com.example.quanlydaotao.entity.Position;
import com.example.quanlydaotao.service.DepartmentService;
import com.example.quanlydaotao.service.EmployeePositionService;
import com.example.quanlydaotao.service.EmployeeService;
import com.example.quanlydaotao.service.PositionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class EmployeeController {
    @Autowired
    private EmployeeService service;
    @Autowired
    private DepartmentService departmentService;
    @Autowired
    private PositionService positionService;
    @Autowired
    private EmployeePositionService employeePositionService;

    @PostMapping("/employees")
    public ResponseEntity<ApiResponse<EmployeeResponse>> create(@RequestBody EmployeeRequest request) {
        Employee emp = new Employee();
        emp.setUserId(request.getUserId());
        emp.setCode(request.getCode());
        emp.setFullName(request.getFullName());
        emp.setDateOfBirth(request.getDateOfBirth());
        emp.setGender(request.getGender());
        emp.setEmail(request.getEmail());
        emp.setPhone(request.getPhone());
        emp.setAddress(request.getAddress());
        emp.setHireDate(request.getHireDate());
        emp.setContractType(request.getContractType());
        emp.setSalaryCoefficient(request.getSalaryCoefficient());
        emp.setAcademicDegree(request.getAcademicDegree());
        emp.setAcademicTitle(request.getAcademicTitle());
        emp.setSpecialization(request.getSpecialization());

        Department dept = departmentService.findById(request.getDepartmentId()).orElseThrow(() -> new RuntimeException("Department not found"));
        Position pos = positionService.findById(request.getPositionId()).orElseThrow(() -> new RuntimeException("Position not found"));
        
        emp.setDepartment(dept);
        emp.setPosition(pos);

        Employee saved = service.save(emp);
        
        // Also create initial EmployeePosition record
        EmployeePosition ep = new EmployeePosition();
        ep.setEmployee(saved);
        ep.setPosition(pos);
        ep.setStartDate(request.getStartDate() != null ? request.getStartDate() : LocalDateTime.now());
        employeePositionService.assignPosition(saved.getId(), pos.getId(), ep);

        EmployeeResponse response = new EmployeeResponse(
            saved.getId(), saved.getCode(), saved.getFullName(), saved.getEmail(), saved.getIsActive(), saved.getCreatedAt()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(201, "Thêm mới hồ sơ giảng viên/nhân viên thành công", response));
    }

    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<List<Employee>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", service.findAll()));
    }

    @GetMapping("/employees/{id}")
    public ResponseEntity<ApiResponse<Employee>> getById(@PathVariable UUID id) {
        return service.findById(id)
            .map(val -> ResponseEntity.ok(new ApiResponse<>(200, "Success", val)))
            .orElseGet(() -> ResponseEntity.status(404).body(new ApiResponse<>(404, "Not Found", null)));
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<ApiResponse<Employee>> update(@PathVariable UUID id, @RequestBody Employee entity) {
        return service.findById(id).map(existing -> {
            entity.setId(id);
            return ResponseEntity.ok(new ApiResponse<>(200, "Updated successfully", service.save(entity)));
        }).orElseGet(() -> ResponseEntity.status(404).body(new ApiResponse<>(404, "Not Found", null)));
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        return service.findById(id).map(existing -> {
            service.deleteById(id);
            return ResponseEntity.ok(new ApiResponse<Void>(200, "Deleted successfully", null));
        }).orElseGet(() -> ResponseEntity.status(404).body(new ApiResponse<Void>(404, "Not Found", null)));
    }

    @GetMapping("/employees/search")
    public ResponseEntity<ApiResponse<List<Employee>>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", service.search(keyword)));
    }

    @GetMapping("/employees/department/{departmentId}")
    public ResponseEntity<ApiResponse<List<Employee>>> getByDepartment(@PathVariable UUID departmentId) {
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", service.findByDepartmentId(departmentId)));
    }

    @PatchMapping("/employees/{id}/status")
    public ResponseEntity<ApiResponse<Employee>> updateStatus(@PathVariable UUID id, @RequestBody Map<String, Boolean> body) {
        Boolean isActive = body.get("is_active");
        if (isActive == null) return ResponseEntity.badRequest().build();
        return service.updateStatus(id, isActive)
            .map(val -> ResponseEntity.ok(new ApiResponse<>(200, "Status updated", val)))
            .orElseGet(() -> ResponseEntity.status(404).body(new ApiResponse<>(404, "Not Found", null)));
    }
}
