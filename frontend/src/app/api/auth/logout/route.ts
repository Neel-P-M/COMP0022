import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
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
  } catch {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}