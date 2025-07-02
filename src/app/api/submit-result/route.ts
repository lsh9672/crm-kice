import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

export async function POST(req: NextRequest) {
  try {
    const { userName, score, examFileName } = await req.json();

    if (!userName || score === undefined || !examFileName) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    if (!GOOGLE_APPS_SCRIPT_URL) {
      return NextResponse.json({ error: 'Google Apps Script URL이 설정되지 않았습니다.' }, { status: 500 });
    }

    // Google Apps Script로 데이터 전송
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName,
        score,
        examFileName
      })
    });

    if (!response.ok) {
      throw new Error('Google Apps Script 요청 실패');
    }

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 500 });
    }

    return NextResponse.json({
      rank: data.rank,
      totalParticipants: data.totalParticipants,
      message: data.message
    });

  } catch (error) {
    console.error('Google Apps Script API 오류:', error);
    return NextResponse.json({ error: '결과 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 