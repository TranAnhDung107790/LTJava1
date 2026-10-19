
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
        CONSTRAINT DF_graduation_profiles_created_at DEFAULT SYSDATETIME(),

    updated_at DATETIME2 NULL,

    created_by UNIQUEIDENTIFIER NULL,

    updated_by UNIQUEIDENTIFIER NULL,

    deleted_at DATETIME2 NULL,

    deleted_by UNIQUEIDENTIFIER NULL,

    is_active BIT NOT NULL
        CONSTRAINT DF_graduation_profiles_is_active DEFAULT 1,

    CONSTRAINT FK_graduation_profiles_student
        FOREIGN KEY (student_id) REFERENCES students(id)
);