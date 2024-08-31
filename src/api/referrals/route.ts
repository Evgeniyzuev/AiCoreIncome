import {saveReferral, getReferrals, getReferrer} from '../../components/storage';
import { NextResponse, NextRequest } from 'next/server';



export async function POST(request: Request) {
    const {userId, referrerId} = await request.json();

    if (!userId || !referrerId) {
        return NextResponse.json({message: 'Invalid request'}, {status: 400});
    }

    saveReferral(userId, referrerId);
    return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({message: 'Invalid request'}, {status: 400});
    }

    const referrals = getReferrals(userId);
    const referrer = getReferrer(userId);

    return NextResponse.json({ referrals, referrer });
}
