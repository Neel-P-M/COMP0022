// File: src/app/api/predictive-rating/route.ts
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
    
    // Execute Python script
    const command = `python3 src/scripts/predictive_rating.py get-rating "${title}" '${genresJSON}' '${principalsJSON}' ${releaseYear}`;
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