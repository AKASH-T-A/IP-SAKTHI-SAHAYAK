'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useLanguageStore } from '@/store/language';
import { ALL_LANGUAGES } from '@/i18n/languages';
import { authApi } from '@/lib/api/auth';
import type { ApiError } from '@/lib/api/client';

function PasswordStrength({ password }: { password: string }) {
  const { t } = useLanguageStore();
  const checks = [
    { label: t('auth.charRequirement'), ok: password.length >= 8 },
    { label: t('auth.upperRequirement'), ok: /[A-Z]/.test(password) },
    { label: t('auth.numRequirement'), ok: /[0-9]/.test(password) },
  ];
  if (!password) return null;
  const score = checks.filter((c) => c.ok).length;
  const color = score === 3 ? 'var(--evidence-high)' : score === 2 ? 'var(--evidence-moderate)' : 'var(--evidence-low)';
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= score ? color : 'var(--border-default)', transition: 'background 200ms ease' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {checks.map((c) => (
          <span key={c.label} style={{ fontSize: '0.6875rem', color: c.ok ? 'var(--evidence-high)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span>{c.ok ? '✓' : '○'}</span> {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const { t, language: currentLang, setLanguage: setGlobalLanguage } = useLanguageStore();
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState(currentLang || 'en');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrong = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  const canSubmit = name.trim().length >= 2 && email.includes('@') && passwordStrong;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError('');

    try {
      const data = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
        language_preference: language,
      });
      setAuth(data.user, data.access_token, data.refresh_token);
      setGlobalLanguage(language as any);
      router.push('/cases/new?welcome=1');
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '460px' }}>
      <div className="card" style={{ padding: '40px', borderRadius: 'var(--radius-2xl)' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {t('auth.createAccountTitle')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            {t('auth.createAccountDesc')}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'var(--evidence-insufficient-bg)', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '0.875rem', color: 'var(--evidence-insufficient)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }} role="alert">
            <span>✕</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div style={{ marginBottom: '18px' }}>
            <label htmlFor="name" className="label">{t('auth.fullName')}</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('auth.namePlaceholder')}
              autoComplete="name"
              required
              disabled={loading}
              className="input"
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '18px' }}>
            <label htmlFor="reg-email" className="label">{t('auth.email')}</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              autoComplete="email"
              required
              disabled={loading}
              className="input"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '18px' }}>
            <label htmlFor="reg-password" className="label">{t('auth.password')}</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                autoComplete="new-password"
                required
                disabled={loading}
                className="input"
                style={{ paddingRight: '48px' }}
                aria-describedby="password-strength"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-body)' }}
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              >
                {showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              </button>
            </div>
            <div id="password-strength">
              <PasswordStrength password={password} />
            </div>
          </div>

          {/* Language preference */}
          <div style={{ marginBottom: '28px' }}>
            <label htmlFor="language" className="label">{t('auth.preferredLanguage')}</label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              disabled={loading}
              className="input"
              style={{ cursor: 'pointer' }}
            >
              {ALL_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '1rem', opacity: loading || !canSubmit ? 0.7 : 1, cursor: loading || !canSubmit ? 'not-allowed' : 'pointer' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                {t('auth.creatingAccount')}
              </span>
            ) : t('auth.createAccount')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
          <div className="divider" style={{ flex: 1, margin: 0 }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>or</span>
          <div className="divider" style={{ flex: 1, margin: 0 }} />
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          {t('auth.haveAccount')}{' '}
          <Link href="/login" style={{ color: 'var(--green-700)', fontWeight: 600, textDecoration: 'none' }}>{t('auth.signIn')}</Link>
        </p>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '16px', lineHeight: 1.5 }}>
        {t('footer.disclaimer')}
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
