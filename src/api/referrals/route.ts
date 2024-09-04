import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@vercel/edge-config';

const client = createClient(process.env.EDGE_CONFIG);

interface ReferralStorage {
  [userId: string]: string;
}

export async function POST(request: NextRequest) {
  const { userId, referrerId } = await request.json();
  
  if (!userId || !referrerId) {
    return NextResponse.json({ error: 'Missing userId or referrerId' }, { status: 400 });
  }

  const referralStorage: ReferralStorage = await client.get('referralStorage') || {};
  if (!referralStorage[userId]) {
    referralStorage[userId] = referrerId;

    // Prepare the PATCH request body
    const body = {
      items: [
        {
          operation: 'upsert',
          key: 'referralStorage',
          value: referralStorage,
        },
      ],
    };

    // Send the PATCH request to update Edge Config
    await fetch(`https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG}/items`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }
  
  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const referralStorage: ReferralStorage = await client.get('referralStorage') || {};
  const referrals = Object.entries(referralStorage)
    .filter(([, referrer]) => referrer === userId)
    .map(([referredUser]) => referredUser);
  const referrer = referralStorage[userId] || null;

  return NextResponse.json({ referrals, referrer });
}