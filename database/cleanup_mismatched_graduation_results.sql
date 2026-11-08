-- =====================================================================================
-- KỊCH BẢN DỌN DẸP DỮ LIỆU SAI LỆCH XÉT TỐT NGHIỆP (PHƯƠNG ÁN 1)
-- Phân hệ: Nhóm 11 - Quản lý Tốt nghiệp
-- Dự án: quanlydaotaoit24ab
-- Ngày thực hiện: 09/11/2026
-- =====================================================================================

USE [it24ab];
GO

SET NOCOUNT ON;

PRINT '=====================================================================================';
PRINT 'BẮT ĐẦU TIẾN TRÌNH DỌN DẸP DỮ LIỆU LỆCH KHÓA TRONG BẢNG GRADUATION_RESULTS (PHƯƠNG ÁN 1)';
PRINT '=====================================================================================';

-- -------------------------------------------------------------------------------------
-- BƯỚC 1: TẠO BẢNG BACKUP TOÀN BỘ DỮ LIỆU TRƯỚC KHI THỰC HIỆN
-- -------------------------------------------------------------------------------------
PRINT '1. Đang tiến hành sao lưu dữ liệu hiện tại...';

IF OBJECT_ID('dbo.graduation_results_bak_20261109', 'U') IS NOT NULL
BEGIN
    PRINT '-> Bảng backup dbo.graduation_results_bak_20261109 đã tồn tại, tiến hành ghi đè...';
    DROP TABLE dbo.graduation_results_bak_20261109;
END

SELECT * 
INTO dbo.graduation_results_bak_20261109 
FROM dbo.graduation_results;

DECLARE @backup_count INT;
SELECT @backup_count = COUNT(*) FROM dbo.graduation_results_bak_20261109;
PRINT '-> Đã sao lưu thành công ' + CAST(@backup_count AS VARCHAR(10)) + ' bản ghi vào dbo.graduation_results_bak_20261109.';
GO

-- -------------------------------------------------------------------------------------
-- BƯỚC 2: XÓA CÁC BẢN GHI LỆCH KHÓA (1,280 BẢN GHI RÁC)
-- Quy tắc nghiệp vụ:
-- - Bộ điều kiện K23: Chỉ giữ sinh viên có mã 23% hoặc lớp IT23% (xóa tất cả sinh viên khác)
-- - Bộ điều kiện K24: Chỉ giữ sinh viên có mã 24% hoặc lớp IT24% (xóa tất cả sinh viên khác)
-- - Bộ điều kiện K25: Chỉ giữ sinh viên có mã 25% hoặc lớp IT25% (xóa tất cả sinh viên khác)
-- -------------------------------------------------------------------------------------
PRINT '2. Đang xóa các bản ghi lệch khóa...';

BEGIN TRANSACTION;

BEGIN TRY
    DELETE gr
    FROM dbo.graduation_results gr
    JOIN dbo.graduation_conditions gc ON gr.condition_id = gc.id
    LEFT JOIN dbo.students s ON gr.student_id = s.id
    WHERE 
        (gc.applied_cohort = 'K23' AND NOT (s.student_code LIKE '23%' OR s.class_name LIKE 'IT23%'))
        OR (gc.applied_cohort = 'K24' AND NOT (s.student_code LIKE '24%' OR s.class_name LIKE 'IT24%'))
        OR (gc.applied_cohort = 'K25' AND NOT (s.student_code LIKE '25%' OR s.class_name LIKE 'IT25%'));

    DECLARE @deleted_rows INT = @@ROWCOUNT;
    PRINT '-> Đã xóa thành công ' + CAST(@deleted_rows AS VARCHAR(10)) + ' bản ghi lệch khóa.';

    COMMIT TRANSACTION;
    PRINT '-> Giao dịch hoàn tất thành công (COMMIT).';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '-> Xảy ra lỗi khi xóa dữ liệu, đã ROLLBACK!';
    PRINT ERROR_MESSAGE();
END CATCH;
GO

