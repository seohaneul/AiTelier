'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [status, setStatus] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const baseUrl = '/api/auth';
    const endpoint = isLogin ? '/login' : '/register';
    setStatus('인증 진행 중...');

    try {
      const payload = isLogin 
        ? { username, password }
        : { username, password, role: 'COMPANY', companyName };

      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('userRole', 'COMPANY');
        localStorage.setItem('username', data.username || username);
        localStorage.setItem('companyName', data.companyName || data.username || username);
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
            {isLogin ? '가죽 아틀리에 파트너 쇼룸에 입장하세요' : '새로운 아틀리에 파트너십을 시작하세요'}
          </p>
        </div>
        
        <form onSubmit={handleAuth} className="at-flex-col">
          {!isLogin && (
            <div className="at-flex-col" style={{ gap: '0.75rem' }}>
              <label className="at-h3" style={{ fontSize: '0.9rem' }}>가게 이름 (회사명)</label>
              <input 
                type="text" placeholder="예: 아틀리에 에르메스" value={companyName} onChange={e => setCompanyName(e.target.value)} required
                className="at-input"
              />
            </div>
          )}

          <div className="at-flex-col" style={{ gap: '0.75rem' }}>
            <label className="at-h3" style={{ fontSize: '0.9rem' }}>공방 식별 코드 (아이디)</label>
            <input 
              type="text" placeholder="아이디 입력" value={username} onChange={e => setUsername(e.target.value)} required
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
            {isLogin ? '아틀리에 입장' : '파트너 등록 신청'}
          </button>
        </form>

        <div className="at-text-center at-mt-12" style={{ position: 'relative', zIndex: 100 }}>
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="at-desc" style={{ fontSize: '0.9rem', textDecoration: 'underline', cursor: 'pointer', pointerEvents: 'auto' }}>
            {isLogin ? '아직 파트너가 아니신가요? 등록하기' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}
