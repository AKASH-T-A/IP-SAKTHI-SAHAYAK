'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useLanguageStore } from '@/store/language';
import LanguageSelector from './LanguageSelector';
import JurisdictionSwitch from './JurisdictionSwitch';

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: '/', labelKey: 'nav.home', defaultLabel: 'Home' },
  { href: '/explore', labelKey: 'nav.explore', defaultLabel: 'Explore' },
  { href: '/cases', labelKey: 'nav.cases', defaultLabel: 'My Cases' },
  { href: '/evidence', labelKey: 'nav.evidence', defaultLabel: 'Corpus' },
  { href: '/assistant', labelKey: 'nav.assistant', defaultLabel: 'BHASHINI' },
  { href: '/admin', labelKey: 'nav.admin', defaultLabel: 'Admin' },
];

const QUICK_SEARCHES = [
  { labelKey: 'nav.quick.herbalPatent', query: 'Patent for herbal formulation', intent: 'PATENT', shortIntent: 'PATENT' },
  { labelKey: 'nav.quick.fssaiRules', query: 'FSSAI Ayurveda-Aahar rules', intent: 'REGULATION', shortIntent: 'REGULATION' },
  { labelKey: 'nav.quick.giProtection', query: 'GI protection traditional products', intent: 'GI', shortIntent: 'GI' },
  { labelKey: 'nav.quick.absNagoya', query: 'ABS Nagoya Protocol', intent: 'ABS', shortIntent: 'ABS' },
  { labelKey: 'nav.quick.section3p', query: 'Section 3(p) Patents Act', intent: 'PATENT', shortIntent: 'PATENT' },
  { labelKey: 'nav.quick.tkNeem', query: 'Traditional knowledge neem', intent: 'TRADITIONAL_KNOWLEDGE', shortIntent: 'TK' },
];

