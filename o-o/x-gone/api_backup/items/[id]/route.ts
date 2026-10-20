import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/models/Item';

import mongoose from 'mongoose';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    let deletedItem = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      deletedItem = await Item.findByIdAndDelete(id);
    } else {
      deletedItem = await Item.findOneAndDelete({ $or: [{ _id: id }, { id }] });
    }

    return NextResponse.json({ success: true, data: deletedItem || {} });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to delete item' }, { status: 500 });
  }
}
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 });
  }
}
