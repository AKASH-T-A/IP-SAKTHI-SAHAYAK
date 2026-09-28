'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useLanguageStore } from '@/store/language';
import LanguageSelector from './LanguageSelector';

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: '/', labelKey: 'nav.home', defaultLabel: 'Home' },
  { href: '/explore', labelKey: 'nav.explore', defaultLabel: 'Explore' },
  { href: '/cases', labelKey: 'nav.cases', defaultLabel: 'My Cases' },
  { href: '/evidence', labelKey: 'nav.evidence', defaultLabel: 'Corpus' },
  { href: '/assistant', labelKey: 'nav.assistant', defaultLabel: 'Assistant' },
];

const QUICK_SEARCHES = [
  { labelKey: 'nav.quick.herbalPatent', query: 'Patent for herbal formulation', intent: 'PATENT' },
  { labelKey: 'nav.quick.fssaiRules', query: 'FSSAI Ayurveda-Aahar rules', intent: 'REGULATION' },
  { labelKey: 'nav.quick.giProtection', query: 'GI protection traditional products', intent: 'GI' },
  { labelKey: 'nav.quick.absNagoya', query: 'ABS Nagoya Protocol', intent: 'ABS' },
  { labelKey: 'nav.quick.section3p', query: 'Section 3(p) Patents Act', intent: 'PATENT' },
  { labelKey: 'nav.quick.tkNeem', query: 'Traditional knowledge neem', intent: 'TRADITIONAL_KNOWLEDGE' },
];