const QUICK_SEARCH_CONTEXTS: Record<string, Record<string, string>> = {
  'nav.quick.herbalPatent': {
    en: 'Search related patent evidence & prior art',
    kn: 'ಸಂಬಂಧಿತ ಪೇಟೆಂಟ್ ಸಾಕ್ಷ್ಯ ಮತ್ತು ಪೂರ್ವ ಕಲೆ ಹುಡುಕಿ',
    hi: 'संबंधित पेटेंट साक्ष्य एवं पूर्व कला खोजें',
    ta: 'தொடர்புடைய காப்புரிமை சான்றுகளைத் தேடுங்கள்',
    te: 'సంబంధిత పేటెంట్ సాక్ష్యాలను శోధించండి',
    ml: 'ബന്ധപ്പെട്ട പേറ്റന്റ് തെളിവുകൾ തിരയുക',
    mr: 'संबंधित पेटंट पुरावे शोधा',
    bn: 'সম্পর্কিত পেটেন্ট প্রমাণ অনুসন্ধান করুন',
    gu: 'સંબંધિત પેટન્ટ પુરાવા શોધો',
    ur: 'متعلقہ پیٹنٹ شواہد تلاش کریں',
  },
  'nav.quick.fssaiRules': {
    en: 'Regulatory guidance & food safety criteria',
    kn: 'ನಿಯಂತ್ರಕ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಆಹಾರ ಸುರಕ್ಷತಾ ಮಾನದಂಡಗಳು',
    hi: 'नियामक मार्गदर्शन एवं खाद्य सुरक्षा मानक',
    ta: 'ஒழுங்குமுறை வழிகாட்டுதல் மற்றும் உணவுப் பாதுகாப்பு',
    te: 'నియంత్రణ మార్గదర్శకాలు మరియు ఆహార భద్రత',
    ml: 'നിയന്ത്രണ മാർഗ്ഗനിർദ്ദേശങ്ങൾ',
    mr: 'नियामक मार्गदर्शन आणि अन्न सुरक्षा निकष',
    bn: 'নিয়ন্ত্রক নির্দেশিকা ও খাদ্য নিরাপত্তা মানদণ্ড',
    gu: 'નિયમનકારી માર્ગદર્શન અને ખાદ્ય સુરક્ષા માપદંડ',
    ur: 'ریگولیٹری رہنمائی اور فوڈ سیفٹی کے معیارات',
  },
  'nav.quick.giProtection': {
    en: 'Geographical indication pathway & registry',
    kn: 'ಭೌಗೋಳಿಕ ಸೂಚ್ಯಂಕ ಮಾರ್ಗ ಮತ್ತು ನೋಂದಣಿ',
    hi: 'भौगोलिक उपदर्शन मार्ग एवं रजिस्ट्री',
    ta: 'புவிசார் குறியீடு பதிவு முறை',
    te: 'భౌగోళిక సూచిక మార్గం మరియు రిజిస్ట్రీ',
    ml: 'ഭൂമിശാസ്ത്രപരമായ സൂചിക രജിസ്ട്രി',
    mr: 'भौगोलिक मानांकन मार्ग आणि नोंदणी',
    bn: 'ভৌগোলিক নির্দেশক পথ ও রেজিস্ট্রি',
    gu: 'ભૌગોલિક સંકેત માર્ગ અને રજિસ્ટ્રી',
    ur: 'جغرافیائی اشاریہ کا طریقہ کار اور رجسٹری',
  },
  'nav.quick.absNagoya': {
    en: 'Biological resource access & NBA compliance',
    kn: 'ಜೈವಿಕ ಸಂಪನ್ಮೂಲ ಬಳಕೆ ಮತ್ತು ಎನ್ ಬಿ ಎ ಅನುಸರಣೆ',
    hi: 'जैविक संसाधन पहुंच एवं एनबीए अनुपालन',
    ta: 'உயிரியல் வள அணுகல் மற்றும் என்பிஏ இணக்கம்',
    te: 'జీవ వనరుల ప్రాప్యత మరియు ఎన్బీఏ సమ్మతి',
    ml: 'ജൈവ വിഭവ ലഭ്യതയും എൻബിഎ പാലിക്കലും',
    mr: 'जैविक संसाधन प्रवेश आणि एनबीए अनुपालन',
    bn: 'জৈবিক সম্পদ অ্যাক্সেস ও এনবিএ সম্মতি',
    gu: 'જૈવિક સંસાધન ઍક્સેસ અને એનબીએ પાલન',
    ur: 'حیاتیاتی وسائل تک رسائی اور این بی اے تعمیل',
  },
  'nav.quick.section3p': {
    en: 'Traditional knowledge exclusion analysis',
    kn: 'ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನ ವಿನಾಯಿತಿ ವಿಶ್ಲೇಷಣೆ',
    hi: 'पारंपरिक ज्ञान अपवर्जन विश्लेषण',
    ta: 'பாரம்பரிய அறிவு விலக்கு பகுப்பாய்வு',
    te: 'సాంప్రదాయ జ్ఞాన మినహాయింపు విశ్లేషణ',
    ml: 'പരമ്പരാഗത വിജ്ഞാന ഒഴിവാക്കൽ വിശകലനം',
    mr: 'पारंपारिक ज्ञान अपवर्जन विश्लेषण',
    bn: 'ঐতিহ্যগত জ্ঞান বর্জন বিশ্লেষণ',
    gu: 'પરંપરાગત જ્ઞાન બાકાતી વિશ્લેષણ',
    ur: 'روایتی علم کے اخراج کا تجزیہ',
  },
  'nav.quick.tkNeem': {
    en: 'TKDL citations & prior art revocation',
    kn: 'ಟಿಕೆಡಿಎಲ್ ಉಲ್ಲೇಖಗಳು ಮತ್ತು ಮಹತ್ವದ ರದ್ದತಿ ಪೂರ್ವನಿದರ್ಶನಗಳು',
    hi: 'टीकेडीएल उद्धरण एवं ऐतिहासिक निरस्तीकरण नजीरें',
    ta: 'டிகேடிஎல் மேற்கோள்கள் மற்றும் முன்மாதிரிகள்',
    te: 'టికెడిఎల్ ఉల్లేఖనలు మరియు రద్దు పూర్వనిదర్శనాలు',
    ml: 'ടികെഡിഎൽ പരാമർശങ്ങൾ',
    mr: 'टीकेडीएल संदर्भ आणि पूर्व कला रद्दबातल',
    bn: 'টিকেডিএল উদ্ধৃতি ও পূর্ব শিল্প বাতিল',
    gu: 'ટીકેડીએલ સંદર્ભો અને પૂર્વ કલા રદ',
    ur: 'ٹی کے ڈی ایل حوالہ جات اور پیٹنٹ منسوخی',
  },
};

