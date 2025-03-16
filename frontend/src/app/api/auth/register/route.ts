import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { users, JWT_secret, User } from '@/app/api/auth/user_data/user_data';

export async function POST(request: NextRequest) {
    try{
        const { username, password }= await request.json();

        if (!username || !password){
            return NextResponse.json(
                { error: 'Username and password are required'},
                { status: 400}
            );
        }

        //Check if user already exists
        const existingUser = users.find(u => u.username === username);
        if (existingUser) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 409 }
            );
        }
        const hashedpw = await bcrypt.hash(password, 10);

        //Create new user
        const userId = uuidv4();
        const newUser: User = {
            id: userId,
            username: username,
            password: hashedpw
        }
        users.push(newUser);
        //Create a 14-day cookie
        const cookieStore = await cookies()
        const token = sign({ id: userId, username: username}, JWT_secret, { expiresIn: '14d'})
        cookieStore.set('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 14,
            path: '/',
        })

        return NextResponse.json({
            id: userId,
            username: username
        });
    } catch {
        return NextResponse.json(
            { error: 'Registration failed' },
            { status: 500}
        );
    }
}