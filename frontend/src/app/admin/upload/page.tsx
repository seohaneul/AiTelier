'use client';

import { useState, useEffect } from 'react';

export default function UploadTemplatePage() {
  const [adminId, setAdminId] = useState('admin');
  const [templateName, setTemplateName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('username');
    if (savedName) setAdminId(savedName);
  }, []);

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
      setStatus('이름과 이미지를 모두 입력해주세요.');
      return;
    }

    setIsUploading(true);
    setStatus('클라우드 서버에 안전하게 등록 중입니다...');
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
        <p className="at-desc">고객 쇼룸에 전시할 새로운 상품 베이스를 안전하게 업로드합니다.</p>
      </header>

      <div className="at-card" style={{ maxWidth: '900px' }}>
        <form onSubmit={handleSubmit} className="at-flex-row">
          {/* Left: Image Upload Zone */}
          <div className="at-flex-1">
            <label className="at-h3 at-mb-12" style={{ display: 'block', fontSize: '1rem' }}>1. 템플릿 이미지</label>
            <div className="at-upload-zone">
              {preview ? (
                <img src={preview} alt="Preview" className="at-img-cover" />
              ) : (
                <div className="at-text-center">
                  <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>🖼️</span>
                  <p className="at-desc" style={{ fontSize: '0.9rem' }}>이미지 파일을 선택하세요</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} required className="at-absolute-overlay" />
            </div>
          </div>

          {/* Right: Info Area */}
          <div className="at-flex-1 at-flex-col" style={{ justifyContent: 'space-between' }}>
            <div className="at-flex-col" style={{ gap: '1rem' }}>
              <label className="at-h3" style={{ fontSize: '1rem' }}>2. 템플릿 명칭</label>
              <input 
                type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} required 
                placeholder="예: 타임리스 가죽 백"
                className="at-input"
              />
              <p className="at-desc" style={{ fontSize: '0.8rem' }}>쇼룸에서 고객들에게 표시될 이름입니다.</p>
            </div>

            <div className="at-mt-12">
              {status && (
                <p className={`at-text-center at-mb-12`} style={{ fontSize: '0.9rem', fontWeight: 600, color: status.includes('성공') ? '#10b981' : 'var(--color-at-leather)' }}>
                  {status}
                </p>
              )}
              <button type="submit" className="at-btn at-w-full" disabled={isUploading}>
                {isUploading ? '등록 진행 중...' : '보관함에 저장하기'}
              </button>
              <button type="button" onClick={() => window.location.href='/admin'} className="at-btn-outline at-w-full at-mt-12" style={{ width: '100%' }}>
                취소하고 돌아가기
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
