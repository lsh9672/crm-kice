"use client";
import styles from "./page.module.css";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  question: string;
  options: string[];
  answer: number | null;
  explanation?: string;
}

export default function Home() {
  const [examFiles, setExamFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [step, setStep] = useState<'select' | 'ready'>('select');
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/exam-list')
      .then(res => res.json())
      .then(data => {
        setExamFiles(data.files || []);
        if (data.files && data.files.length > 0) setSelectedFile(data.files[0]);
      });
  }, []);

  const handleStart = async () => {
    if (!selectedFile || !userName.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/exam-docx?file=${encodeURIComponent(selectedFile)}`);
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
        localStorage.setItem('quiz_questions', JSON.stringify(data.questions));
        localStorage.setItem('quiz_user_name', userName.trim());
        router.push('/quiz');
      } else {
        setError('문제 추출에 실패했습니다.');
      }
    } catch (e) {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <main style={{ maxWidth: 600, margin: '40px auto', padding: 24 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, color: '#0070f3', textAlign: 'center', letterSpacing: '-1px' }}>KICE 시험대비</h1>
          <div style={{ textAlign: 'center', color: '#888', fontWeight: 600, marginBottom: 24 }}>(CRM 사업팀)</div>
          {step === 'select' && (
            <div style={{ textAlign: 'center' }}>
              <label style={{ fontWeight: 600, fontSize: 18, marginBottom: 16, display: 'block' }}>시험 문제 선택</label>
              <select
                value={selectedFile}
                onChange={e => setSelectedFile(e.target.value)}
                style={{ fontSize: 18, padding: '10px 16px', borderRadius: 8, border: '1px solid #ccc', marginBottom: 24, width: '100%' }}
              >
                {examFiles.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="이름을 입력하세요"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                style={{
                  fontSize: 18,
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid #ccc',
                  marginBottom: 24,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={handleStart}
                disabled={!selectedFile || !userName.trim() || loading}
                style={{
                  marginTop: 24,
                  width: '100%',
                  padding: '22px 0',
                  fontSize: 24,
                  background: 'linear-gradient(90deg, #0070f3 0%, #00c6ff 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 800,
                  cursor: !selectedFile || !userName.trim() || loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(0,112,243,0.10)',
                  letterSpacing: '-1px',
                  transition: 'background 0.2s',
                  opacity: loading || !userName.trim() ? 0.6 : 1,
                }}
              >
                {loading ? '문제 불러오는 중...' : '시험 시작'}
              </button>
              {error && <p style={{ color: 'red', marginTop: 16 }}>{error}</p>}
            </div>
          )}
        </main>
      </main>
    </div>
  );
}
