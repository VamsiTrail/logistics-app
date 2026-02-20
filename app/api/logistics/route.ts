import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { executeQuery } from '@/lib/db';
import sql from "mssql";
/**
 * Interface for Container_List record
 */
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER as string,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};
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
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'missing'; // default missing

    let query = `
      SELECT 
        ID,                    
        Inv_Number,
        Container_Id,
        Delivery_Notes,
        Shipping_Line
      FROM [VM_LOCAL].[dbo].[Container_List]
    `;

    // 🔥 IMPORTANT PART
    if (type === 'missing') {
      query += ` WHERE Container_Id IS NULL`;
    }

    query += ` ORDER BY ID`;

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
      WHERE ID = @Id
        AND Container_Id IS NULL;

        SELECT 
          ID,                  
          Inv_Number,
          Container_Id,
          Delivery_Notes,
          Shipping_Line
        FROM [VM_LOCAL].[dbo].[Container_List]
        WHERE ID = @Id;
    `;

    const params = {
      Id: Number(body.ID),  // force numeric
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


/**
 * ============================================================
 * DELETE /api/logistics
 * Delete record by Inv_Number
 * ============================================================
 */
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { ID } = body;

    if (!ID || isNaN(Number(ID))) {
      return NextResponse.json(
        { success: false, error: 'Invalid Inv_Number' },
        { status: 400 }
      );
    }

    const query = `
      DELETE FROM [VM_LOCAL].[dbo].[Container_List]
      WHERE ID = @ID;
    `;

    const params = {
      ID: Number(ID),
    };

    await executeQuery(query, params);

    return NextResponse.json({
      success: true,
      message: 'Record deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting record:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to delete record' },
      { status: 500 }
    );
  }
}



export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const { Inv_Number, Container_Id, Delivery_Notes, Shipping_Line } = body;

    const pool = await sql.connect(config);

    await pool.request()
      .input("Inv_Number", sql.VarChar, Inv_Number)
      .input("Container_Id", sql.VarChar, Container_Id)
      .input("Delivery_Notes", sql.VarChar, Delivery_Notes)
      .input("Shipping_Line", sql.VarChar, Shipping_Line)
      .input("id", sql.Int, body.ID)
      .query(`
        UPDATE [VM_LOCAL].[dbo].[Container_List]
        SET
          Inv_Number=@Inv_Number,
          Container_Id = @Container_Id,
          Delivery_Notes = @Delivery_Notes,
          Shipping_Line = @Shipping_Line
        WHERE ID = @Id
      `);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success:false });
  }
}




