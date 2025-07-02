import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import mammoth from 'mammoth';

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseOptions(raw: string) {
  // ①, ②, ③ 등으로 보기를 분리
  const optionRegex = /(①|②|③|④|⑤|⑥|⑦|⑧|⑨|⑩)([^①②③④⑤⑥⑦⑧⑨⑩]+)/g;
  const options: string[] = [];
  let match;
  while ((match = optionRegex.exec(raw)) !== null) {
    let text = match[2].trim();
    // 앞에 숫자와 점(예: '2. ') 제거
    text = text.replace(/^\d+\.\s*/, '');
    options.push(text);
  }
  return options;
}

function parseQuestionsFromText(text: string) {
  // 문제별로 분리 (문제1, 문제2 등)
  const blocks = text.split(/문제[0-9]+/).map(b => b.trim()).filter(Boolean);
  const questions = [];
  for (const block of blocks) {
    const q = {} as any;
    // 문제
    const qMatch = block.match(/문제\s*:\s*([\s\S]*?)(?=보기|정답|해설|$)/);
    q.question = qMatch ? qMatch[1].replace(/\n/g, ' ').trim() : '';
    // 보기
    const oMatch = block.match(/보기\s*:\s*([\s\S]*?)(?=정답|해설|$)/);
    if (oMatch) {
      q.options = parseOptions(oMatch[1]);
    } else {
      q.options = [];
    }
    // 정답
    const aMatch = block.match(/정답\s*:\s*([①-⑩1-9])/);
    if (aMatch) {
      const answerChar = aMatch[1];
      const answerIdx = '①②③④⑤⑥⑦⑧⑨⑩'.indexOf(answerChar);
      q.answer = answerIdx !== -1 ? answerIdx : parseInt(answerChar, 10) - 1;
    } else {
      q.answer = null;
    }
    // 해설
    const eMatch = block.match(/해설\s*:\s*([\s\S]*)/);
    q.explanation = eMatch ? eMatch[1].replace(/\n/g, ' ').trim() : '';
    if (q.question && q.options.length > 0) {
      questions.push(q);
    }
  }
  return questions;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) {
    return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const { value } = await mammoth.extractRawText({ buffer });
  const questions = parseQuestionsFromText(value);
  return NextResponse.json({ questions });
} 