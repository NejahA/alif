import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/models/Item';

export async function GET() {
  try {
    await dbConnect();
    const items = await Item.find({}).lean().sort({ createdAt: 1 });
    
    // Ensure timestamps are returned as numbers for frontend consistency
    const itemsWithNumbers = items.map((item: any) => ({
      ...item,
      id: item._id.toString(),
      _id: item._id.toString(),
      createdAt: new Date(item.createdAt).getTime(),
      expiresAt: new Date(item.expiresAt).getTime(),
    }));

    return NextResponse.json({ success: true, data: itemsWithNumbers });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Convert numeric timestamps to Date objects for Mongoose
    const itemData = {
      ...body,
      createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : new Date(Date.now() + 300000),
    };

    const item = await Item.create(itemData);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to create item' }, { status: 400 });
  }
}

export async function DELETE() {
  try {
    await dbConnect();
    await Item.deleteMany({});
    return NextResponse.json({ success: true, message: 'All items wiped' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to wipe items' }, { status: 500 });
  }
}
