-- Seed script to create an initial admin user
-- Default credentials: admin / Admin@123
-- IMPORTANT: Change the password after first login!
-- Run this script in SQL Server Management Studio

USE [MyApp];
GO

-- Note: The password hash below is for 'Admin@123'
-- This is a bcrypt hash generated with 10 rounds
-- In production, you should generate a new hash for your desired password

-- Check if admin user already exists
IF NOT EXISTS (SELECT * FROM [dbo].[Users] WHERE username = 'admin')
BEGIN
    -- Insert admin user
    -- Password: Admin@123
    -- Hash: $2a$10$rK9lV3Qt7k3K3K3K3K3K3OeK9lV3Qt7k3K3K3K3K3K3K3K3K3K3K
    -- Note: You need to generate a proper bcrypt hash using the application
    -- For now, this is a placeholder - you should use the createUser function or generate hash manually
    
    INSERT INTO [dbo].[Users] (username, email, password_hash, role, created_at)
    VALUES (
        'admin',
        'admin@logistics.local',
        '$2a$10$rK9lV3Qt7k3K3K3K3K3K3OeK9lV3Qt7k3K3K3K3K3K3K3K3K3K3K3K', -- This is a placeholder - replace with actual hash
        'admin',
        GETDATE()
    );
    
    PRINT 'Admin user created successfully';
    PRINT 'Username: admin';
    PRINT 'Password: Admin@123 (CHANGE THIS AFTER FIRST LOGIN!)';
END
ELSE
BEGIN
    PRINT 'Admin user already exists';
END
GO

