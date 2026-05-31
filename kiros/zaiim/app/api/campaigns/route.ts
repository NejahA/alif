import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import LeadershipCampaign from '@/models/LeadershipCampaign';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const campaigns = await LeadershipCampaign.find({}).populate('politicians').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const campaign = await LeadershipCampaign.create(body);
    
    return NextResponse.json(
      { success: true, data: campaign },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}