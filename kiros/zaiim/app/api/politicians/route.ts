import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Politician from '@/models/Politician';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const politicians = await Politician.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: politicians });
  } catch (error) {
    console.error('Error fetching politicians:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch politicians' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const politician = await Politician.create(body);
    
    return NextResponse.json(
      { success: true, data: politician },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating politician:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create politician' },
      { status: 500 }
    );
  }
}