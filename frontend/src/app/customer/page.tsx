'use client';

import { useState, useEffect, useRef } from 'react';

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
  const [username, setUsername] = useState('파트너 공방');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Modals status
  const [showResultModal, setShowResultModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // File Upload Ref to prevent browser tooltip
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const comName = localStorage.getItem('companyName') || localStorage.getItem('username');
    if (comName) {
      setUsername(comName);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://craft-ai-backend-nu9o.onrender.com/api/v1';
      fetch(`${baseUrl}/templates/${localStorage.getItem('username')}`)
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

  useEffect(() => {
    if (showResultModal || showHistoryModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showResultModal, showHistoryModal]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const saveToHistory = (url: string, templateName: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      url,
      templateName,
      date: new Date().toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
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
      setStatus('가죽 원단을 업로드하고 마스터 템플릿을 선택해주세요.');
      return;
    }

    setLoading(true);
    setStatus('AI 마스터가 질감을 분석하여 실사 렌더링 중입니다...');

    try {
      const formData = new FormData();
      formData.append('leatherImage', myImage);
      formData.append('templateImageUrl', selectedTemplate.s3OriginalImageUrl);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://craft-ai-backend-nu9o.onrender.com/api/v1';
      const res = await fetch(`${baseUrl}/orders/visualize`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('✨ 실사 디자인 렌더링이 완료되었습니다.');
        setResultImg(data.result_image_url);
        saveToHistory(data.result_image_url, selectedTemplate.templateName);
        setShowResultModal(true); // 결과 모달 오픈
      } else {
        setStatus('AI 합성 서버 응답 오류가 발생했습니다.');
      }
    } catch (err) {
      setStatus('AI 서버 연결 실패. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="at-viewport at-animate-fade-up" style={{ maxWidth: '1200px' }}>
      <header className="at-mb-12 at-flex-row justify-between align-center" style={{ gap: '1rem', alignItems: 'center' }}>
        <div>
          <h1 className="serif at-h1 at-gradient-text" style={{ fontSize: '2.5rem' }}>{username} 쇼룸</h1>
          <p className="at-desc" style={{ fontSize: '1rem' }}>마스터 템플릿에 프리미엄 가죽 원단을 입혀 가상 실사 디자인을 시각화합니다.</p>
        </div>
        <button onClick={() => window.location.href = '/portal'} className="at-btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
          <span>←</span> 공방 포털로 돌아가기
        </button>
      </header>

      {/* 1. Template Navigation Bar */}
      <section className="at-card at-mb-12" style={{ padding: '1.25rem 2rem' }}>
        <h3 className="at-h3 at-mb-12" style={{ fontSize: '0.85rem', opacity: 0.6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>가공 베이스 템플릿 선택</h3>
        <div className="at-template-navbar" style={{ padding: '0.5rem 0' }}>
          {templates.map(t => (
            <div 
              key={t.id} 
              className={`at-nav-template-item ${selectedTemplate?.id === t.id ? 'active' : ''}`}
              onClick={() => setSelectedTemplate(t)}
            >
              <div className="at-aspect-square at-rounded-lg overflow-hidden at-mb-12" style={{ marginBottom: '0.5rem', border: '1px solid var(--border-at-light)' }}>
                <img src={t.s3OriginalImageUrl} alt={t.templateName} className="at-img-cover" />
              </div>
              <p className="at-text-center" style={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.templateName}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="at-grid-2" style={{ gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'stretch' }}>
        {/* 2. Main Rendering Zone */}
        <div className="at-card" style={{ padding: '2rem' }}>
          <h2 className="at-h3 at-mb-12" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>AI 가상 실사 렌더링</h2>
          <form onSubmit={handleAiProcessing} className="at-flex-row align-start" style={{ gap: '1.5rem', width: '100%' }}>
            
            {/* Custom file upload zone to hide default tooltip */}
            <div className="at-upload-zone" onClick={loading ? undefined : triggerFileInput} style={{ flex: 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {previewImage ? (
                <img src={previewImage} alt="Preview" className="at-img-cover" />
              ) : (
                <div className="at-text-center" style={{ pointerEvents: 'none' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📸</span>
                  <p className="at-desc" style={{ fontSize: '0.85rem', fontWeight: 600 }}>가죽 원단 사진 업로드</p>
                  <p className="at-desc" style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>클릭하여 원단 이미지를 추가하세요</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*" 
                onChange={handleImageChange} 
                style={{ display: 'none' }}
                disabled={loading}
              />
            </div>
            
            <div className="at-flex-1 at-flex-col" style={{ justifyContent: 'space-between', height: '250px' }}>
              <div className="at-card" style={{ background: 'var(--bg-at-primary)', padding: '1.25rem', border: 'none', borderRadius: '1rem' }}>
                <p className="at-desc" style={{ fontSize: '0.7rem', marginBottom: '0.25rem', fontWeight: 800, letterSpacing: '0.1em' }}>선택된 마스터 템플릿</p>
                <p className="serif at-h3" style={{ fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedTemplate?.templateName || '선택 대기 중'}</p>
              </div>
              <button 
                type="submit" 
                className="at-btn at-w-full" 
                disabled={!selectedTemplate || !myImage || loading}
                style={{ padding: '1rem', fontSize: '1rem', borderRadius: '1rem' }}
              >
                {loading ? (
                  <span className="at-spinner at-spinner-light"></span>
                ) : (
                  '✨ AI 실사 렌더링 시작'
                )}
              </button>
              {status && <p className="at-mt-12 at-text-center" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-at-leather)', marginTop: '0.5rem' }}>{status}</p>}
            </div>
          </form>
        </div>

        {/* 3. History Archive (Limit to 3 items on screen) */}
        <aside className="at-history-panel" style={{ padding: '1.5rem' }}>
          <header className="at-mb-12 at-flex-row justify-between align-center" style={{ marginBottom: '1.5rem', gap: '0.5rem', alignItems: 'center' }}>
            <h3 className="at-h3" style={{ fontSize: '1rem' }}>아카이브 보관함</h3>
            <span className="at-step-badge" style={{ margin: 0 }}>{history.length}</span>
          </header>
          
          <div className="at-history-list" style={{ flex: 1, gap: '1rem' }}>
            {history.length === 0 ? (
              <div className="at-text-center at-mt-12" style={{ padding: '2rem', opacity: 0.5, marginTop: '2rem' }}>
                <p className="at-desc" style={{ fontSize: '0.8rem' }}>보관된 기록이 없습니다.</p>
              </div>
            ) : (
              history.slice(0, 3).map(item => (
                <div key={item.id} className="at-history-item" style={{ borderRadius: '0.75rem' }}>
                  <div className="at-history-delete" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }} onClick={() => deleteFromHistory(item.id)}>✕</div>
                  <img src={item.url} alt="History" className="at-history-img" style={{ height: '100px', cursor: 'pointer' }} onClick={() => { setResultImg(item.url); setShowResultModal(true); }} />
                  <div style={{ padding: '0.75rem 0.5rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.templateName}</p>
                    <p className="at-desc" style={{ fontSize: '0.65rem' }}>{item.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {history.length > 3 && (
            <button 
              onClick={() => setShowHistoryModal(true)}
              className="at-btn-outline at-w-full"
              style={{ padding: '0.6rem', fontSize: '0.8rem', marginTop: '1rem', borderStyle: 'dashed' }}
            >
              🔍 전체 아카이브 보기 ({history.length})
            </button>
          )}
        </aside>
      </div>

      {/* 4. Rendering Result Modal Popup */}
      {showResultModal && resultImg && (
        <div className="at-modal-overlay" onClick={() => setShowResultModal(false)}>
          <div className="at-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p className="at-desc" style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Rendering Complete
              </p>
              <h2 className="serif at-h2" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>실사 렌더링 결과물</h2>
              <div className="at-rounded-xl overflow-hidden at-mb-12" style={{ border: '1px solid var(--border-at-light)', boxShadow: 'var(--shadow-at-premium)', background: '#fcfcfc', maxHeight: '45vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img src={resultImg} alt="AI Result" style={{ display: 'block', maxHeight: '45vh', width: 'auto', objectFit: 'contain' }} />
              </div>
              <div className="at-flex-row" style={{ gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <a href={resultImg} download={`${selectedTemplate?.templateName || 'design'}_rendered.png`} className="at-btn" style={{ width: 'auto', padding: '0.75rem 1.5rem', fontSize: '0.95rem', borderRadius: '0.75rem' }}>
                  📥 이미지 저장
                </a>
                <button onClick={() => setShowResultModal(false)} className="at-btn-outline" style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem', borderRadius: '0.75rem' }}>
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Full History Archive Modal Popup */}
      {showHistoryModal && (
        <div className="at-modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="at-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div style={{ padding: '2rem' }}>
              <header className="at-mb-12 at-text-center" style={{ marginBottom: '2rem' }}>
                <p className="at-desc" style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Atelier Archive
                </p>
                <h2 className="serif at-h2" style={{ fontSize: '2rem' }}>전체 아카이브 보관함</h2>
              </header>
              <div className="at-gallery-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem', maxHeight: '45vh', overflowY: 'auto', padding: '0.5rem' }}>
                {history.map(item => (
                  <div key={item.id} className="at-history-item" style={{ boxShadow: 'var(--shadow-at-soft)', borderRadius: '0.75rem' }}>
                    <div className="at-history-delete" style={{ width: '22px', height: '22px', fontSize: '0.7rem' }} onClick={() => deleteFromHistory(item.id)}>✕</div>
                    <img src={item.url} alt="History" className="at-history-img" style={{ height: '120px', cursor: 'pointer' }} onClick={() => { setResultImg(item.url); setShowResultModal(true); }} />
                    <div style={{ padding: '0.75rem 0.5rem' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.templateName}</p>
                      <p className="at-desc" style={{ fontSize: '0.65rem' }}>{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="at-flex-row" style={{ gap: '1rem', justifyContent: 'center', marginTop: '2.5rem' }}>
                {history.length > 0 && (
                  <button 
                    onClick={() => { if(confirm('모든 보관 기록을 지우시겠습니까?')) { setHistory([]); localStorage.removeItem('aitelier_history'); setShowHistoryModal(false); } }}
                    className="at-btn-outline" 
                    style={{ color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2', padding: '0.75rem 1.5rem', fontSize: '0.95rem', borderRadius: '0.75rem' }}
                  >
                    전체 기록 삭제
                  </button>
                )}
                <button onClick={() => setShowHistoryModal(false)} className="at-btn-outline" style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem', borderRadius: '0.75rem' }}>
                  창 닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
