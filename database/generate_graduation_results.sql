USE [it24ab];
GO

/*
  Sinh dữ liệu mẫu cho dbo.graduation_results dựa trên:
  - dbo.students_ (danh sách sinh viên và training_program_id)
  - dbo.training_programs (chỉ tiêu tín chỉ của chương trình)
  File dump không có INSERT cho dbo.graduation_conditions, vì vậy script
  sẽ tạo điều kiện tốt nghiệp mặc định nếu chương trình chưa có điều kiện.

  Quy ước dữ liệu mẫu:
  result: 1 = đạt, 0 = chưa đạt
  classification: 1 = Xuất sắc, 2 = Giỏi, 3 = Khá, 4 = Trung bình, NULL = chưa đạt
*/

SET NOCOUNT ON;
BEGIN TRY
    BEGIN TRANSACTION;

    -- Tạo điều kiện tốt nghiệp cho các chương trình đang được sinh viên sử dụng,
    -- nhưng chỉ khi chương trình đó chưa có điều kiện.
    INSERT INTO dbo.graduation_conditions
    (
        id, program_id, applied_cohort, min_total_credits, min_gpa,
        max_failed_credits, english_requirement, it_requirement,
        conduct_required, note, created_at, is_active
    )
    SELECT
        NEWID(),
        tp.id,
        CONVERT(nvarchar(10), YEAR(tp.admission_year)),
        COALESCE(CONVERT(int, tp.required_credits), 110),
        CAST(2.00 AS decimal(3,2)),
        10,
        N'Đạt chuẩn ngoại ngữ theo quy định',
        N'Đạt chuẩn tin học theo quy định',
        N'Đạt',
        N'Điều kiện mặc định được tạo để phục vụ dữ liệu mẫu.',
        SYSDATETIME(),
        1
    FROM dbo.training_programs tp
    WHERE EXISTS
    (
        SELECT 1
        FROM dbo.students_ st
        WHERE st.training_program_id = tp.id
          AND st.is_active = 1
          AND st.deleted_at IS NULL
    )
    AND NOT EXISTS
    (
        SELECT 1
        FROM dbo.graduation_conditions gc
        WHERE gc.program_id = tp.id
          AND gc.is_active = 1
          AND gc.deleted_at IS NULL
    );

    ;WITH StudentSource AS
    (
        SELECT
            st.id AS student_id,
            st.training_program_id,
            st.created_at,
            ROW_NUMBER() OVER (ORDER BY st.code, st.id) AS rn
        FROM dbo.students_ st
        WHERE st.training_program_id IS NOT NULL
          AND st.is_active = 1
          AND st.deleted_at IS NULL
          AND NOT EXISTS
          (
              SELECT 1
              FROM dbo.graduation_results gr
              WHERE gr.student_id = st.id
                AND gr.is_active = 1
                AND gr.deleted_at IS NULL
          )
    ),
    StudentData AS
    (
        SELECT
            ss.student_id,
            gc.id AS condition_id,
            -- GPA mẫu dao động từ 1.80 đến 3.80, có 2 chữ số thập phân.
            CAST(1.80 + ((ss.rn * 17) % 201) / 100.0 AS decimal(3,2)) AS gpa,
            COALESCE(CONVERT(int, tp.required_credits), 110) AS required_credits,
            -- Tín chỉ hoàn thành mẫu, nằm trong khoảng 100 đến 140.
            CASE
                WHEN COALESCE(CONVERT(int, tp.required_credits), 110) > 0
                THEN COALESCE(CONVERT(int, tp.required_credits), 110)
                ELSE 110
            END AS total_credits,
            CASE WHEN ss.rn % 5 = 0 THEN 6
                 WHEN ss.rn % 7 = 0 THEN 3
                 ELSE 0
            END AS failed_credits,
            ss.rn
        FROM StudentSource ss
        JOIN dbo.training_programs tp
          ON tp.id = ss.training_program_id
        CROSS APPLY
        (
            SELECT TOP (1) gc0.id
            FROM dbo.graduation_conditions gc0
            WHERE gc0.program_id = tp.id
              AND gc0.is_active = 1
              AND gc0.deleted_at IS NULL
            ORDER BY gc0.created_at DESC
        ) gc
    )
    INSERT INTO dbo.graduation_results
    (
        id, student_id, condition_id, gpa, total_credits, failed_credits,
        result, classification, decision_date, reviewer, note,
        created_at, updated_at, created_by, updated_by,
        deleted_at, deleted_by, is_active
    )
    SELECT
        NEWID(),
        sd.student_id,
        sd.condition_id,
        sd.gpa,
        sd.total_credits,
        sd.failed_credits,
        CASE
            WHEN sd.gpa >= 2.00
             AND sd.total_credits >= sd.required_credits
             AND sd.failed_credits <= 10 THEN 1
            ELSE 0
        END,
        CASE
            WHEN sd.gpa >= 3.60
             AND sd.total_credits >= sd.required_credits
             AND sd.failed_credits <= 10 THEN 1
            WHEN sd.gpa >= 3.20
             AND sd.total_credits >= sd.required_credits
             AND sd.failed_credits <= 10 THEN 2
            WHEN sd.gpa >= 2.50
             AND sd.total_credits >= sd.required_credits
             AND sd.failed_credits <= 10 THEN 3
            WHEN sd.gpa >= 2.00
             AND sd.total_credits >= sd.required_credits
             AND sd.failed_credits <= 10 THEN 4
            ELSE NULL
        END,
        DATEADD(DAY, sd.rn % 365, CONVERT(date, '2026-01-01')),
        NULL,
        CASE
            WHEN sd.gpa >= 2.00
             AND sd.total_credits >= sd.required_credits
             AND sd.failed_credits <= 10
                THEN N'Dữ liệu tốt nghiệp mẫu: đủ điều kiện theo các chỉ tiêu mô phỏng.'
            ELSE N'Dữ liệu tốt nghiệp mẫu: chưa đáp ứng đầy đủ các chỉ tiêu mô phỏng.'
        END,
        SYSDATETIME(),
        NULL, NULL, NULL, NULL, NULL, 1
    FROM StudentData sd;

    COMMIT TRANSACTION;

    SELECT COUNT(*) AS total_graduation_results
    FROM dbo.graduation_results
    WHERE is_active = 1 AND deleted_at IS NULL;

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
