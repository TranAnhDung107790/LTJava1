-- ==================================================================================
-- HỆ THỐNG QUẢN LÝ ĐÀO TẠO - NHÓM 11: QUẢN LÝ TỐT NGHIỆP
-- Bao gồm:
-- 1. Bổ sung Primary Key cho bảng students (nếu chưa có)
-- 2. graduation_conditions  : Bộ tiêu chí điều kiện tốt nghiệp
-- 3. graduation_sessions    : Đợt xét tốt nghiệp
-- 4. graduation_results     : Kết quả xét duyệt tốt nghiệp
-- 5. graduation_profiles    : Hồ sơ đề nghị xét tốt nghiệp
-- ==================================================================================

USE [it24ab];
GO

-- ==================================================================================
-- 1. ĐẢM BẢO BẢNG students CÓ PRIMARY KEY TRƯỚC KHI TẠO FOREIGN KEY
-- ==================================================================================
IF EXISTS (SELECT 1 FROM sys.tables WHERE [name] = 'students')
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM sys.key_constraints 
        WHERE [type] = 'PK' AND [parent_object_id] = OBJECT_ID('dbo.students')
    )
    BEGIN
        ALTER TABLE [dbo].[students] ALTER COLUMN [id] [uniqueidentifier] NOT NULL;
        ALTER TABLE [dbo].[students] ADD CONSTRAINT [PK_students_id] PRIMARY KEY CLUSTERED ([id] ASC);
        PRINT N'Đã thêm khóa chính PK_students_id cho bảng students.';
    END
END
GO


-- ==================================================================================
-- 2. TẠO BẢNG graduation_conditions (TIÊU CHÍ ĐIỀU KIỆN TỐT NGHIỆP)
-- ==================================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE [name] = 'graduation_conditions')
BEGIN
    CREATE TABLE graduation_conditions (
        id UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT PK_graduation_conditions PRIMARY KEY
            DEFAULT NEWID(),

        program_id UNIQUEIDENTIFIER NOT NULL,

        applied_cohort NVARCHAR(10) NOT NULL,

        min_total_credits INT NOT NULL,

        min_gpa DECIMAL(3,2) NOT NULL,

        max_failed_credits INT NOT NULL,

        english_requirement NVARCHAR(100) NULL,

        it_requirement NVARCHAR(100) NULL,

        conduct_required NVARCHAR(50) NULL,

        note NVARCHAR(MAX) NULL,

        created_at DATETIME2 NOT NULL
            CONSTRAINT DF_graduation_conditions_created_at
            DEFAULT SYSDATETIME(),

        updated_at DATETIME2 NULL,

        created_by UNIQUEIDENTIFIER NULL,

        updated_by UNIQUEIDENTIFIER NULL,

        deleted_at DATETIME2 NULL,

        deleted_by UNIQUEIDENTIFIER NULL,

        is_active BIT NOT NULL
            CONSTRAINT DF_graduation_conditions_is_active
            DEFAULT 1,

        CONSTRAINT CK_graduation_conditions_min_gpa
            CHECK (min_gpa >= 0 AND min_gpa <= 4.00),

        CONSTRAINT CK_graduation_conditions_min_credits
            CHECK (min_total_credits >= 0),

        CONSTRAINT CK_graduation_conditions_failed_credits
            CHECK (max_failed_credits >= 0)
    );
    PRINT N'Đã tạo bảng graduation_conditions thành công.';
END
GO


-- ==================================================================================
-- 3. TẠO BẢNG graduation_sessions (ĐỢT XÉT TỐT NGHIỆP)
-- ==================================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE [name] = 'graduation_sessions')
BEGIN
    CREATE TABLE graduation_sessions (
        id UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT PK_graduation_sessions PRIMARY KEY
            DEFAULT NEWID(),

        session_code VARCHAR(50) NOT NULL
            CONSTRAINT UQ_graduation_sessions_code UNIQUE,

        session_name NVARCHAR(255) NOT NULL,

        academic_year VARCHAR(20) NULL,

        semester INT NULL,

        start_date DATE NULL,

        due_date DATE NULL,

        note NVARCHAR(MAX) NULL,

        created_at DATETIME2 NOT NULL
            CONSTRAINT DF_graduation_sessions_created_at
            DEFAULT SYSDATETIME(),

        updated_at DATETIME2 NULL,

        created_by UNIQUEIDENTIFIER NULL,

        updated_by UNIQUEIDENTIFIER NULL,

        deleted_at DATETIME2 NULL,

        deleted_by UNIQUEIDENTIFIER NULL,

        is_active BIT NOT NULL
            CONSTRAINT DF_graduation_sessions_is_active
            DEFAULT 1
    );
    PRINT N'Đã tạo bảng graduation_sessions thành công.';
END
GO


