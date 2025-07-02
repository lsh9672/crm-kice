"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  question: string;
  options: string[];
  answer: number | null;
  explanation?: string;
}

export default function WrongPage() {
  const [wrongData, setWrongData] = useState<{questions: Question[], answers: number[], wrongIndexes: number[]} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem('quiz_wrong');
    if (data) {
      setWrongData(JSON.parse(data));
    } else {
      alert('오답 정보가 없습니다.');
      router.replace('/');
    }
  }, [router]);

  if (!wrongData) return null;
  const { questions, answers, wrongIndexes } = wrongData;

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', padding: 24 }}>
      <h1>오답 해설</h1>
      <ol style={{ listStyle: 'none', padding: 0 }}>
        {wrongIndexes.map(idx => (
          <li key={idx} style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>문제 {idx + 1}번</div>
            <div><b>{questions[idx].question}</b></div>
            <div style={{ color: 'red', marginTop: 8 }}>내 답: {answers[idx] !== -1 ? `${answers[idx] + 1}. ${questions[idx].options[answers[idx]]}` : '미응답'}</div>
            <div style={{ color: 'green', fontWeight: 700, marginTop: 4 }}>정답: {questions[idx].answer !== null ? `${questions[idx].answer + 1}. ${questions[idx].options[questions[idx].answer]}` : '없음'}</div>
            {questions[idx].explanation && (
              <div style={{ color: '#0070f3', marginTop: 8, fontWeight: 600 }}>해설: {questions[idx].explanation}</div>
            )}
          </li>
        ))}
      </ol>
      <button onClick={() => router.replace('/')} style={{ marginTop: 32, padding: '14px 32px', fontSize: 18, background: '#0070f3', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>처음으로</button>
    </main>
  );
} 