const INTENT_COLORS: Record<string, string> = {
  PATENT: 'var(--green-700)',
  REGULATION: 'var(--gold-700)',
  GI: 'var(--green-700)',
  ABS: 'var(--gold-700)',
  TRADITIONAL_KNOWLEDGE: 'var(--green-700)',
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const SearchIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const LeafIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { language, setLanguage, t } = useLanguageStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        setSearchFocused(true);
      }
      if (e.key === 'Escape') {
        setSearchFocused(false);
        searchRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSearch = useCallback((q: string) => {
    if (!q.trim()) return;
    setSearchFocused(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }, [router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handleLogout = () => {
    clearAuth();
    setShowUserMenu(false);
    router.push('/');
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header
        role="banner"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: '64px',
          background: scrolled ? 'rgba(250,250,247,0.96)' : 'var(--bg-base)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border-default)' : '1px solid transparent',
          transition: 'all 200ms ease',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link
            href="/"
            aria-label="IP-SAKTI Sahayak — Home"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              flexShrink: 0,
              marginRight: '4px',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                background: 'linear-gradient(135deg, var(--green-800), var(--green-600))',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <LeafIcon />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--green-900)', lineHeight: 1.1 }}>
                IP-SAKTI
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Sahayak
              </div>
            </div>
          </Link>

          {/* ── Desktop Nav ──────────────────────────────────────────── */}
          <nav
            aria-label="Main navigation"
            className="nav-desktop"
            style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link${isActive(link.href) ? ' active' : ''}`}
                aria-current={isActive(link.href) ? 'page' : undefined}
                style={{ fontSize: '0.875rem', padding: '6px 12px' }}
              >
                {t(link.labelKey) || link.defaultLabel}
              </Link>
            ))}
          </nav>

          {/* ── Search Bar (desktop, first-class) ────────────────────── */}
          <div
            ref={searchContainerRef}
            className="search-bar-container"
            style={{
              flex: 1,
              maxWidth: '400px',
              position: 'relative',
            }}
          >
            <form onSubmit={handleSearchSubmit}>
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    color: searchFocused ? 'var(--green-600)' : 'var(--text-muted)',
                    pointerEvents: 'none',
                    transition: 'color 150ms ease',
                    zIndex: 1,
                  }}
                >
                  <SearchIcon size={15} />
                </span>
                <input
                  ref={searchRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder={t('nav.searchPlaceholder')}
                  aria-label="Search IP-SAKTI"
                  style={{
                    width: '100%',
                    background: searchFocused ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                    border: `1.5px solid ${searchFocused ? 'var(--green-400)' : 'var(--border-default)'}`,
                    borderRadius: 'var(--radius-full)',
                    padding: '7px 64px 7px 36px',
                    fontSize: '0.8125rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all 200ms ease',
                    fontFamily: 'var(--font-body)',
                    boxShadow: searchFocused ? '0 0 0 3px rgba(74,138,94,0.12)' : 'none',
                  }}
                />
                {/* Keyboard hint */}
                {!searchFocused && (
                  <span
                    style={{
                      position: 'absolute',
                      right: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      pointerEvents: 'none',
                    }}
                  >
                    <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', background: 'var(--bg-emphasis)', border: '1px solid var(--border-default)', borderRadius: '4px', padding: '1px 5px', color: 'var(--text-muted)' }}>⌘K</kbd>
                  </span>
                )}
                {/* Clear button */}
                {searchFocused && searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    aria-label="Clear search"
                  >
                    <CloseIcon />
                  </button>
                )}
              </div>
            </form>

            {/* ── Search Dropdown ──────────────────────────────────── */}
            {searchFocused && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: 'var(--shadow-xl)',
                  overflow: 'hidden',
                  zIndex: 200,
                  animation: 'fadeIn 150ms ease',
                }}
                role="listbox"
                aria-label="Search suggestions"
              >
                {/* Header */}
                <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid var(--border-default)' }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                    {t('nav.trySearching')}
                  </p>
                </div>

                {/* Suggestions */}
                <div style={{ padding: '8px' }}>
                  {QUICK_SEARCHES.map((s) => {
                    const displayLabel = t(s.labelKey) || s.query;
                    return (
                      <button
                        key={s.labelKey}
                        role="option"
                        aria-selected={false}
                        onClick={() => {
                          setSearchQuery(displayLabel);
                          handleSearch(displayLabel);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '8px 10px',
                          background: 'none',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 150ms ease',
                          gap: '8px',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <SearchIcon size={13} />
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{displayLabel}</span>
                        </span>
                        <span style={{
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          color: INTENT_COLORS[s.intent] || 'var(--text-muted)',
                          background: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-full)',
                          padding: '2px 7px',
                          letterSpacing: '0.04em',
                          flexShrink: 0,
                        }}>
                          {t(`intents.${s.intent.toLowerCase()}`) || s.intent}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div style={{
                  padding: '10px 16px',
                  background: 'var(--bg-subtle)',
                  borderTop: '1px solid var(--border-default)',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>{t('nav.pressEnter')}</span>
                  <span>{t('nav.searchScope')}</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Right Actions ─────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: 'auto' }}>

            {isAuthenticated && user ? (
              /* User Menu */
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-expanded={showUserMenu}
                  aria-haspopup="menu"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-full)',
                    padding: '5px 12px 5px 8px',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    transition: 'all 150ms ease',
                    fontFamily: 'var(--font-body)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-emphasis)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                >
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--green-700)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700 }}>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hide-on-mobile">{user.name.split(' ')[0]}</span>
                  <ChevronDown />
                </button>

                {showUserMenu && (
                  <div
                    role="menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-xl)',
                      boxShadow: 'var(--shadow-lg)',
                      minWidth: '200px',
                      overflow: 'hidden',
                      animation: 'fadeIn 150ms ease',
                    }}
                  >
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{user.email}</div>
                    </div>
                    <div style={{ padding: '8px' }}>
                      <Link href="/cases" role="menuitem" style={{ display: 'block', padding: '8px 10px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-primary)', textDecoration: 'none' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}>
                        {t('nav.myCases')}
                      </Link>
                      {user.role === 'admin' && (
                        <Link href="/admin" role="menuitem" style={{ display: 'block', padding: '8px 10px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-primary)', textDecoration: 'none' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}>
                          {t('nav.admin')}
                        </Link>
                      )}
                      <button
                        role="menuitem"
                        onClick={handleLogout}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--evidence-insufficient)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', marginTop: '4px' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--evidence-insufficient-bg)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                      >
                        {t('nav.signOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Auth CTAs */
              <>
                <Link href="/login" className="btn-ghost hide-on-mobile" style={{ fontSize: '0.875rem', padding: '7px 14px' }}>
                  {t('nav.signIn')}
                </Link>
                <Link href="/cases/new" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                  {t('nav.startCase')}
                </Link>
              </>
            )}

            {/* Professional All-Indian-Languages Selector */}
            <LanguageSelector />

            {/* Mobile search icon */}
            <button
              className="show-on-mobile"
              onClick={() => { setSearchFocused(true); searchRef.current?.focus(); }}
              style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'none' }}
              aria-label="Search"
            >
              <SearchIcon size={18} />
            </button>

            {/* Mobile menu toggle */}
            <button
              className="mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'none' }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ─────────────────────────────────────────────── */}
        {mobileOpen && (
          <div
            style={{
              background: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-default)',
              padding: '8px 24px 20px',
              position: 'absolute',
              top: '64px',
              left: 0,
              right: 0,
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Mobile search */}
            <form onSubmit={handleSearchSubmit} style={{ margin: '12px 0' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                  <SearchIcon size={15} />
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.searchPlaceholder')}
                  style={{ width: '100%', background: 'var(--bg-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-full)', padding: '9px 16px 9px 36px', fontSize: '0.875rem', outline: 'none', fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}
                />
              </div>
            </form>

            {/* Nav links */}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link${isActive(link.href) ? ' active' : ''}`}
                style={{ display: 'flex', padding: '10px 12px', marginBottom: '2px' }}
              >
                {t(link.labelKey) || link.defaultLabel}
              </Link>
            ))}

            {/* Language Selector in mobile */}
            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '10px', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{t('nav.language')}</span>
              <LanguageSelector />
            </div>

            {/* Auth in mobile */}
            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '12px', marginTop: '8px', display: 'flex', gap: '8px' }}>
              {isAuthenticated ? (
                <button onClick={handleLogout} className="btn-ghost" style={{ fontSize: '0.875rem' }}>{t('nav.signOut')}</button>
              ) : (
                <>
                  <Link href="/login" className="btn-ghost" style={{ fontSize: '0.875rem' }}>{t('nav.signIn')}</Link>
                  <Link href="/register" className="btn-primary" style={{ fontSize: '0.875rem', padding: '8px 16px' }}>{t('nav.register')}</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <style>{`
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .search-bar-container { display: none !important; }
          .mobile-toggle { display: flex !important; }
          .show-on-mobile { display: flex !important; }
        }
        @media (max-width: 640px) {
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}
