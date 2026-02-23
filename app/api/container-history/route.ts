import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT *
      FROM [VM_LOCAL].[dbo].[ContainersHistory_Full]
    `;

    const data = await executeQuery(query);

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false });
  }
}