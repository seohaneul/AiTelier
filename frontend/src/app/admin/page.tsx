'use client';

import { useState, useEffect } from 'react';

interface Template {
  id: number;
  templateName: string;
  s3OriginalImageUrl: string;
  registrationDate: string;
}

export default function AdminDashboard() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('username');
    if (user) {
      fetchTemplates(user);
    }
  }, []);

  const fetchTemplates = async (userId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://craft-ai-backend-nu9o.onrender.com/api/v1';
    try {
      const res = await fetch(`${baseUrl}/templates/${userId}`);
      if (res.ok) {
        setTemplates(await res.json());
      }
    } catch (e) {
      console.error("템플릿 로드 실패", e);
    }
  };

  const handleOpenEdit = (t: Template) => {
    setSelectedTemplate(t);
    setEditName(t.templateName);
    setEditPreview(t.s3OriginalImageUrl);
    setEditImage(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setIsUpdating(true);
    const formData = new FormData();
    formData.append('templateName', editName);
    if (editImage) formData.append('image', editImage);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://craft-ai-backend-nu9o.onrender.com/api/v1';
    try {
      const res = await fetch(`${baseUrl}/templates/${selectedTemplate.id}`, {
        method: 'PUT',
        body: formData
      });

      if (res.ok) {
        const updated = await res.json();
        setTemplates(templates.map(t => t.id === updated.id ? updated : t));
        setSelectedTemplate(null);
      }
    } catch (e) {
      console.error("수정 실패", e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;
    if (!confirm('템플릿을 영구적으로 삭제하시겠습니까?')) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://craft-ai-backend-nu9o.onrender.com/api/v1';
    try {
      const res = await fetch(`${baseUrl}/templates/${selectedTemplate.id}`, { method: 'DELETE' });
      if (res.ok) {
        setTemplates(templates.filter(t => t.id !== selectedTemplate.id));
        setSelectedTemplate(null);
      }
    } catch (e) {
      console.error("삭제 실패", e);
    }
  };

  return (
    <div>
      {/* Animated Content Wrapper */}
      <div className="at-animate-fade-up">
        <header className="at-mb-12">
          <h2 className="serif at-h1 at-gradient-text" style={{ fontSize: '2.5rem' }}>마스터 템플릿 보관함</h2>
          <p className="at-desc" style={{ fontSize: '1.1rem' }}>공방 쇼룸에 총 <strong style={{ color: 'var(--color-at-leather)' }}>{templates.length}개</strong>의 마스터 템플릿이 배치되어 있습니다.</p>
        </header>

        <div className="at-grid-2" style={{ gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
          {/* Left: Templates Gallery */}
          <section>
            {templates.length === 0 ? (
              <div className="at-card at-text-center" style={{ padding: '6rem 2rem', background: '#fafafa', borderStyle: 'dashed' }}>
                <p className="at-desc at-mb-12">템플릿 보관함이 비어있습니다.</p>
                <button onClick={() => window.location.href = '/admin/upload'} className="at-btn" style={{ width: 'auto', margin: '0 auto' }}>
                  첫 번째 템플릿 등록
                </button>
              </div>
            ) : (
              <div className="at-gallery-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
                {templates.map(temp => (
                  <div key={temp.id} className="at-card at-animate-fade-up" style={{ padding: '0.75rem', cursor: 'pointer' }} onClick={() => handleOpenEdit(temp)}>
                    <div className="at-aspect-square at-rounded-xl overflow-hidden" style={{ background: '#f5f5f5', border: '1px solid var(--border-at-light)' }}>
                      <img src={temp.s3OriginalImageUrl} alt={temp.templateName} className="at-img-cover" />
                    </div>
                    <div style={{ padding: '1rem 0.5rem' }}>
                      <h4 className="at-h3" style={{ fontSize: '1.1rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{temp.templateName}</h4>
                      <p className="at-desc" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        {new Date(temp.registrationDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Right: Settings Control Panel */}
          <aside className="at-history-panel" style={{ padding: '1.5rem', borderRadius: '1.5rem' }}>
            <h3 className="serif at-h3" style={{ fontSize: '1.2rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-at-light)', paddingBottom: '0.5rem' }}>
              공방 환경 설정
            </h3>
            
            <div className="at-flex-col" style={{ gap: '1rem' }}>
              <div className="at-flex-col" style={{ gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-at-muted)' }}>AI 실사 시각화 엔진</label>
                <select className="at-input" style={{ padding: '0.6rem', fontSize: '0.85rem', borderRadius: '0.75rem' }} defaultValue="pro">
                  <option value="flash">Gemini 3.5 Flash (초고속 실사)</option>
                  <option value="pro">Gemini 3 Pro (마스터 에디션)</option>
                  <option value="diffusion">Atelier Diffusion v1.2</option>
                </select>
              </div>

              <div className="at-flex-col" style={{ gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-at-muted)' }}>질감 합성 디테일 강도</label>
                </div>
                <input type="range" min="50" max="100" defaultValue="85" style={{ accentColor: 'var(--color-at-leather)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>자동 클라우드 백업</span>
                <input type="checkbox" defaultChecked style={{ width: '1.1rem', height: '1.1rem', accentColor: 'var(--color-at-leather)', cursor: 'pointer' }} />
              </div>

              <div className="at-flex-col" style={{ gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-at-muted)' }}>쇼룸 전시 테마</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="at-btn-outline" style={{ padding: '0.4rem', fontSize: '0.7rem', flex: 1, background: '#fff', borderRadius: '0.5rem' }}>클래식 브라운</button>
                  <button type="button" className="at-btn-outline" style={{ padding: '0.4rem', fontSize: '0.7rem', flex: 1, borderColor: '#e5e7eb', opacity: 0.5, borderRadius: '0.5rem' }}>모던 블랙</button>
                </div>
              </div>
            </div>

            <button type="button" className="at-btn" style={{ marginTop: '1.5rem', padding: '0.75rem', fontSize: '0.85rem', borderRadius: '0.75rem' }} onClick={() => alert('공방 환경 설정이 저장되었습니다.')}>
              설정 저장
            </button>
          </aside>
        </div>
      </div>

      {/* Detail Setup Modal - Moved outside to cover entire screen including sidebar */}
      {selectedTemplate && (
        <div className="at-modal-overlay" onClick={() => setSelectedTemplate(null)}>
          <div className="at-modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '4rem' }}>
              <header className="at-mb-12 at-text-center">
                <p className="at-desc" style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1rem' }}>Template Detail</p>
                <h2 className="serif at-h2" style={{ fontSize: '2.5rem' }}>템플릿 상세 설정</h2>
              </header>

              <form onSubmit={handleUpdate} className="at-flex-col" style={{ gap: '2.5rem' }}>
                <div className="at-flex-col" style={{ gap: '1rem' }}>
                  <label className="serif at-h3" style={{ fontSize: '1.1rem' }}>마스터 이미지 교체</label>
                  <div className="at-upload-zone" style={{ height: '280px', borderRadius: '1.5rem', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)' }}>
                    <img src={editPreview} alt="Preview" className="at-img-cover" />
                    <div className="at-absolute-overlay" style={{ opacity: 0, zIndex: 10 }}>
                      <input
                        type="file" accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) { setEditImage(file); setEditPreview(URL.createObjectURL(file)); }
                        }}
                        style={{ width: '100%', height: '100%', cursor: 'pointer' }}
                      />
                    </div>
                    <div className="at-absolute-overlay" style={{ background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s' }}>
                      <span style={{ color: '#fff', fontWeight: 600 }}>클릭하여 이미지 변경</span>
                    </div>
                  </div>
                </div>

                <div className="at-flex-col" style={{ gap: '1rem' }}>
                  <label className="serif at-h3" style={{ fontSize: '1.1rem' }}>템플릿 명칭</label>
                  <input
                    type="text" value={editName} onChange={e => setEditName(e.target.value)} required
                    className="at-input"
                    style={{ fontSize: '1.1rem', padding: '1.5rem' }}
                  />
                </div>

                <div className="at-flex-row at-mt-12" style={{ gap: '1rem' }}>
                  <button type="submit" className="at-btn" disabled={isUpdating} style={{ flex: 2, padding: '1.5rem' }}>
                    {isUpdating ? '저장 중...' : '변경 사항 저장'}
                  </button>
                  <button type="button" onClick={handleDelete} className="at-btn-outline" style={{ flex: 1, color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}>
                    영구 삭제
                  </button>
                </div>
              </form>

              <button
                onClick={() => setSelectedTemplate(null)}
                className="at-desc at-mt-12 at-w-full at-text-center"
                style={{ fontSize: '0.95rem', fontWeight: 600, textDecoration: 'underline', marginTop: '3rem' }}
              >
                창 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
