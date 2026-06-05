'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="at-admin-layout">
      {/* Sidebar */}
      <aside className="at-sidebar">
        <div>
          <h1 className="serif at-h2 at-gradient-text" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>AiTelier</h1>
          <p className="at-desc" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.5 }}>Management</p>
        </div>
        
        <nav className="at-nav-group">
          <Link href="/admin" className={`at-nav-item ${pathname === '/admin' ? 'active' : ''}`}>
            템플릿 보관함
          </Link>
          <Link href="/admin/upload" className={`at-nav-item ${pathname === '/admin/upload' ? 'active' : ''}`}>
            새 디자인 등록
          </Link>
          <Link href="/admin/settings" className={`at-nav-item ${pathname === '/admin/settings' ? 'active' : ''}`}>
            공방 설정
          </Link>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <Link href="/portal" className="at-btn-outline at-w-full" style={{ fontSize: '0.9rem', padding: '1rem' }}>
             포털로 돌아가기
          </Link>
          <p className="at-desc at-text-center at-mt-12" style={{ fontSize: '0.75rem', opacity: 0.4 }}>
            © 2026 AiTelier Atelier
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="at-main-content">
        {children}
      </main>
    </div>
  );
}
