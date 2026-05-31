import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Politician from '@/models/Politician';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const updatedPolitician = await Politician.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!updatedPolitician) {
      return NextResponse.json(
        { success: false, error: 'Politician not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedPolitician });
  } catch (error) {
    console.error('Error updating politician:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update politician' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const deletedPolitician = await Politician.findByIdAndDelete(params.id);
    
    if (!deletedPolitician) {
      return NextResponse.json(
        { success: false, error: 'Politician not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: deletedPolitician });
  } catch (error) {
    console.error('Error deleting politician:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete politician' },
      { status: 500 }
    );
  }
}