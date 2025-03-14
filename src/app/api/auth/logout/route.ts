import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.set('authToken', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
    });


    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}