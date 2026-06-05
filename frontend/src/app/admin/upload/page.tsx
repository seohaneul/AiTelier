'use client';

import { useState, useEffect, useRef } from 'react';

export default function UploadTemplatePage() {
  const [adminId, setAdminId] = useState('admin');
  const [companyName, setCompanyName] = useState('파트너 공방');
  const [templateName, setTemplateName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // File Input Ref to hide default browser tooltip
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem('username');
    const savedCompany = localStorage.getItem('companyName');
    if (savedName) setAdminId(savedName);
    setCompanyName(savedCompany || savedName || '파트너 공방');
  }, []);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !templateName) {
      setStatus('템플릿 명칭과 마스터 이미지를 모두 등록해 주세요.');
      return;
    }

    setIsUploading(true);
    setStatus('클라우드 저장소에 마스터 템플릿을 등록 중입니다...');
    const formData = new FormData();
    formData.append('adminId', adminId);
    formData.append('templateName', templateName);
    formData.append('image', image);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://craft-ai-backend-nu9o.onrender.com/api/v1';
    try {
      const res = await fetch(`${baseUrl}/templates/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setStatus('성공적으로 등록되었습니다! 🎉');
        setTimeout(() => { window.location.href = '/admin'; }, 1500);
      } else {
        setStatus('업로드 중 오류가 발생했습니다.');
        setIsUploading(false);
      }
    } catch (error: any) {
      setStatus('서버 연결 실패. 나중에 다시 시도해주세요.');
      setIsUploading(false);
    }
  };

  return (
    <div className="at-animate-fade-up">
      <header className="at-mb-12">
        <h2 className="serif at-h2">새로운 템플릿 등록</h2>
        <p className="at-desc">고객 쇼룸에 전시할 새로운 상품 마스터 베이스를 업로드합니다.</p>
      </header>

      <div className="at-card" style={{ maxWidth: '900px' }}>
        <form onSubmit={handleSubmit} className="at-flex-row" style={{ gap: '2.5rem' }}>
          {/* Left: Image Upload Zone */}
          <div className="at-flex-1">
            <label className="at-h3 at-mb-12" style={{ display: 'block', fontSize: '1rem', marginBottom: '1rem' }}>1. 마스터 이미지</label>
            <div className="at-upload-zone" onClick={isUploading ? undefined : triggerFileInput} style={{ cursor: isUploading ? 'not-allowed' : 'pointer', height: '260px' }}>
              {isUploading ? (
                <div className="at-text-center">
                  <span className="at-spinner" style={{ width: '3rem', height: '3rem', borderWidth: '4px', marginBottom: '1rem' }}></span>
                  <p className="at-desc" style={{ fontSize: '0.85rem', fontWeight: 600 }}>마스터 이미지 업로드 중...</p>
                </div>
              ) : preview ? (
                <img src={preview} alt="Preview" className="at-img-cover" />
              ) : (
                <div className="at-text-center" style={{ pointerEvents: 'none' }}>
                  <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>🖼️</span>
                  <p className="at-desc" style={{ fontSize: '0.85rem', fontWeight: 600 }}>마스터 이미지 선택</p>
                  <p className="at-desc" style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>클릭하여 디자인 사진을 추가하세요</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*" 
                onChange={handleImageChange} 
                style={{ display: 'none' }} 
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Right: Info Area */}
          <div className="at-flex-1 at-flex-col" style={{ justifyContent: 'space-between', height: '320px' }}>
            <div className="at-flex-col" style={{ gap: '1rem' }}>
              <label className="at-h3" style={{ fontSize: '1rem' }}>2. 템플릿 명칭</label>
              <input 
                type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} required 
                placeholder="예: 클래식 브라운 토트백"
                className="at-input"
              />
              <p className="at-desc" style={{ fontSize: '0.8rem' }}>쇼룸에서 고객들에게 표시될 이름입니다.</p>
              
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-at-muted)' }}>등록 공방: </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-at-leather)' }}>{companyName}</span>
              </div>
            </div>

            <div className="at-mt-12" style={{ marginTop: '1.5rem' }}>
              {status && (
                <p className={`at-text-center at-mb-12`} style={{ fontSize: '0.85rem', fontWeight: 700, color: status.includes('성공') ? '#10b981' : 'var(--color-at-leather)', marginBottom: '1rem' }}>
                  {status}
                </p>
              )}
              <button type="submit" className="at-btn at-w-full" disabled={isUploading} style={{ borderRadius: '1rem', padding: '1rem' }}>
                {isUploading ? (
                  <span className="at-spinner at-spinner-light"></span>
                ) : (
                  '보관함에 저장하기'
                )}
              </button>
              <button type="button" onClick={() => window.location.href='/admin'} className="at-btn-outline at-w-full at-mt-12" style={{ width: '100%', borderRadius: '1rem', padding: '1rem', marginTop: '0.75rem' }}>
                취소하고 돌아가기
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
