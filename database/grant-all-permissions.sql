-- Grant all necessary permissions to logistics_user
-- This script grants permissions for both Users table and Container_List table
-- Run this script in SQL Server Management Studio as a database administrator

USE [MyApp];
GO

-- ============================================
-- Permissions for Users table
-- ============================================
PRINT 'Granting permissions on Users table...';

-- SELECT permission (check if user exists, login)
GRANT SELECT ON [dbo].[Users] TO [logistics_user];
GO

-- INSERT permission (user registration)
GRANT INSERT ON [dbo].[Users] TO [logistics_user];
GO

-- UPDATE permission (password updates, profile changes)
GRANT UPDATE ON [dbo].[Users] TO [logistics_user];
GO

PRINT 'Users table permissions granted.';
GO

-- ============================================
-- Permissions for Container_List table
-- ============================================
PRINT 'Granting permissions on Container_List table...';

-- SELECT permission (view records)
GRANT SELECT ON [dbo].[Container_List] TO [logistics_user];
GO

-- UPDATE permission (update Container_Id)
GRANT UPDATE ON [dbo].[Container_List] TO [logistics_user];
GO

PRINT 'Container_List table permissions granted.';
GO

-- ============================================
-- Verify all permissions
-- ============================================
PRINT '';
PRINT 'Verifying permissions for logistics_user:';
PRINT '==========================================';

SELECT 
    CASE 
        WHEN o.name = 'Users' THEN 'Users Table'
        WHEN o.name = 'Container_List' THEN 'Container_List Table'
        ELSE o.name
    END AS [Table],
    p.permission_name AS [Permission],
    p.state_desc AS [State]
FROM sys.database_permissions p
INNER JOIN sys.database_principals pr ON p.grantee_principal_id = pr.principal_id
INNER JOIN sys.objects o ON p.major_id = o.object_id
WHERE pr.name = 'logistics_user' 
  AND o.name IN ('Users', 'Container_List')
ORDER BY o.name, p.permission_name;
GO

PRINT '';
PRINT '==========================================';
PRINT 'All permissions granted successfully!';
PRINT '==========================================';
GO

