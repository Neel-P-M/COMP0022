import { NextResponse } from 'next/server';
import { getAuthUser } from '@/app/api/auth/me/route'
import { runPythonScript } from '@/app/api/utils/runPythonScript';
import path from 'path';

type DecodedToken = {
    id: string;
    username: string;
    issued: number;
    expired: number;
};

//Fetch all planner lists for the current user
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

//Creates a new planner list for the user
export async function POST(req: Request) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json (
            { error: 'Not Authenticated'},
            { status: 401}
        );
    }

    try {
        const body = await req.json();
        const { title, note } = body;

        const scriptPath = path.join(process.cwd(), 'scripts', 'planners', 'create_list.py')
        const result = await runPythonScript(scriptPath, [user.id, title, note]);

        const newList = JSON.parse(result);

        return NextResponse.json(newList);
    } catch (error) {
        console.error('Could not create planner list:', error);
        return NextResponse.json(
            { error: 'Failed to create planner list'},
            { status: 500 }
        );
    }
}