const INTENT_COLORS: Record<string, string> = {
  PATENT: 'var(--green-700)',
  REGULATION: 'var(--gold-700)',
  GI: 'var(--green-700)',
  ABS: 'var(--gold-700)',
  TRADITIONAL_KNOWLEDGE: 'var(--green-700)',
};

const INTENT_BG_COLORS: Record<string, string> = {
  PATENT: 'rgba(74, 138, 94, 0.1)',
  REGULATION: 'rgba(217, 119, 6, 0.1)',
  GI: 'rgba(74, 138, 94, 0.1)',
  ABS: 'rgba(217, 119, 6, 0.1)',
  TRADITIONAL_KNOWLEDGE: 'rgba(74, 138, 94, 0.1)',
};

const INTENT_BORDER_COLORS: Record<string, string> = {
  PATENT: 'rgba(74, 138, 94, 0.25)',
  REGULATION: 'rgba(217, 119, 6, 0.25)',
  GI: 'rgba(74, 138, 94, 0.25)',
  ABS: 'rgba(217, 119, 6, 0.25)',
  TRADITIONAL_KNOWLEDGE: 'rgba(74, 138, 94, 0.25)',
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
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        setHighlightedIndex(-1);
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
        setHighlightedIndex(-1);
        searchRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSearch = useCallback((q: string) => {
    if (!q.trim()) return;
    setSearchFocused(false);
    setHighlightedIndex(-1);
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
            padding: '0 16px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            boxSizing: 'border-box',
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
                {mounted ? (t(link.labelKey) || link.defaultLabel) : link.defaultLabel}
              </Link>
            ))}
          </nav>

          {/* ── Search Bar (desktop, first-class) ────────────────────── */}
          <div
            ref={searchContainerRef}
            className="search-bar-container"
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
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <SearchIcon size={15} />
                </span>
                <input
                  ref={searchRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(-1);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      if (!searchFocused) {
                        setSearchFocused(true);
                      }
                      setHighlightedIndex((prev) => (prev < QUICK_SEARCHES.length - 1 ? prev + 1 : 0));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      if (!searchFocused) {
                        setSearchFocused(true);
                      }
                      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : QUICK_SEARCHES.length - 1));
                    } else if (e.key === 'Enter') {
                      if (searchFocused && highlightedIndex >= 0 && highlightedIndex < QUICK_SEARCHES.length) {
                        e.preventDefault();
                        const s = QUICK_SEARCHES[highlightedIndex];
                        const displayLabel = t(s.labelKey) || s.query;
                        setSearchQuery(displayLabel);
                        handleSearch(displayLabel);
                      }
                    } else if (e.key === 'Escape') {
                      setSearchFocused(false);
                      setHighlightedIndex(-1);
                      searchRef.current?.blur();
                    }
                  }}
                  placeholder={t('nav.searchPlaceholder') || 'Search formulation, patent, rule...'}
                  aria-label="Search IP-SAKTI"
                  aria-expanded={searchFocused}
                  aria-haspopup="listbox"
                  aria-controls="nav-search-dropdown"
                  aria-activedescendant={highlightedIndex >= 0 ? `search-opt-${highlightedIndex}` : undefined}
                  style={{
                    width: '100%',
                    background: searchFocused ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                    border: `1.5px solid ${searchFocused ? 'var(--green-500)' : 'var(--border-default)'}`,
                    borderRadius: 'var(--radius-full)',
                    padding: '7px 68px 7px 36px',
                    fontSize: '0.84375rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all 180ms ease',
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
                    onClick={() => {
                      setSearchQuery('');
                      setHighlightedIndex(-1);
                      searchRef.current?.focus();
                    }}
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
                id="nav-search-dropdown"
                className="search-dropdown"
                role="listbox"
                aria-label="Search suggestions"
              >
                {/* Header */}
                <div
                  style={{
                    padding: '10px 14px 8px',
                    borderBottom: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                    }}
                  >
                    {t('nav.trySearching') || 'Try searching for'}
                  </span>
                  <span
                    style={{
                      fontSize: '0.65625rem',
                      color: 'var(--text-muted)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <kbd style={{ fontSize: '0.625rem', padding: '1px 4px', background: 'var(--bg-subtle)', borderRadius: '3px', border: '1px solid var(--border-default)' }}>↑↓</kbd> navigate
                  </span>
                </div>

                {/* Suggestions List */}
                <div style={{ padding: '6px' }}>
                  {QUICK_SEARCHES.map((s, index) => {
                    const displayLabel = t(s.labelKey) || s.query;
                    const isHighlighted = highlightedIndex === index;
                    const desc = QUICK_SEARCH_CONTEXTS[s.labelKey]?.[language] || QUICK_SEARCH_CONTEXTS[s.labelKey]?.en || '';
                    const badgeLabel = s.shortIntent || s.intent;
                    const badgeColor = INTENT_COLORS[s.intent] || 'var(--green-700)';
                    const badgeBg = INTENT_BG_COLORS[s.intent] || 'rgba(74, 138, 94, 0.1)';
                    const badgeBorder = INTENT_BORDER_COLORS[s.intent] || 'rgba(74, 138, 94, 0.25)';

                    return (
                      <button
                        key={s.labelKey}
                        id={`search-opt-${index}`}
                        role="option"
                        aria-selected={isHighlighted}
                        onClick={() => {
                          setSearchQuery(displayLabel);
                          handleSearch(displayLabel);
                        }}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          width: '100%',
                          padding: '8px 10px',
                          background: isHighlighted ? 'var(--bg-subtle)' : 'transparent',
                          border: 'none',
                          borderRadius: 'var(--radius-lg)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 120ms ease',
                          outline: 'none',
                        }}
                      >
                        {/* Search icon */}
                        <span
                          style={{
                            marginTop: '3px',
                            color: isHighlighted ? 'var(--green-600)' : 'var(--text-muted)',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <SearchIcon size={14} />
                        </span>

                        {/* Text area */}
                        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '0.84375rem',
                              fontWeight: 500,
                              color: isHighlighted ? 'var(--green-900)' : 'var(--text-primary)',
                              lineHeight: 1.35,
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                            }}
                          >
                            {displayLabel}
                          </div>
                          {desc && (
                            <div
                              style={{
                                fontSize: '0.71875rem',
                                color: 'var(--text-muted)',
                                lineHeight: 1.3,
                                marginTop: '2px',
                                whiteSpace: 'normal',
                              }}
                            >
                              {desc}
                            </div>
                          )}
                        </div>

                        {/* Intent Badge */}
                        <span
                          style={{
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            color: badgeColor,
                            background: badgeBg,
                            border: `1px solid ${badgeBorder}`,
                            borderRadius: 'var(--radius-full)',
                            padding: '2px 8px',
                            letterSpacing: '0.05em',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                          title={t(`intents.${s.intent.toLowerCase()}`) || s.intent}
                        >
                          {badgeLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div
                  style={{
                    padding: '8px 14px',
                    background: 'var(--bg-subtle)',
                    borderTop: '1px solid var(--border-default)',
                    fontSize: '0.6875rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>
                    <kbd style={{ fontSize: '0.625rem', padding: '1px 5px', background: 'var(--bg-surface)', borderRadius: '3px', border: '1px solid var(--border-default)' }}>↵</kbd> {t('nav.pressEnter') || 'Press Enter to search'}
                  </span>
                  <span>{t('nav.searchScope') || 'Statutes • Patents • Cases'}</span>
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
                <Link href="/login" className="btn-ghost hide-on-tablet" style={{ fontSize: '0.8125rem', padding: '6px 12px', whiteSpace: 'nowrap' }}>
                  {t('nav.signIn')}
                </Link>
                <Link href="/cases/new" className="btn-primary hide-on-tablet" style={{ padding: '6px 14px', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                  {t('nav.startCase')}
                </Link>
              </>
            )}

            {/* Jurisdiction Mode Switch */}
            <div className="hide-on-tablet">
              <JurisdictionSwitch />
            </div>

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
                onClick={() => setMobileOpen(false)}
              >
                {mounted ? (t(link.labelKey) || link.defaultLabel) : link.defaultLabel}
              </Link>
            ))}

            {/* Dedicated Workflows */}
            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '8px', marginTop: '6px' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 12px' }}>
                SIH Workflows
              </div>
              <Link href="/regulations" style={{ display: 'flex', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                ⚖️ Check Regulations
              </Link>
              <Link href="/claims" style={{ display: 'flex', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                📢 Advertising & Claims
              </Link>
              <Link href="/label-review" style={{ display: 'flex', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                🏷️ Label Review
              </Link>
              <Link href="/international" style={{ display: 'flex', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                🌐 International Access
              </Link>
              <Link href="/privacy" style={{ display: 'flex', padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-primary)', textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                🔒 DPDP & Privacy
              </Link>
            </div>

            {/* Jurisdiction Switch in mobile */}
            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '10px', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Jurisdiction</span>
              <JurisdictionSwitch />
            </div>

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
        .search-bar-container {
          flex: 1 1 320px;
          max-width: 360px;
          min-width: 220px;
          position: relative;
          transition: max-width 200ms ease, flex-basis 200ms ease;
        }

        @media (min-width: 1440px) {
          .search-bar-container {
            flex: 1 1 360px;
            max-width: 380px;
          }
        }

        @media (max-width: 1280px) and (min-width: 1081px) {
          .search-bar-container {
            flex: 1 1 260px;
            max-width: 290px;
            min-width: 180px;
          }
        }

        .search-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 440px;
          max-width: min(440px, calc(100vw - 32px));
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-xl);
          box-shadow: 0 14px 34px -4px rgba(27, 43, 34, 0.16), 0 4px 12px -2px rgba(27, 43, 34, 0.08);
          overflow-y: auto;
          max-height: 70vh;
          z-index: 250;
          animation: fadeIn 150ms ease;
        }

        @media (min-width: 1440px) {
          .search-dropdown {
            width: 460px;
            max-width: min(460px, calc(100vw - 32px));
          }
        }

        [dir="rtl"] .search-dropdown {
          left: auto !important;
          right: 0 !important;
          text-align: right;
        }

        [dir="rtl"] .search-dropdown button {
          text-align: right !important;
        }

        @media (max-width: 1080px) {
          .nav-desktop { display: none !important; }
          .search-bar-container { display: none !important; }
          .mobile-toggle { display: flex !important; }
          .show-on-mobile { display: flex !important; }
          .hide-on-tablet { display: none !important; }
        }
        @media (max-width: 640px) {
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}