-- ==================================================================================
-- 4. TẠO BẢNG graduation_results (KẾT QUẢ XÉT TỐT NGHIỆP)
-- ==================================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE [name] = 'graduation_results')
BEGIN
    CREATE TABLE graduation_results (
        id UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT PK_graduation_results PRIMARY KEY
            DEFAULT NEWID(),

        student_id UNIQUEIDENTIFIER NOT NULL,

        condition_id UNIQUEIDENTIFIER NOT NULL,

        gpa DECIMAL(3,2) NOT NULL,

        total_credits INT NOT NULL,

        failed_credits INT NOT NULL,

        result TINYINT NOT NULL,

        classification TINYINT NULL,

        decision_date DATE NOT NULL,

        reviewer UNIQUEIDENTIFIER NULL,

        note NVARCHAR(MAX) NULL,

        created_at DATETIME2 NOT NULL
            CONSTRAINT DF_graduation_results_created_at
            DEFAULT SYSDATETIME(),

        updated_at DATETIME2 NULL,

        created_by UNIQUEIDENTIFIER NULL,

        updated_by UNIQUEIDENTIFIER NULL,

        deleted_at DATETIME2 NULL,

        deleted_by UNIQUEIDENTIFIER NULL,

        is_active BIT NOT NULL
            CONSTRAINT DF_graduation_results_is_active
            DEFAULT 1,

        CONSTRAINT FK_graduation_results_condition
            FOREIGN KEY (condition_id)
            REFERENCES graduation_conditions(id),

        CONSTRAINT CK_graduation_results_gpa
            CHECK (gpa >= 0 AND gpa <= 4.00),

        CONSTRAINT CK_graduation_results_total_credits
            CHECK (total_credits >= 0),

        CONSTRAINT CK_graduation_results_failed_credits
            CHECK (failed_credits >= 0),

        CONSTRAINT CK_graduation_results_result
            CHECK (result IN (0, 1)),

        CONSTRAINT CK_graduation_results_classification
            CHECK (
                classification IS NULL
                OR classification IN (1, 2, 3, 4)
            )
    );
    PRINT N'Đã tạo bảng graduation_results thành công.';
END
GO


-- ==================================================================================
-- 5. TẠO BẢNG graduation_profiles (HỒ SƠ ĐỀ NGHỊ XÉT TỐT NGHIỆP)
-- ==================================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE [name] = 'graduation_profiles')
BEGIN
    CREATE TABLE graduation_profiles (
        id UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT PK_graduation_profiles PRIMARY KEY
            DEFAULT NEWID(),

        profile_code NVARCHAR(50) NOT NULL
            CONSTRAINT UQ_graduation_profiles_profile_code UNIQUE,

        student_id UNIQUEIDENTIFIER NOT NULL,

        session_id UNIQUEIDENTIFIER NULL,

        status NVARCHAR(30) NOT NULL
            CONSTRAINT DF_graduation_profiles_status DEFAULT N'Pending',

        submitted_date DATETIME2 NULL,

        review_date DATETIME2 NULL,

        reviewer_id UNIQUEIDENTIFIER NULL,

        note NVARCHAR(500) NULL,

        created_at DATETIME2 NOT NULL
            CONSTRAINT DF_graduation_profiles_created_at
            DEFAULT SYSDATETIME(),

        updated_at DATETIME2 NULL,

        created_by UNIQUEIDENTIFIER NULL,

        updated_by UNIQUEIDENTIFIER NULL,

        deleted_at DATETIME2 NULL,

        deleted_by UNIQUEIDENTIFIER NULL,

        is_active BIT NOT NULL
            CONSTRAINT DF_graduation_profiles_is_active
            DEFAULT 1,

        CONSTRAINT FK_graduation_profiles_student
            FOREIGN KEY (student_id)
            REFERENCES students(id)
    );
    PRINT N'Đã tạo bảng graduation_profiles thành công.';
END
GO

-- ==================================================================================
-- 6. THÊM KHÓA NGOẠI TỪ graduation_profiles TỚI graduation_sessions (NẾU CHƯA CÓ)
-- ==================================================================================
IF EXISTS (SELECT 1 FROM sys.tables WHERE [name] = 'graduation_profiles')
   AND EXISTS (SELECT 1 FROM sys.tables WHERE [name] = 'graduation_sessions')
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys 
        WHERE [name] = 'FK_graduation_profiles_session' 
          AND [parent_object_id] = OBJECT_ID('dbo.graduation_profiles')
    )
    BEGIN
        ALTER TABLE [dbo].[graduation_profiles]
        ADD CONSTRAINT [FK_graduation_profiles_session]
        FOREIGN KEY (session_id) REFERENCES graduation_sessions(id);
        PRINT N'Đã thêm khóa ngoại FK_graduation_profiles_session.';
    END
END
GO
