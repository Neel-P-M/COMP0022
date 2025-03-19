import { NextResponse } from 'next/server';
import { getAuthUser } from '@/app/api/auth/me/route'
import path from 'path';
import { runPythonScript } from '@/app/api/utils/runPythonScript';

//Fetch a specific planner list
export async function GET(req: Request, { params }: { params: { listId: string} }) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json (
            { error: 'Not Authenticated'},
            { status: 401}
        );
    }

    try {
        const listId = params.listId;

        if (!listId) {
            return NextResponse.json(
                { error: 'Invalid List ID'},
                { status: 400 }
            )
        }

        const scriptPath = path.join(process.cwd(), 'scripts', 'planners', 'get_list.py')
        const result = await runPythonScript(scriptPath, [user.id, listId]);

        const list = JSON.parse(result);
        if (!list) {
            return NextResponse.json(
                { error: 'List not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(list);
    } catch (error) {
        console.error('Could not fetch planner list:', error);
        return NextResponse.json(
            { error: 'Failed to fetch planner list'},
            { status: 500 }
        );
    }
}

export async function PUT(req: Request, { params }: { params: { listId: string} }){
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json (
            { error: 'Not Authenticated'},
            { status: 401}
        );
    }

    try {
        const listId = params.listId;
        const body = await req.json();
        const { title, note } = body;

        if (!listId) {
            return NextResponse.json(
                { error: 'Invalid List ID'},
                { status: 400 }
            )
        }

        if (!title || !note) {
            return NextResponse.json(
                { error: 'Title and note are required'},
                { status: 400 }
            )
        }

        const scriptPath = path.join(process.cwd(), 'scripts', 'planners', 'update_list.py')
        const result = await runPythonScript(scriptPath, [user.id, listId, title, note]);

        const updated = JSON.parse(result);
        if (!updated) {
            return NextResponse.json(
                { error: 'Update failed' },
                { status: 404 }
            )
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Could not update planner list:', error);
        return NextResponse.json(
            { error: 'Failed to update planner list'},
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request, { params }: { params: { listId: string} }){
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json (
            { error: 'Not Authenticated'},
            { status: 401}
        );
    }

    try {
        const listId = params.listId;

        if (!listId) {
            return NextResponse.json(
                { error: 'Invalid List ID'},
                { status: 400 }
            )
        }

        const scriptPath = path.join(process.cwd(), 'scripts', 'planners', 'delete_list.py')
        const result = await runPythonScript(scriptPath, [user.id, listId]);

        const deleted = JSON.parse(result);
        if (!deleted) {
            return NextResponse.json(
                { error: 'Update failed' },
                { status: 404 }
            )
        }

        return NextResponse.json(null, { status: 204});
    } catch (error) {
        console.error('Could not delete planner list:', error);
        return NextResponse.json(
            { error: 'Failed to delete planner list'},
            { status: 500 }
        );
    }
}