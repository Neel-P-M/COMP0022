import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { JWT_secret } from '@/app/api/auth/user_data/user_data';
import { getAuthUser } from '@/app/api/auth/me/route'
import { runPythonScript } from '../../utils/runPythonScript';
import path from 'path';

type DecodedToken = {
    id: string;
    username: string;
    issued: number;
    expired: number;
};

//Fetch all planner lists for the current list
export async function GET() {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json (
            { error: 'Not Authenticated'},
            { status: 401}
        );
    }

    try {
        const scriptPath = path.join(process.cwd(), 'scripts', 'planners', 'lists.py')
        const result = await runPythonScript(scriptPath, [user.id]);
        //Parse the JSON result
        const lists = JSON.parse(result);

        return NextResponse.json(lists);
    } catch (error) {
        console.error('Could not fetch planner lists:', error);
        return NextResponse.json(
            { error: 'Failed to fetch planner lists'},
            { status: 500 }
        );
    }
}