USE [quanlysinhvien]
GO

/****** Object:  Table [dbo].[students]    Script Date: 25/08/2026 ******/
IF OBJECT_ID(N'[dbo].[students]', N'U') IS NOT NULL
    DROP TABLE [dbo].[students]
GO

/****** Object:  Table [dbo].[students]    Script Date: 25/08/2026 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[students](
    [id] [uniqueidentifier] NOT NULL,
    [student_code] [nvarchar](50) NOT NULL,
    [full_name] [nvarchar](255) NOT NULL,
    [email] [nvarchar](255) NOT NULL,
    [phone] [nvarchar](20) NOT NULL,
    [class_name] [nvarchar](100) NOT NULL,

    CONSTRAINT [PK_students] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [UQ_students_student_code] UNIQUE ([student_code]),
    CONSTRAINT [UQ_students_email] UNIQUE ([email])
)
GO

/****** Object:  Data [dbo].[students] ******/
INSERT [dbo].[students]
    ([id], [student_code], [full_name], [email], [phone], [class_name])
VALUES
    ('550e8400-e29b-41d4-a716-446655440001', N'SV001', N'Nguyễn Văn A',  N'a@gmail.com', '0901234567', N'C2024A'),
    ('550e8400-e29b-41d4-a716-446655440002', N'SV002', N'Trần Thị B',    N'b@gmail.com', '0912345678', N'C2024B'),
    ('550e8400-e29b-41d4-a716-446655440003', N'SV003', N'Lê Hoàng C',    N'c@gmail.com', '0923456789', N'C2024C'),
    ('550e8400-e29b-41d4-a716-446655440004', N'SV004', N'Phạm Minh D',   N'd@gmail.com', '0933456789', N'C2024A'),
    ('550e8400-e29b-41d4-a716-446655440005', N'SV005', N'Hoàng Thị E',   N'e@gmail.com', '0944567890', N'C2024B'),
    ('550e8400-e29b-41d4-a716-446655440006', N'SV006', N'Vũ Đức F',      N'f@gmail.com', '0955678901', N'C2024C'),
    ('550e8400-e29b-41d4-a716-446655440007', N'SV007', N'Đặng Nhật G',   N'g@gmail.com', '0966789012', N'C2024A'),
    ('550e8400-e29b-41d4-a716-446655440008', N'SV008', N'Bùi Thảo H',    N'h@gmail.com', '0977890123', N'C2024B'),
    ('550e8400-e29b-41d4-a716-446655440009', N'SV009', N'Ngô Quốc I',    N'i@gmail.com', '0988901234', N'C2024C'),
    ('550e8400-e29b-41d4-a716-446655440010', N'SV010', N'Mai Lan K',     N'k@gmail.com', '0999012345', N'C2024A'),
    ('550e8400-e29b-41d4-a716-446655440011', N'SV011', N'Nguyễn Thị L',  N'l@gmail.com', '0901122334', N'C2024B'),
    ('550e8400-e29b-41d4-a716-446655440012', N'SV012', N'Trần Văn M',    N'm@gmail.com', '0912233445', N'C2024C'),
    ('550e8400-e29b-41d4-a716-446655440013', N'SV013', N'Lê Minh N',     N'n@gmail.com', '0923344556', N'C2024A'),
    ('550e8400-e29b-41d4-a716-446655440014', N'SV014', N'Phạm Thị O',    N'o@gmail.com', '0934455667', N'C2024B'),
    ('550e8400-e29b-41d4-a716-446655440015', N'SV015', N'Hoàng Văn P',   N'p@gmail.com', '0945566778', N'C2024C'),
    ('550e8400-e29b-41d4-a716-446655440016', N'SV016', N'Vũ Thị Q',      N'q@gmail.com', '0956677889', N'C2024A'),
    ('550e8400-e29b-41d4-a716-446655440017', N'SV017', N'Đặng Văn R',    N'r@gmail.com', '0967788990', N'C2024B'),
    ('550e8400-e29b-41d4-a716-446655440018', N'SV018', N'Bùi Minh S',    N's@gmail.com', '0978899001', N'C2024C'),
    ('550e8400-e29b-41d4-a716-446655440019', N'SV019', N'Ngô Thị T',     N't@gmail.com', '0989900112', N'C2024A'),
    ('550e8400-e29b-41d4-a716-446655440020', N'SV020', N'Mai Hoàng U',   N'u@gmail.com', '0990011223', N'C2024B')
GO