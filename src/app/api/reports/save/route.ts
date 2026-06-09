import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { fileName, folderPath, fileContent } = await request.json();

    if (!fileName || !folderPath || !fileContent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure target folder path exists
    await fs.mkdir(folderPath, { recursive: true });

    // Decode the base64 content
    const buffer = Buffer.from(fileContent, 'base64');

    // Create target file path
    const targetPath = path.join(folderPath, fileName);

    // Write file to local disk
    await fs.writeFile(targetPath, buffer);

    return NextResponse.json({ 
      success: true, 
      message: 'Report saved successfully',
      path: targetPath 
    });
  } catch (error: any) {
    console.error('Error saving report locally:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
