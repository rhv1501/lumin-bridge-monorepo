import { getAdminAnalytics } from "@luminbridge/db";
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const analytics = await getAdminAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
