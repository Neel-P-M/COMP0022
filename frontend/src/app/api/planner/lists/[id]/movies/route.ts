import { NextResponse } from 'next/server';
import { getAuthUser } from '@/app/api/auth/me/route'
import path from 'path';
import { runPythonScript } from '@/app/api/utils/runPythonScript';

//Add a movie to a planner list
export async function POST(req: Request, { params }: { params: { id: string} }) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json (
            { error: 'Not Authenticated'},
            { status: 401}
        );
    }

    try {
        const paramsValue = await Promise.resolve(params);
        const listId = paramsValue.id;
        const body = await req.json();
        const { movieId } = body;

        if (!listId) {
            return NextResponse.json(
                { error: 'Invalid List ID'},
                { status: 400 }
            )
        }

        if (!movieId) {
            return NextResponse.json(
                { error: 'Invalid Movie ID'},
                { status: 400 }
            )
        }

        const scriptPath = path.join(process.cwd(),'src', 'scripts', 'planners', 'add_movie_to_list.py')
        const result = await runPythonScript(scriptPath, [user.id, listId, movieId.toString()]);

        const added = JSON.parse(result);

        if (!added) {
            return NextResponse.json(
                { error: 'Failed to add movie to list' },
                { status: 404 }
            )
        }

        return NextResponse.json(added);
    } catch (error) {
        console.error('Could not add movie to list:', error);
        return NextResponse.json(
            { error: 'Failed to add movie to  list'},
            { status: 500 }
        );
    }
}
