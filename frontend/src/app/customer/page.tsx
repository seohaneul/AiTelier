'use client';

import { useState, useEffect } from 'react';

interface Template {
  id: number;
  templateName: string;
  s3OriginalImageUrl: string;
}

interface HistoryItem {
  id: string;
  url: string;
  templateName: string;
  date: string;
}

export default function CustomerPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [myImage, setMyImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [resultImg, setResultImg] = useState('');
  const [status, setStatus] = useState('');
  const [username, setUsername] = useState('고객님');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const comName = localStorage.getItem('username');
    if (comName) {
      setUsername(comName);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';
      fetch(`${baseUrl}/templates/${comName}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setTemplates(data);
            if (data.length > 0) setSelectedTemplate(data[0]);
          }
        })
        .catch(e => console.error('Fetch Templates Error:', e));
    }

    // Load history from local storage with error handling
    try {
      const savedHistory = localStorage.getItem('aitelier_history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (e) {
      console.error('History Load Error:', e);
      localStorage.removeItem('aitelier_history');
    }
  }, []);

  const saveToHistory = (url: string, templateName: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      url,
      templateName,
      date: new Date().toLocaleString()
    };
    const updated = [newItem, ...history];
    setHistory(updated);
    localStorage.setItem('aitelier_history', JSON.stringify(updated));
  };

  const deleteFromHistory = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('aitelier_history', JSON.stringify(updated));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMyImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleAiProcessing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myImage || !selectedTemplate) {
      setStatus('가죽 소재를 선택해주세요.');
      return;
    }

    setLoading(true);
    setStatus('AI가 프리미엄 가죽의 질감을 템플릿에 입히는 중입니다...');

    try {
      const formData = new FormData();
      formData.append('leatherImage', myImage);
      formData.append('templateImageUrl', selectedTemplate.s3OriginalImageUrl);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';
      const res = await fetch(`${baseUrl}/orders/visualize`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('✨ 매력적인 디자인이 완성되었습니다.');
        setResultImg(data.result_image_url);
        saveToHistory(data.result_image_url, selectedTemplate.templateName);
      } else {
        setStatus('서버 요청 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setStatus('AI 서버와의 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="at-viewport at-animate-fade-up" style={{ maxWidth: '1400px' }}>
      <header className="at-mb-12 at-flex-row justify-between align-center">
        <div>
          <h1 className="serif at-h1 at-gradient-text">{username} 아틀리에</h1>
          <p className="at-desc">마스터 템플릿에 나만의 감성을 입혀보세요.</p>
        </div>
        <button onClick={() => window.location.href = '/portal'} className="at-btn-outline">
           ⬅️ 포털로 돌아가기
        </button>
      </header>

      {/* 1. Template Navigation Bar */}
      <section className="at-card at-mb-12" style={{ padding: '1rem 2rem' }}>
        <h3 className="at-h3 at-mb-12" style={{ fontSize: '0.9rem', opacity: 0.6 }}>템플릿 베이스 선택</h3>
        <div className="at-template-navbar">
          {templates.map(t => (
            <div 
              key={t.id} 
              className={`at-nav-template-item ${selectedTemplate?.id === t.id ? 'active' : ''}`}
              onClick={() => setSelectedTemplate(t)}
            >
              <div className="at-aspect-square at-rounded-lg overflow-hidden at-mb-12" style={{ marginBottom: '0.75rem', border: '1px solid var(--border-at-light)' }}>
                <img src={t.s3OriginalImageUrl} alt={t.templateName} className="at-img-cover" />
              </div>
              <p className="at-text-center" style={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.templateName}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="at-grid-2" style={{ gridTemplateColumns: '1fr 340px', gap: '2.5rem', alignItems: 'start' }}>
        {/* 2. Main Rendering & Result Zone */}
        <div className="at-flex-col" style={{ gap: '2.5rem' }}>
          <div className="at-card">
            <h2 className="at-h3 at-mb-12">디자인 렌더링</h2>
            <form onSubmit={handleAiProcessing} className="at-flex-row align-start" style={{ gap: '2rem' }}>
              <div className="at-upload-zone" style={{ flex: 1, height: '300px' }}>
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="at-img-cover" />
                ) : (
                  <div className="at-text-center">
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📸</span>
                    <p className="at-desc" style={{ fontSize: '0.9rem' }}>가죽 샘플을 업로드하세요</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="at-absolute-overlay" />
              </div>
              
              <div className="at-flex-1 at-flex-col" style={{ justifyContent: 'center', height: '300px' }}>
                <div className="at-card" style={{ background: 'var(--bg-at-primary)', padding: '1.5rem', border: 'none' }}>
                  <p className="at-desc" style={{ fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 800 }}>SELECTED BASE</p>
                  <p className="serif at-h3">{selectedTemplate?.templateName || '템플릿을 선택해주세요'}</p>
                </div>
                <button 
                  type="submit" 
                  className="at-btn at-w-full" 
                  disabled={!selectedTemplate || !myImage || loading}
                  style={{ padding: '1.5rem' }}
                >
                  {loading ? 'AI 아티스트 작업 중...' : '✨ 실사 렌더링 시작'}
                </button>
                {status && <p className="at-mt-12 at-text-center" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-at-leather)' }}>{status}</p>}
              </div>
            </form>
          </div>

          {resultImg && (
            <div className="at-card at-animate-fade-up">
              <h3 className="at-h3 at-mb-12">최종 결과물</h3>
              <div className="at-rounded-xl overflow-hidden" style={{ border: '4px solid #fff', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                <img src={resultImg} alt="AI Result" className="at-w-full" style={{ display: 'block' }} />
              </div>
            </div>
          )}
        </div>

        {/* 3. History Archive */}
        <aside className="at-history-panel">
          <header className="at-mb-12 at-flex-row justify-between align-center">
            <h3 className="at-h3" style={{ fontSize: '1.1rem' }}>아틀리에 아카이브</h3>
            <span className="at-step-badge" style={{ margin: 0 }}>{history.length}</span>
          </header>
          
          <div className="at-history-list">
            {history.length === 0 ? (
              <div className="at-text-center at-mt-12" style={{ padding: '2rem', opacity: 0.5 }}>
                <p className="at-desc" style={{ fontSize: '0.85rem' }}>생성된 기록이 없습니다.</p>
              </div>
            ) : (
              history.map(item => (
                <div key={item.id} className="at-history-item at-animate-fade-up">
                  <div className="at-history-delete" onClick={() => deleteFromHistory(item.id)}>✕</div>
                  <img src={item.url} alt="History" className="at-history-img" />
                  <div style={{ padding: '1rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>{item.templateName}</p>
                    <p className="at-desc" style={{ fontSize: '0.7rem' }}>{item.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {history.length > 0 && (
            <button 
              onClick={() => { if(confirm('모든 기록을 삭제하시겠습니까?')) { setHistory([]); localStorage.removeItem('aitelier_history'); } }}
              className="at-desc at-mt-12 at-w-full at-text-center" 
              style={{ fontSize: '0.8rem', textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              전체 기록 삭제
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
