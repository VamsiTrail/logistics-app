import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { executeQuery } from '@/lib/db';

// Interface for Container_List record
export interface ContainerRecord {
  Inv_Number: string;
  Container_Id: string | null;
  Delivery_Notes: string | null;
  Shippining_Line: string | null;   // CORRECT SPELLING
}

/**
 * GET /api/logistics
 * Fetches records from Container_List where Container_Id IS NULL
 * Protected route - requires authentication
 */
export async function GET(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const query = `
      SELECT 
        Inv_Number,
        Container_Id,
        Delivery_Notes,
        Shippining_Line 
      FROM [MyApp].[dbo].[Container_List]
      WHERE Container_Id IS NULL
      ORDER BY Inv_Number
    `;

    const records = await executeQuery<ContainerRecord>(query);

    return NextResponse.json({
      success: true,
      data: records,
    });

  } catch (error) {
    console.error('Error fetching container records:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch container records',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/logistics
 * Updates Container_Id for a specific record using Inv_Number as identifier
 * Protected route - requires authentication
 */
export async function PUT(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { Inv_Number, Container_Id } = body;

    // Validation
    if (!Inv_Number || typeof Inv_Number !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid Inv_Number' },
        { status: 400 }
      );
    }

    if (!Container_Id || typeof Container_Id !== 'string' || Container_Id.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Container_Id is required and cannot be empty' },
        { status: 400 }
      );
    }

    // CORRECTED QUERY – using EXACT database column name
    const query = `
      UPDATE [MyApp].[dbo].[Container_List]
      SET Container_Id = @ContainerId
      WHERE Inv_Number = @InvNumber
        AND Container_Id IS NULL

      SELECT 
        Inv_Number,
        Container_Id,
        Delivery_Notes,
        Shippining_Line
      FROM [MyApp].[dbo].[Container_List]
      WHERE Inv_Number = @InvNumber
    `;

    const params = {
      InvNumber: Inv_Number,
      ContainerId: Container_Id.trim(),
    };

    const result = await executeQuery<ContainerRecord>(query, params);

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Record not found or already updated' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    });

  } catch (error) {
    console.error('Error updating container record:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update container record',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
