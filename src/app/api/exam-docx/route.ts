import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

function parseOptions(raw: string) {
  const optionRegex = /(①|②|③|④|⑤|⑥|⑦|⑧|⑨|⑩)([^①②③④⑤⑥⑦⑧⑨⑩]+)/g;
  const options: string[] = [];
  let match;
  while ((match = optionRegex.exec(raw)) !== null) {
    let text = match[2].trim();
    text = text.replace(/^\d+\.\s*/, '');
    options.push(text);
  }
  return options;
}

function parseQuestionsFromText(text: string) {
  const blocks = text.split(/문제[0-9]+/).map(b => b.trim()).filter(Boolean);
  const questions = [];
  for (const block of blocks) {
    const q = {} as any;
    const qMatch = block.match(/문제\s*:\s*([\s\S]*?)(?=보기|정답|해설|$)/);
    q.question = qMatch ? qMatch[1].replace(/\n/g, ' ').trim() : '';
    const oMatch = block.match(/보기\s*:\s*([\s\S]*?)(?=정답|해설|$)/);
    if (oMatch) {
      q.options = parseOptions(oMatch[1]);
    } else {
      q.options = [];
    }
    const aMatch = block.match(/정답\s*:\s*([①-⑩1-9])/);
    if (aMatch) {
      const answerChar = aMatch[1];
      const answerIdx = '①②③④⑤⑥⑦⑧⑨⑩'.indexOf(answerChar);
      q.answer = answerIdx !== -1 ? answerIdx : parseInt(answerChar, 10) - 1;
    } else {
      q.answer = null;
    }
    const eMatch = block.match(/해설\s*:\s*([\s\S]*)/);
    q.explanation = eMatch ? eMatch[1].replace(/\n/g, ' ').trim() : '';
    if (q.question && q.options.length > 0) {
      questions.push(q);
    }
  }
  return questions;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get('file');
  if (!file) {
    return NextResponse.json({ error: '파일명이 필요합니다.' }, { status: 400 });
  }
  const filePath = path.join(process.cwd(), 'exam_doc', file);
  try {
    const buffer = fs.readFileSync(filePath);
    const { value } = await mammoth.extractRawText({ buffer });
    const questions = parseQuestionsFromText(value);
    return NextResponse.json({ questions });
  } catch (e) {
    return NextResponse.json({ error: '파일을 읽거나 파싱할 수 없습니다.' }, { status: 500 });
  }
} 