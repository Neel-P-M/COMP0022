import { spawn } from 'child_process';

export function runPythonScript(scriptPath: string, args: string[] = []): Promise<string> {
  return new Promise((resolve, reject) => {
    // Use the Python executable from the virtual environment if available
    const pythonExecutable = process.env.PYTHON_PATH || 'python3';
    console.log(`Using Python executable: ${pythonExecutable}`);
    
    // Spawn Python process with arguments
    const pythonProcess = spawn(pythonExecutable, [scriptPath, ...args]);
    
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
