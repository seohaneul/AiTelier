'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [status, setStatus] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const baseUrl = '/proxy/api/v1';
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    setStatus('인증 진행 중...');

    try {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role: 'COMPANY' })
      });
      
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('userRole', 'COMPANY');
        localStorage.setItem('username', data.username || username);
        router.push('/portal');
      } else {
        setStatus(data.message || '인증에 실패했습니다.');
      }
    } catch (err) {
      setStatus('서버 연결에 실패했습니다.');
    }
  };

  return (
    <div className="at-center-flex">
      <div className="at-card at-animate-fade-up" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="at-text-center at-mb-12">
          <h1 className="serif at-h2 at-gradient-text">AiTelier</h1>
          <p className="at-desc">
            {isLogin ? '장인의 아틀리에에 오신 것을 환영합니다' : '새로운 공방 파트너십을 시작하세요'}
          </p>
        </div>
        
        <form onSubmit={handleAuth} className="at-flex-col">
          <div className="at-flex-col" style={{ gap: '0.75rem' }}>
            <label className="at-h3" style={{ fontSize: '0.9rem' }}>공방 식별 코드</label>
            <input 
              type="text" placeholder="아이디 또는 회사명" value={username} onChange={e => setUsername(e.target.value)} required
              className="at-input"
            />
          </div>

          <div className="at-flex-col" style={{ gap: '0.75rem' }}>
            <label className="at-h3" style={{ fontSize: '0.9rem' }}>비밀번호</label>
            <input 
              type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
              className="at-input"
            />
          </div>
          
          {status && <div className="at-text-center" style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem' }}>{status}</div>}
          
          <button type="submit" className="at-btn at-mt-12">
            {isLogin ? '아틀리에 입장' : '파트너 등록 완료'}
          </button>
        </form>

        <div className="at-text-center at-mt-12" style={{ position: 'relative', zIndex: 100 }}>
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="at-desc" style={{ fontSize: '0.9rem', textDecoration: 'underline', cursor: 'pointer', pointerEvents: 'auto' }}>
            {isLogin ? '아직 파트너가 아니신가요? 가입하기' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}
