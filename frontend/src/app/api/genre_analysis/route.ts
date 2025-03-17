import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { runPythonScript } from '../utils/runPythonScript';
import path from 'path';

export async function GET() {
  try {
    // Path to your Python script
    const pythonScript = path.join(process.cwd(), 'src', 'scripts', 'genre_analysis.py');
    
    try {
      // First try to execute the Python script
      const data = await runPythonScript(pythonScript);
      return NextResponse.json(JSON.parse(data));
    } catch (pythonError) {
      console.error('Python execution failed:', pythonError);
      console.log('Falling back to sample data...');
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch genre analysis data'},
      { status: 500 }
    );
  }
}
