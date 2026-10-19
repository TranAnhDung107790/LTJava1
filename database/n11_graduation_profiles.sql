USE [it24ab];
GO

IF OBJECT_ID(N'dbo.students', N'U') IS NULL
    THROW 50001, 'dbo.students does not exist in database it24ab. Run database/it24ab.sql first.', 1;
GO

IF EXISTS (
        SELECT id
        FROM dbo.students
        GROUP BY id
        HAVING COUNT(*) > 1
)
        THROW 50002, 'dbo.students contains duplicate id values; fix them before adding the graduation profile foreign key.', 1;
GO

IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes AS i
        WHERE i.object_id = OBJECT_ID(N'dbo.students')
            AND i.is_unique = 1
            AND i.is_disabled = 0
            AND i.has_filter = 0
            AND (SELECT COUNT(*)
                     FROM sys.index_columns AS key_columns
                     WHERE key_columns.object_id = i.object_id
                         AND key_columns.index_id = i.index_id
                         AND key_columns.key_ordinal > 0) = 1
            AND EXISTS (
                    SELECT 1
                    FROM sys.index_columns AS ic
                    JOIN sys.columns AS c
                        ON c.object_id = ic.object_id AND c.column_id = ic.column_id
                    WHERE ic.object_id = i.object_id
                        AND ic.index_id = i.index_id
                        AND ic.key_ordinal = 1
                        AND c.name = N'id'
            )
)
        ALTER TABLE dbo.students
                ADD CONSTRAINT UQ_students_id UNIQUE (id);
GO

IF OBJECT_ID(N'dbo.graduation_profiles', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.graduation_profiles (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_graduation_profiles PRIMARY KEY,
        profile_code NVARCHAR(50) NOT NULL,
        student_id UNIQUEIDENTIFIER NOT NULL,
        session_id UNIQUEIDENTIFIER NULL,
        status NVARCHAR(30) NOT NULL CONSTRAINT DF_graduation_profiles_status DEFAULT N'Pending',
        submitted_date DATETIME2(7) NULL,
        review_date DATETIME2(7) NULL,
        reviewer_id UNIQUEIDENTIFIER NULL,
        note NVARCHAR(500) NULL,
        is_active BIT NOT NULL CONSTRAINT DF_graduation_profiles_is_active DEFAULT 1,
        deleted_at DATETIME2(7) NULL,
        CONSTRAINT UQ_graduation_profiles_profile_code UNIQUE (profile_code),
        CONSTRAINT FK_graduation_profiles_students FOREIGN KEY (student_id)
            REFERENCES dbo.students(id)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.graduation_profiles WHERE profile_code = N'HS-TN-K23-001')
    INSERT INTO dbo.graduation_profiles
        (id, profile_code, student_id, status, submitted_date, review_date, reviewer_id, note, is_active)
    VALUES
        ('650e8400-e29b-41d4-a716-446655440001', N'HS-TN-K23-001', '550e8400-e29b-41d4-a716-446655440001', N'Pending', '2026-09-15T08:30:00', NULL, NULL, N'Hồ sơ đang chờ xét duyệt', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.graduation_profiles WHERE profile_code = N'HS-TN-K23-002')
    INSERT INTO dbo.graduation_profiles
        (id, profile_code, student_id, status, submitted_date, review_date, reviewer_id, note, is_active)
    VALUES
        ('650e8400-e29b-41d4-a716-446655440002', N'HS-TN-K23-002', '550e8400-e29b-41d4-a716-446655440002', N'Approved', '2026-09-16T09:00:00', '2026-09-20T14:00:00', NULL, N'Hồ sơ hợp lệ, đã duyệt', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.graduation_profiles WHERE profile_code = N'HS-TN-K23-003')
    INSERT INTO dbo.graduation_profiles
        (id, profile_code, student_id, status, submitted_date, review_date, reviewer_id, note, is_active)
    VALUES
        ('650e8400-e29b-41d4-a716-446655440003', N'HS-TN-K23-003', '550e8400-e29b-41d4-a716-446655440003', N'Rejected', '2026-09-17T10:15:00', '2026-09-21T11:30:00', NULL, N'Cần bổ sung giấy chứng nhận ngoại ngữ', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.graduation_profiles WHERE profile_code = N'HS-TN-K23-004')
    INSERT INTO dbo.graduation_profiles
        (id, profile_code, student_id, status, submitted_date, review_date, reviewer_id, note, is_active)
    VALUES
        ('650e8400-e29b-41d4-a716-446655440004', N'HS-TN-K23-004', '550e8400-e29b-41d4-a716-446655440004', N'Pending', '2026-09-18T13:45:00', NULL, NULL, N'Đã tiếp nhận hồ sơ', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.graduation_profiles WHERE profile_code = N'HS-TN-K23-005')
    INSERT INTO dbo.graduation_profiles
        (id, profile_code, student_id, status, submitted_date, review_date, reviewer_id, note, is_active)
    VALUES
        ('650e8400-e29b-41d4-a716-446655440005', N'HS-TN-K23-005', '550e8400-e29b-41d4-a716-446655440005', N'Approved', '2026-09-19T08:00:00', '2026-09-22T15:00:00', NULL, N'Đã duyệt hồ sơ xét tốt nghiệp', 1);
GO

SELECT gp.profile_code, s.student_code, s.full_name, gp.status, gp.submitted_date
FROM dbo.graduation_profiles AS gp
JOIN dbo.students AS s ON s.id = gp.student_id
WHERE gp.is_active = 1
ORDER BY gp.profile_code;
GO
