import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { executeQuery } from '@/lib/db';

/**
 * Interface for Container_List record
 */
export interface ContainerRecord {
  Inv_Number: number;                 // INT in database
  Container_Id: string | null;
  Delivery_Notes: string | null;
  Shipping_Line: string | null;
}

/**
 * ============================================================
 * GET /api/logistics
 * Fetch records where Container_Id IS NULL
 * Protected Route
 * ============================================================
 */
export async function GET(request: NextRequest) {
  // 🔐 Check authentication
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
        Shipping_Line
      FROM [VM_LOCAL].[dbo].[Container_List]
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
 * ============================================================
 * PUT /api/logistics
 * Update Container_Id using Inv_Number
 * Protected Route
 * ============================================================
 */
export async function PUT(request: NextRequest) {
  // 🔐 Check authentication
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

    // ✅ Validate Inv_Number (should be number)
    if (!Inv_Number || isNaN(Number(Inv_Number))) {
      return NextResponse.json(
        { success: false, error: 'Invalid Inv_Number' },
        { status: 400 }
      );
    }

    // ✅ Validate Container_Id
    if (!Container_Id || Container_Id.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Container_Id is required' },
        { status: 400 }
      );
    }

    const query = `
      UPDATE [VM_LOCAL].[dbo].[Container_List]
      SET Container_Id = @ContainerId
      WHERE Inv_Number = @InvNumber
        AND Container_Id IS NULL;

      SELECT 
        Inv_Number,
        Container_Id,
        Delivery_Notes,
        Shipping_Line
      FROM [VM_LOCAL].[dbo].[Container_List]
      WHERE Inv_Number = @InvNumber;
    `;

    const params = {
      InvNumber: Number(Inv_Number),  // force numeric
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
