"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  question: string;
  options: string[];
  answer: number | null;
  explanation?: string;
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongIndexes, setWrongIndexes] = useState<number[]>([]);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem('quiz_questions');
    const name = localStorage.getItem('quiz_user_name') || '';
    setUserName(name);
    if (data) {
      const parsed = JSON.parse(data);
      setQuestions(parsed);
      setAnswers(Array(parsed.length).fill(-1));
    } else {
      alert('문제 데이터가 없습니다.');
      router.replace('/');
    }
  }, [router]);

  const handleOptionClick = (qIdx: number, optIdx: number) => {
    setAnswers(prev => prev.map((a, i) => (i === qIdx ? optIdx : a)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let correct = 0;
    const wrong: number[] = [];
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
      else wrong.push(i);
    });
    setScore(correct * 4); // 각 문제 4점
    setWrongIndexes(wrong);
    setSubmitted(true);
    // 오답 정보도 localStorage에 저장
    localStorage.setItem('quiz_wrong', JSON.stringify({questions, answers, wrongIndexes: wrong}));
  };

  const handleWrongView = () => {
    router.push('/quiz/wrong');
  };

  if (!questions.length) return null;

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', padding: 24 }}>
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <ol>
            {questions.map((q, idx) => (
              <li key={idx} style={{ marginBottom: 24 }}>
                <div><b>{q.question}</b></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {q.options.map((opt, i) => (
                    <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={`q${idx}`}
                        checked={answers[idx] === i}
                        onChange={() => handleOptionClick(idx, i)}
                      />
                      <span>{`${i + 1}. ${opt}`}</span>
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <button type="submit" style={{ marginTop: 32, width: '100%', padding: '18px 0', fontSize: 20, background: '#0070f3', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>제출</button>
        </form>
      ) : (
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <h2>채점 결과</h2>
          <p style={{ fontSize: 24, fontWeight: 700, marginBottom: 32 }}>{userName ? `${userName}님이 획득한 점수는` : ''} {score}점입니다</p>
          {wrongIndexes.length > 0 && (
            <button onClick={handleWrongView} style={{ padding: '14px 32px', fontSize: 18, background: '#ff5a5f', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>오답 해설 보기</button>
          )}
        </div>
      )}
    </main>
  );
} 