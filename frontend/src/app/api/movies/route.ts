import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { runPythonScript } from '../utils/runPythonScript';
import path from 'path';

export async function GET() {
    try {
        const pythonScript = path.join(process.cwd(), 'src', 'scripts', 'extract_movie_data.py');

        try {
            const data = await runPythonScript(pythonScript);
            return NextResponse.json(JSON.parse(data));
        } catch (error) {
            console.log('Could not fetch required data:', error);
        }
    } catch (error) {
        console.log('API route error', error);
        return NextResponse.json(
            { error: 'Failed to fetch movie data'},
            { status: 500 }
        );
    }
}
