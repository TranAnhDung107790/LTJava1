-- ==================================================================================
-- SCRIPT CHUYỂN DỮ LIỆU GPA TỪ graduation_results SANG student_summaries
-- Cho phép truy xuất chính xác GPA, số tín chỉ tích lũy, số tín chỉ nợ theo từng sinh viên
-- ==================================================================================

USE [it24ab];
GO

-- BATCH 1: CẬP NHẬT CẤU TRÚC BẢNG (DDL)
IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'student_summaries' 
      AND COLUMN_NAME = 'registration_id' 
      AND IS_NULLABLE = 'NO'
)
BEGIN
    ALTER TABLE [dbo].[student_summaries] ALTER COLUMN [registration_id] UNIQUEIDENTIFIER NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'student_summaries' AND COLUMN_NAME = 'student_id'
)
BEGIN
    ALTER TABLE [dbo].[student_summaries] ADD [student_id] UNIQUEIDENTIFIER NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'student_summaries' AND COLUMN_NAME = 'total_credits'
)
BEGIN
    ALTER TABLE [dbo].[student_summaries] ADD [total_credits] INT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'student_summaries' AND COLUMN_NAME = 'failed_credits'
)
BEGIN
    ALTER TABLE [dbo].[student_summaries] ADD [failed_credits] INT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_student_summaries_student'
)
BEGIN
    ALTER TABLE [dbo].[student_summaries] 
    ADD CONSTRAINT [FK_student_summaries_student] 
    FOREIGN KEY ([student_id]) REFERENCES [dbo].[students_]([id]);
END
GO

-- BATCH 2: NẠP DỮ LIỆU TỪ graduation_results (DML)
INSERT INTO [dbo].[student_summaries] (
    [id],
    [student_id],
    [registration_id],
    [gpa_value],
    [total_score],
    [scale_id],
    [letter_grade],
    [total_credits],
    [failed_credits],
    [result],
    [is_finalized],
    [is_active],
    [created_at],
    [updated_at]
)
SELECT 
    NEWID() AS [id],
    gr.student_id,
    NULL AS [registration_id],
    gr.gpa AS [gpa_value],
    CAST(ROUND(gr.gpa * 2.5, 2) AS DECIMAL(4,2)) AS [total_score],
    CASE 
        WHEN gr.gpa >= 3.60 THEN 'a9efc06a-df98-4d10-b646-17bbc596bf6e' -- Thang A
        WHEN gr.gpa >= 2.50 THEN 'ef86f4f6-e8ce-46b4-b596-5493318f7db0' -- Thang B
        WHEN gr.gpa >= 2.00 THEN '483c2b24-d20d-4506-83b0-dfce2f13beee' -- Thang C
        WHEN gr.gpa >= 1.00 THEN '634479ca-411c-4277-8039-6b4128539f16' -- Thang D
        ELSE '5db9f578-b445-4c0e-9b2b-a1e86cc9e342'                     -- Thang F
    END AS [scale_id],
    CASE 
        WHEN gr.gpa >= 3.60 THEN 'A'
        WHEN gr.gpa >= 2.50 THEN 'B'
        WHEN gr.gpa >= 2.00 THEN 'C'
        WHEN gr.gpa >= 1.00 THEN 'D'
        ELSE 'F'
    END AS [letter_grade],
    gr.total_credits,
    gr.failed_credits,
    CASE WHEN gr.result = 1 THEN 'Pass' ELSE 'Fail' END AS [result],
    1 AS [is_finalized],
    1 AS [is_active],
    SYSDATETIME() AS [created_at],
    SYSDATETIME() AS [updated_at]
FROM [dbo].[graduation_results] gr
WHERE gr.is_active = 1
  AND NOT EXISTS (
      SELECT 1 FROM [dbo].[student_summaries] ss 
      WHERE ss.student_id = gr.student_id
  );
GO
