# Kế hoạch nâng cấp xuất báo cáo Word theo tiêu chí

## 1. Mục tiêu

Thay đổi nút **Xuất Word** trên trang kết quả tốt nghiệp: thay vì xuất ngay theo bộ lọc hiện tại, nút sẽ mở modal để người dùng chọn các tiêu chí xuất báo cáo. Modal hỗ trợ trạng thái đạt/chưa đạt, nhiều bộ tiêu chuẩn và nhiều lớp đã có kết quả xét tốt nghiệp.

## 2. Quyết định nghiệp vụ

- Khi mở modal, trạng thái và bộ tiêu chuẩn đang chọn trên thanh tìm kiếm được điền sẵn.
- Modal cho phép đổi lại tiêu chí trước khi xuất.
- Trạng thái mặc định là **Tất cả**.
- Bộ tiêu chuẩn cho phép chọn **Tất cả** hoặc nhiều bộ tiêu chuẩn.
- Lớp cho phép chọn **Tất cả** hoặc nhiều lớp; danh sách chỉ lấy các lớp đang có bản ghi kết quả xét tốt nghiệp.
- Khi thay đổi bộ tiêu chuẩn trong modal, danh sách lớp được tải lại và chỉ hiển thị các lớp có kết quả thuộc những bộ tiêu chuẩn đã chọn.
- Không chọn lớp cụ thể thì xuất tất cả lớp phù hợp các tiêu chí còn lại.
- Không có kết quả phù hợp phải trả thông báo rõ ràng, không tải file Word rỗng nếu backend xác định được.

## 3. Hiện trạng cần thay đổi

- Frontend hiện gọi `GET /api/graduation-results/export/word` và chỉ truyền `conditionId`.
- Thanh tìm kiếm có `result` và `conditionId` nhưng hai giá trị này chưa được truyền vào API xuất Word.
- Backend export đang truy vấn theo một `conditionId` hoặc toàn bộ dữ liệu, chưa có lọc trạng thái và lớp.
- Dữ liệu lớp nằm ở `students.class_name`, được liên kết với `graduation_results.student_id`.

## 4. Yêu cầu

- **REQ-001:** Bấm Xuất Word mở modal, không tải file ngay lập tức.
- **REQ-002:** Modal có lựa chọn trạng thái: Tất cả, Đạt tốt nghiệp, Chưa đạt.
- **REQ-003:** Modal có lựa chọn nhiều bộ tiêu chuẩn hoặc Tất cả.
- **REQ-004:** Modal có lựa chọn nhiều lớp hoặc Tất cả; chỉ hiển thị lớp đã có kết quả xét tốt nghiệp.
- **REQ-005:** Modal được điền sẵn trạng thái và bộ tiêu chuẩn đang chọn trên thanh tìm kiếm.
- **REQ-006:** Backend nhận và áp dụng đồng thời các tiêu chí trạng thái, bộ tiêu chuẩn và lớp.
- **REQ-007:** File Word chỉ chứa dữ liệu phù hợp với các tiêu chí đã chọn, vẫn giữ phân nhóm Đạt/Chưa đạt và lý do không đạt.
- **REQ-008:** Giữ trạng thái loading, tên file, thông báo thành công/lỗi và không làm ảnh hưởng các bộ lọc trên bảng.

## 5. Thiết kế triển khai

### Frontend

- Thêm modal `wordExportModal` trong `src/main/resources/static/graduation-results.html`.
- Modal có select trạng thái, select multiple bộ tiêu chuẩn và select multiple lớp.
- Khi mở modal, trạng thái và bộ tiêu chuẩn lấy từ `currentFilterResult`/`currentFilterCondition`.
- Danh sách lớp tải từ API metadata, không suy ra chỉ từ trang hiện tại vì bảng có phân trang.
- Khi xác nhận, frontend gửi `result`, nhiều `conditionIds` và nhiều `classNames`.
- Lựa chọn Tất cả được chuẩn hóa để không gửi đồng thời với danh sách cụ thể.

### Backend

- Mở rộng `GET /api/graduation-results/export/word` nhận trạng thái, nhiều bộ tiêu chuẩn và nhiều lớp.
- Thêm endpoint lấy danh sách lớp distinct từ các kết quả active.
- Mở rộng repository/service/controller để lọc đồng thời `result`, `condition_id` và `class_name`.
- Giữ lookup bộ điều kiện theo từng bản ghi để sinh đúng lý do không đạt khi chọn nhiều bộ tiêu chuẩn.
- Trả lỗi rõ ràng khi không có dữ liệu hoặc tiêu chí không hợp lệ.

### Báo cáo Word

- Giữ cấu trúc báo cáo, phân nhóm Đạt/Chưa đạt và lý do không đạt.
- Khi chọn nhiều bộ tiêu chuẩn, không dùng một bộ tiêu chuẩn đơn lẻ làm tiêu chí chung; lý do vẫn lấy theo condition của từng bản ghi.

## 6. Kiểm thử và nghiệm thu

- Mở modal và kiểm tra giá trị mặc định lấy từ thanh tìm kiếm.
- Chọn Tất cả trạng thái, một trạng thái, nhiều bộ tiêu chuẩn và nhiều lớp.
- Kiểm tra lớp chỉ xuất hiện nếu đã có kết quả xét tốt nghiệp.
- Kiểm tra báo cáo chỉ chứa bản ghi thỏa toàn bộ tiêu chí.
- Kiểm tra loading, lỗi API, file rỗng và hồi quy bộ lọc bảng.

## 7. Danh sách công việc

- [ ] T001 Thêm modal chọn trạng thái, nhiều bộ tiêu chuẩn và nhiều lớp trong `graduation-results.html`.
- [ ] T002 Cập nhật handler mở modal, nạp mặc định và submit export trong `graduation-result.js`.
- [ ] T003 Thêm endpoint danh sách lớp và mở rộng API export.
- [ ] T004 Mở rộng repository/service để lọc trạng thái, nhiều bộ tiêu chuẩn và nhiều lớp.
- [ ] T005 Bảo toàn format Word, phân nhóm và lý do không đạt.
- [ ] T006 Bổ sung test và kiểm thử hồi quy.
