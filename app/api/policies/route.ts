import { NextResponse } from 'next/server';
import { listPublicPolicies } from '@/lib/policy-store';

export async function GET() {
  const data = await listPublicPolicies();
  return NextResponse.json({ data });
}