-- -------------------------------------------------------------------------------------
-- BƯỚC 3: ĐỒNG BỘ LẠI DỮ LIỆU ĐIỂM TỪ STUDENT_SUMMARIES CHO 480 BẢN GHI CHUẨN
-- Đảm bảo GPA, tổng tín chỉ, số tín chỉ nợ và xếp loại chuẩn 100%
-- -------------------------------------------------------------------------------------
PRINT '3. Đồng bộ lại dữ liệu điểm chuẩn từ student_summaries...';

UPDATE gr
SET 
    gr.gpa = ss.gpa_value,
    gr.total_credits = ss.total_credits,
    gr.failed_credits = ss.failed_credits,
    gr.result = CASE 
        WHEN ss.gpa_value >= gc.min_gpa 
             AND ss.total_credits >= gc.min_total_credits 
             AND ss.failed_credits <= gc.max_failed_credits 
        THEN 1 ELSE 0 
    END,
    gr.classification = CASE 
        WHEN ss.gpa_value >= gc.min_gpa 
             AND ss.total_credits >= gc.min_total_credits 
             AND ss.failed_credits <= gc.max_failed_credits 
        THEN 
            CASE 
                WHEN ss.gpa_value >= 3.60 THEN 1 -- Xuất sắc
                WHEN ss.gpa_value >= 3.20 THEN 2 -- Giỏi
                WHEN ss.gpa_value >= 2.50 THEN 3 -- Khá
                ELSE 4                           -- Trung bình
            END
        ELSE NULL 
    END,
    gr.note = N'Đã chuẩn hóa dữ liệu theo khóa ' + gc.applied_cohort,
    gr.updated_at = SYSDATETIME()
FROM dbo.graduation_results gr
JOIN dbo.graduation_conditions gc ON gr.condition_id = gc.id
JOIN dbo.students s ON gr.student_id = s.id
JOIN dbo.student_summaries ss ON s.id = ss.student_id AND ss.is_active = 1;

PRINT '-> Đã đồng bộ điểm và xếp loại cho ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' bản ghi chuẩn.';
GO

-- -------------------------------------------------------------------------------------
-- BƯỚC 4: KIỂM CHỨNG & BÁO CÁO KẾT QUẢ SAU DỌN DẸP
-- -------------------------------------------------------------------------------------
PRINT '4. Kiểm chứng dữ liệu sau khi dọn dẹp:';

-- Thống kê theo bộ điều kiện & khóa
SELECT 
    gc.applied_cohort AS [Khóa điều kiện],
    LEFT(s.student_code, 2) AS [Khóa sinh viên],
    COUNT(*) AS [Số lượng SV],
    SUM(CASE WHEN gr.result = 1 THEN 1 ELSE 0 END) AS [Số SV Đạt],
    SUM(CASE WHEN gr.result = 0 THEN 1 ELSE 0 END) AS [Số SV Chưa đạt]
FROM dbo.graduation_results gr
JOIN dbo.graduation_conditions gc ON gr.condition_id = gc.id
LEFT JOIN dbo.students s ON gr.student_id = s.id
GROUP BY gc.applied_cohort, LEFT(s.student_code, 2)
ORDER BY gc.applied_cohort, [Khóa sinh viên];

-- Kiểm tra còn bản ghi lệch khóa nào không (kỳ vọng: 0)
SELECT COUNT(*) AS [Số bản ghi lệch khóa còn lại (kỳ vọng 0)]
FROM dbo.graduation_results gr
JOIN dbo.graduation_conditions gc ON gr.condition_id = gc.id
LEFT JOIN dbo.students s ON gr.student_id = s.id
WHERE 
    (gc.applied_cohort = 'K23' AND NOT (s.student_code LIKE '23%' OR s.class_name LIKE 'IT23%'))
    OR (gc.applied_cohort = 'K24' AND NOT (s.student_code LIKE '24%' OR s.class_name LIKE 'IT24%'))
    OR (gc.applied_cohort = 'K25' AND NOT (s.student_code LIKE '25%' OR s.class_name LIKE 'IT25%'));
GO
