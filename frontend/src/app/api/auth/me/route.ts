import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { JWT_secret } from '../user_data/user_data';

type DecodedToken = {
    id: string;
    username: string;
    issued: number;
    expired: number;
};

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('authToken')?.value;
        if(!token){
            return NextResponse.json(
                { error: 'Not Authenticated'},
                { status: 401}
            );
        }

        const decoded = verify(token, JWT_secret) as DecodedToken;

        return NextResponse.json({
            id: decoded.id,
            username: decoded.username
        });
    } catch {
        return NextResponse.json(
            { error: 'Authenticated failed'},
            { status: 401}
        );
    }
}