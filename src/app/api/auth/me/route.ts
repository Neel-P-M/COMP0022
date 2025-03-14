import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { JWT_secret } from '../user_data/user_data';

type DecodedToken = {
    id: string;
    username: string;
    issued: number;
    expired: number;
};

export async function GET(request: NextRequest) {
    try {
        const token = cookies().get('authToken')?.value;

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
    } catch (error) {
        console.error('Authentication check error:', error);
        return NextResponse.json(
            { error: 'Authenticated failed'},
            { status: 401}
        );
    }
}