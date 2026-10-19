# Nhóm 11 — Phần A: API Quản lý Điều kiện tốt nghiệp

**Chỉ triển khai mục A** trong tài liệu `Nhóm 11(1).pdf` (trang 1–2, 5), không chứa các API kết quả, hồ sơ hay đợt xét.

## Yêu cầu
- JDK 17 trở lên; Maven 3.8+.
- Java Spring Boot 3.3, Spring Data JPA, Validation, H2 lưu trên ổ đĩa.

## Chạy độc lập
Mở terminal tại thư mục `graduation-conditions-api`:

```powershell
mvn spring-boot:run
```

API tại **http://localhost:8084** (có thể đổi `server.port` trong `src/main/resources/application.properties`).
H2 tạo file dữ liệu trong `./data` để không mất dữ liệu khi tắt ứng dụng.

## Danh sách 7 endpoint (đúng tài liệu)

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/api/graduation-conditions` | Danh sách chưa xóa (kể cả tạm ngừng áp dụng) |
| GET | `/api/graduation-conditions/{id}` | Xem chi tiết |
| GET | `/api/graduation-conditions/cohort/{cohort}` | Tra cứu bộ đang hiệu lực cho khóa |
| POST | `/api/graduation-conditions` | Thêm mới |
| PUT | `/api/graduation-conditions/{id}` | Cập nhật |
| PATCH | `/api/graduation-conditions/{id}/toggle-status` | Bật/tắt `active` |
| DELETE | `/api/graduation-conditions/{id}` | Xóa mềm: `deleted=true`, `active=false`, lưu `deletedAt` |

## Các trường JSON

| Trường | Ý nghĩa |
|---|---|
| `cohort` | Khóa sinh viên, ví dụ `K21` |
| `minimumCredits` | Số tín chỉ tối thiểu |
| `minimumGpa` | GPA tối thiểu (mặc định giả định thang 4) |
| `maximumFailedCourses` | Số học phần chưa đạt tối đa |
| `foreignLanguageRequired` | Có yêu cầu đạt chuẩn ngoại ngữ? |
| `itCertificateRequired` | Có yêu cầu đạt chuẩn tin học? |
| `conductRequired` | Có yêu cầu đạt chuẩn rèn luyện? |

> Tài liệu chỉ liệt kê tiêu chí, không định nghĩa tên field, thang GPA, các mức chuẩn cụ thể, hoặc cấu trúc DB. Những trường trên là thiết kế triển khai để có API chạy được. `*Required` là cờ **yêu cầu đạt chuẩn**, không phải kết quả kiểm tra của từng sinh viên. 

## Test nhanh bằng PowerShell

```powershell
$body = Get-Content .\sample-request.json -Raw
Invoke-RestMethod -Uri 'http://localhost:8084/api/graduation-conditions' -Method Post -ContentType 'application/json' -Body $body
Invoke-RestMethod 'http://localhost:8084/api/graduation-conditions'
Invoke-RestMethod 'http://localhost:8084/api/graduation-conditions/cohort/K21'
Invoke-RestMethod 'http://localhost:8084/api/graduation-conditions/1'
Invoke-RestMethod -Uri 'http://localhost:8084/api/graduation-conditions/1/toggle-status' -Method Patch
Invoke-RestMethod -Uri 'http://localhost:8084/api/graduation-conditions/1' -Method Put -ContentType 'application/json' -Body $body
Invoke-RestMethod -Uri 'http://localhost:8084/api/graduation-conditions/1' -Method Delete
```

POST trả 201; GET/PUT/PATCH trả 200; DELETE trả 204; sai đầu vào trả 400; trùng khóa trả 409; không tìm thấy trả 404.

## Ghép vào dự án Spring Boot cũ

Sao chép các package `controller`, `service`, `repository`, `entity`, `dto`, `exception` từ `src/main/java/com/example/graduationconditions` sang package con nằm trong phạm vi quét component của `@SpringBootApplication` hiện có. Đổi dòng `package` và import cho khớp. **Không** sao chép thêm class `GraduationConditionsApplication` nếu dự án đã có class main. Sử dụng datasource hiện tại của dự án và không sao chép đè `application.properties`. Với dự án đã có bảng/tên class trùng, cần kiểm tra trước khi ghép.

## Lưu ý

- Đây là API thành phần độc lập. Chưa thêm Spring Security vì tài liệu không định nghĩa phân quyền. Khi tích hợp, giới hạn POST/PUT/PATCH/DELETE cho cán bộ/admin.
- Mỗi khóa chỉ có **một bộ điều kiện chưa xóa** trong bản demo để tránh tra cứu không xác định; có thể điều chỉnh theo quy chế thực tế.
- H2 phù hợp demo/bài tập; triển khai thật nên dùng DB chung (MySQL/PostgreSQL), migrations và constraint ràng buộc trùng khóa.
