-- Grant permissions to logistics_user for Users table
-- Run this script in SQL Server Management Studio as a database administrator

USE [MyApp];
GO

-- Grant SELECT permission (needed for checking if username/email exists)
GRANT SELECT ON [dbo].[Users] TO [logistics_user];
GO

-- Grant INSERT permission (needed for user registration)
GRANT INSERT ON [dbo].[Users] TO [logistics_user];
GO

-- Grant UPDATE permission (optional - for future features like password reset)
GRANT UPDATE ON [dbo].[Users] TO [logistics_user];
GO

-- Verify permissions
SELECT 
    p.permission_name,
    p.state_desc,
    pr.name AS principal_name,
    o.name AS object_name
FROM sys.database_permissions p
INNER JOIN sys.database_principals pr ON p.grantee_principal_id = pr.principal_id
INNER JOIN sys.objects o ON p.major_id = o.object_id
WHERE pr.name = 'logistics_user' 
  AND o.name = 'Users'
ORDER BY p.permission_name;
GO

PRINT 'Permissions granted successfully!';
PRINT 'logistics_user now has SELECT, INSERT, and UPDATE permissions on Users table.';
GO

