-- QUICK FIX: Grant minimum required permissions for registration to work
-- Run this in SQL Server Management Studio as administrator

USE [MyApp];
GO

-- Grant SELECT and INSERT on Users table
GRANT SELECT, INSERT ON [dbo].[Users] TO [logistics_user];
GO

PRINT '✅ Permissions granted! Registration should now work.';
GO

