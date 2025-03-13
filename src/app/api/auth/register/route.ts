import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { use } from 'react';

//Define User type
type User = {
    id: string;
    username: string;
    password: string;
}

let users: User[] = [];

const JWT_secret = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
    try{
        const { username, password }= await request.json;

        if (!username || !password){
            return NextResponse.json(
                { error: 'Username and password are required'},
                { status: 400}
            );
        }

        //Check if user already exists
        const existingUser = users.find(u => u.username === username);

        const hashedpw = await bcrypt.hash(password, 10);

        //Create new user
        const userId = uuidv4();
        const newUser: User = {
            id: userId,
            username: username,
            password: hashedpw
        }
        users.push(newUser);

        const token = sign({ id: userId, username: username}, JWT_secret, { expiresIn: '14d'})
        cookies().set('authToken', token, {
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
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Registration failed' },
            { status: 500}
        );
    }
}