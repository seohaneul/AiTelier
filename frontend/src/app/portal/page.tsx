'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PortalPage() {
  const [companyName, setCompanyName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('username');
    const company = localStorage.getItem('companyName');
    if (!user) {
      router.push('/');
    } else {
      setCompanyName(company || user);
    }
  }, [router]);

  return (
    <div className="at-center-flex">
      <div className="at-viewport at-animate-fade-up">
        <header className="at-text-center at-mb-12">
          <h1 className="serif at-h1 at-mb-12">
            Welcome to <span className="at-gradient-text">{companyName}</span> AiTelier
          </h1>
          <p className="at-desc">디지털로 확장되는 가죽 공예의 새로운 가능성</p>
        </header>

        <div className="at-grid-2">
          <Link href="/admin">
            <div className="at-card at-flex-col at-text-center align-center h-full">
              <div className="serif at-h1" style={{ opacity: 0.1, fontSize: '6rem', marginBottom: '-1rem' }}>M</div>
              <h2 className="at-h2">아틀리에 관리</h2>
              <p className="at-desc at-flex-1">
                디자인 템플릿과 가죽 소재를<br/>
                체계적으로 등록하고 관리하는<br/>
                전문가용 마스터 패널입니다.
              </p>
              <div className="at-btn at-w-full">관리자 모드 입장</div>
            </div>
          </Link>

          <Link href="/customer">
            <div className="at-card at-flex-col at-text-center align-center h-full">
              <div className="serif at-h1" style={{ opacity: 0.1, fontSize: '6rem', marginBottom: '-1rem' }}>S</div>
              <h2 className="at-h2">비주얼 쇼룸</h2>
              <p className="at-desc at-flex-1">
                고객이 직접 소재를 선택하고<br/>
                AI가 구현하는 실시간 렌더링을<br/>
                경험하는 인터랙티브 공간입니다.
              </p>
              <div className="at-btn at-w-full">쇼룸 열기</div>
            </div>
          </Link>
        </div>
        
        <div className="at-text-center at-mt-12" style={{ position: 'relative', zIndex: 100 }}>
          <button onClick={() => { localStorage.clear(); router.push('/'); }} className="at-btn-outline">
            로그아웃 및 계정 전환
          </button>
        </div>
      </div>
    </div>
  );
}
