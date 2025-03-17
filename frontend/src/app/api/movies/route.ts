import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
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
