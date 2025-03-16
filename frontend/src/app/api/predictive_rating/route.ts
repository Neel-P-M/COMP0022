import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { title, genres, principals, releaseYear } = await req.json();
    
    // Validate input
    if (!title || !genres || !Array.isArray(genres) || !releaseYear) {
        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
        );
    }
    
    // Format parameters for Python script
    const principalsJSON = principals && Array.isArray(principals) ? JSON.stringify(principals.map(p => [p.name, p.role])): '[]';
    const genresJSON = JSON.stringify(genres);

    console.log(`Trying to execute...`);
    // Use the Python executable from the virtual environment if available
    const pythonExecutable = process.env.PYTHON_PATH || '/app/venv/bin/python3';
    console.log(`Using Python executable: ${pythonExecutable}`);
    
    // Execute Python script
    const command = `${pythonExecutable} src/scripts/predictive_rating.py get-rating "${title}" '${genresJSON}' '${principalsJSON}' ${releaseYear}`;
    console.log('Executing command:', command);
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr) {
        console.error('Python script error:', stderr);
        return NextResponse.json(
            { error: 'Error executing prediction script' },
            { status: 500 }
        );
    }
    
    // Parse the output from Python script
    const result = JSON.parse(stdout);
    
    return NextResponse.json({ 
        title: result[0],
        predictedRating: result[1]
    });
  } catch (error) {
    console.error('Error in predictive rating API:', error);
    return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
    );
  }
}