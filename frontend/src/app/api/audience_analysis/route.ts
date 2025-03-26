import { NextResponse } from 'next/server';
import { runPythonScript } from '../utils/runPythonScript';
import path from 'path';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const genre = url.searchParams.get('genre') || '';
    const comparison = url.searchParams.get('comparison') || 'over';
    const threshold = url.searchParams.get('threshold') || '3.0';

    if (!genre) {
      return NextResponse.json({ error: 'Missing genre parameter' }, { status: 400 });
    }

    if (!['over', 'under'].includes(comparison)) {
      return NextResponse.json({ error: 'Invalid comparison parameter' }, { status: 400 });
    }

    const thresholdVal = parseFloat(threshold);
    if (isNaN(thresholdVal) || thresholdVal < 1.5 || thresholdVal > 4.5) {
      return NextResponse.json({ error: 'Threshold must be between 1.5 and 4.5' }, { status: 400 });
    }

    const result = await runPythonScript(
      path.join(process.cwd(), 'src', 'scripts', 'audience_patterns.py'),
      [genre, comparison, threshold]
    );

    const jsonData = JSON.parse(result);
    return NextResponse.json(jsonData);
  } catch (error: any) {
    console.error('Audience Analysis API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
