import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
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

/**
 * Execute a Python script and return its output as a string
 */
function runPythonScript(scriptPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Use the Python executable from the virtual environment if available
    const pythonExecutable = process.env.PYTHON_PATH || '/app/venv/bin/python3';
    console.log(`Using Python executable: ${pythonExecutable}`);
    // Spawn Python process - try python3 if python doesn't work
    const pythonProcess = spawn('python3', [scriptPath]);
    
    let dataString = '';
    let errorString = '';
    
    // Collect data from stdout
    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });
    
    // Collect error messages from stderr
    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
      console.error('Python stderr:', data.toString());
    });
    
    // Handle process completion
    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      if (code !== 0) {
        reject(new Error(`Python script exited with code ${code}: ${errorString}`));
      } else {
        resolve(dataString);
      }
    });
    
    // Handle process errors
    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
}