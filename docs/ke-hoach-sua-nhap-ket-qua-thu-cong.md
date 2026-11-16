# Kế hoạch sửa luồng nhập kết quả tốt nghiệp thủ công

## 1. Vấn đề hiện tại

Form **Nhập kết quả thủ công** yêu cầu nhập lại GPA, tổng tín chỉ, tín chỉ rớt, kết quả xét và xếp loại sau khi đã chọn sinh viên. Đây là dữ liệu đã có trong `student_summaries` hoặc có thể tính từ dữ liệu tổng kết và bộ điều kiện tốt nghiệp, nên dễ gây nhập trùng hoặc sai lệch.

## 2. Quy tắc nghiệp vụ mới

1. Người dùng chọn sinh viên và bộ điều kiện tốt nghiệp.
2. Hệ thống tải GPA, tổng tín chỉ và tín chỉ rớt từ `student_summaries`.
3. Hệ thống tính **Đạt/Chưa đạt** theo:
   - tổng tín chỉ >= `min_total_credits`;
   - GPA >= `min_gpa`;
   - tín chỉ rớt <= `max_failed_credits`.
4. Nếu đạt, xếp loại theo GPA:
   - từ 3.60: Xuất sắc;
   - từ 3.20: Giỏi;
   - từ 2.50: Khá;
   - dưới 2.50: Trung bình.
5. Các dữ liệu GPA, tín chỉ, kết quả và xếp loại chỉ hiển thị, không cho nhập tay.
6. Nếu không có summary hợp lệ, hệ thống thông báo lỗi và khóa nút lưu.
7. Người dùng vẫn nhập được ngày ra quyết định, người duyệt và ghi chú.
8. Backend luôn đọc lại summary và tự tính trước khi lưu; không tin các giá trị dẫn xuất gửi từ frontend.

## 3. Thay đổi dự kiến/đã thực hiện

### Frontend

- Modal tại `src/main/resources/static/graduation-results.html` hiển thị các trường dẫn xuất ở chế độ chỉ đọc.
- `src/main/resources/static/assets/js/graduation-result.js` tải summary khi sinh viên hoặc bộ điều kiện thay đổi.
- Form hiển thị trạng thái tải, thiếu dữ liệu hoặc lỗi API.
- Luồng chỉnh sửa cũng tái tải summary để bảo đảm dữ liệu nhất quán.

### Backend

- API `GET /api/graduation-results/student/{studentId}/summary` trả về:

```json
{
  "studentId": "uuid",
  "gpa": 3.25,
  "totalCredits": 130,
  "failedCredits": 0
}
```

- `POST /api/graduation-results` và `PUT /api/graduation-results/{id}` tự lấy summary, tính `result` và `classification` trước khi lưu.
- Sinh viên thiếu dữ liệu trong `student_summaries` nhận lỗi HTTP 400 với thông báo nghiệp vụ rõ ràng.

## 4. Tiêu chí nghiệm thu

- Chọn sinh viên có summary: các trường GPA/tín chỉ tự điền, trạng thái và xếp loại tự tính, nút lưu được bật.
- Đổi bộ điều kiện: trạng thái/xếp loại được tính lại theo bộ điều kiện mới.
- Chọn sinh viên không có summary: hiển thị cảnh báo và không cho lưu.
- Sửa bản ghi: không thể ghi đè GPA/tín chỉ/trạng thái/xếp loại bằng dữ liệu tùy ý từ frontend.
- Ngày quyết định, người duyệt và ghi chú vẫn được lưu/cập nhật bình thường.
- Luồng xét duyệt tự động hiện có tiếp tục dùng `student_summaries` làm nguồn dữ liệu.
