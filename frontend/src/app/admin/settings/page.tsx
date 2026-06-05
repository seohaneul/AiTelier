'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [username, setUsername] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem('username') || '';
    const savedCompanyName = localStorage.getItem('companyName') || '';
    setUsername(savedUsername);
    setCompanyName(savedCompanyName);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    setIsSuccess(false);

    if (password && password !== confirmPassword) {
      setStatus('입력하신 새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://craft-ai-backend-nu9o.onrender.com/api/v1';
      const res = await fetch(`${baseUrl.replace('/api/v1', '')}/api/v1/auth/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          companyName,
          password: password ? password : null
        })
      });

      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
        setStatus('✨ 공방 환경 설정이 성공적으로 저장되었습니다.');
        localStorage.setItem('companyName', data.companyName || companyName);
        setPassword('');
        setConfirmPassword('');
        // 변경 사항 헤더 등에 연동하기 위해 페이지 리로드를 하거나 환영 이름 상태 업데이트 가능
      } else {
        setStatus(data.message || '설정 저장 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setStatus('서버 연결 실패. 나중에 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="at-animate-fade-up">
      <header className="at-mb-12">
        <h2 className="serif at-h1 at-gradient-text" style={{ fontSize: '2.5rem' }}>공방 환경 설정</h2>
        <p className="at-desc">파트너 공방의 정보와 보안 비밀번호를 관리합니다.</p>
      </header>

      <div className="at-card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit} className="at-flex-col" style={{ gap: '1.75rem' }}>
          
          {/* 아이디 (수정 불가) */}
          <div className="at-flex-col" style={{ gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-at-muted)' }}>공방 식별 코드 (아이디)</label>
            <input 
              type="text" 
              value={username} 
              disabled 
              className="at-input" 
              style={{ background: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }}
            />
            <p className="at-desc" style={{ fontSize: '0.75rem' }}>식별 코드는 보안 규정상 수정이 불가능합니다.</p>
          </div>

          {/* 가게 이름 */}
          <div className="at-flex-col" style={{ gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-at-muted)' }}>가게 이름 (회사명)</label>
            <input 
              type="text" 
              value={companyName} 
              onChange={e => setCompanyName(e.target.value)} 
              required
              placeholder="공방 브랜드 이름 입력"
              className="at-input"
            />
          </div>

          {/* 비밀번호 변경 */}
          <div className="at-flex-col" style={{ gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-at-muted)' }}>새 비밀번호</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="변경할 때만 입력하세요 (8자 이상)"
              className="at-input"
            />
          </div>

          {/* 비밀번호 확인 */}
          <div className="at-flex-col" style={{ gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-at-muted)' }}>새 비밀번호 확인</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              placeholder="새 비밀번호를 한번 더 입력하세요"
              className="at-input"
            />
          </div>

          {status && (
            <p className="at-text-center" style={{ fontSize: '0.9rem', fontWeight: 700, color: isSuccess ? '#10b981' : '#ef4444' }}>
              {status}
            </p>
          )}

          <button type="submit" className="at-btn at-w-full" disabled={loading} style={{ padding: '1rem', borderRadius: '1rem' }}>
            {loading ? (
              <span className="at-spinner at-spinner-light"></span>
            ) : (
              '변경 사항 저장하기'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
