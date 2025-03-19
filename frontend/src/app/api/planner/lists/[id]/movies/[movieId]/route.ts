import { NextResponse } from 'next/server';
import { getAuthUser } from '@/app/api/auth/me/route'
import path from 'path';
import { runPythonScript } from '@/app/api/utils/runPythonScript';

//Add a movie to a planner list
export async function DELETE({ params }: { params: { listId: string, movieId: string} }) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json (
            { error: 'Not Authenticated'},
            { status: 401}
        );
    }

    try {
        const { listId, movieId } = params;

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

        const scriptPath = path.join(process.cwd(), 'scripts', 'planners', 'remove_movie_from_list.py')
        const result = await runPythonScript(scriptPath, [user.id, listId, movieId]);

        const deleted = JSON.parse(result);

        if (!deleted) {
            return NextResponse.json(
                { error: 'Failed to add movie to list' },
                { status: 404 }
            )
        }

        return NextResponse.json(deleted);
    } catch (error) {
        console.error('Could not add movie to list:', error);
        return NextResponse.json(
            { error: 'Failed to add movie to  list'},
            { status: 500 }
        );
    }
}
