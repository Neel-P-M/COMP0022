import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { users, JWT_secret} from '@/app/api/auth/user_data/user_data';

export async function POST(request: NextRequest) {
    try{
        const { username, password }= await request.json();

        if (!username || !password){
            return NextResponse.json(
                { error: 'Username and password are required'},
                { status: 400}
            );
        }

        //Find user
        const user = users.find(u => u.username === username);
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid Username'},
                { status: 401}
            )
        }

        //Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid){
            return NextResponse.json(
                { error: 'Invalid Password'},
                { status: 401}
            )
        }

        //Create a 14-day cookie
        const cookieStore = await cookies()
        const token = sign({ id: user.id, username: username}, JWT_secret, { expiresIn: '14d'})
        cookieStore.set('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 14,
            path: '/',
        })

        return NextResponse.json({
            id: user.id,
            username: username
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500}
        );
    }
}