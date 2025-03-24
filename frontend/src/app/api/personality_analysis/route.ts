import { NextResponse } from 'next/server';
import { runPythonScript } from '@/app/api/utils/runPythonScript';
import path from 'path';

export async function GET() {
  try {
    // Path to your Python script
    console.log("running...")
    const pythonScript = path.join(process.cwd(), 'src', 'scripts', 'personality_analysis.py');
    
    try {
      // First try to execute the Python script
      const data = await runPythonScript(pythonScript);
      console.log("Finished running");
      
      // Check if data is not empty before parsing
      if (!data || data.trim() === '') {
        throw new Error("Python script returned empty output");
      }
      
      return NextResponse.json(JSON.parse(data));
    } catch (pythonError) {
      console.error('Python execution failed:', pythonError);
      
      // Return an error response
      return NextResponse.json(
        { error: 'Failed to execute personality analysis script' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch personality analysis data' },
      { status: 500 }
    );
  }
}