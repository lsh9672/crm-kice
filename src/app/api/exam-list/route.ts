import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const examDir = path.join(process.cwd(), 'exam_doc');
  try {
    const files = fs.readdirSync(examDir)
      .filter(f => f.endsWith('.docx'));
    return NextResponse.json({ files });
  } catch (e) {
    return NextResponse.json({ files: [], error: '폴더를 읽을 수 없습니다.' }, { status: 500 });
  }
} 