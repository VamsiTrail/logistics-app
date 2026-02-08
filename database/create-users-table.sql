-- Create Users table for authentication
-- Run this script in SQL Server Management Studio on the MyApp database

USE [MyApp];
GO

-- Create Users table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [username] NVARCHAR(50) NOT NULL UNIQUE,
        [email] NVARCHAR(255) NOT NULL UNIQUE,
        [password_hash] NVARCHAR(255) NOT NULL,
        [role] NVARCHAR(50) NOT NULL DEFAULT 'user',
        [created_at] DATETIME NOT NULL DEFAULT GETDATE()
    );
    
    PRINT 'Users table created successfully';
END
ELSE
BEGIN
    PRINT 'Users table already exists';
END
GO

-- Create index on username for faster lookups
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Username' AND object_id = OBJECT_ID('dbo.Users'))
BEGIN
    CREATE INDEX IX_Users_Username ON [dbo].[Users]([username]);
    PRINT 'Index on username created';
END
GO

-- Create index on email for faster lookups
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Email' AND object_id = OBJECT_ID('dbo.Users'))
BEGIN
    CREATE INDEX IX_Users_Email ON [dbo].[Users]([email]);
    PRINT 'Index on email created';
END
GO


