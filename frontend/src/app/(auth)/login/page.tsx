'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useLanguageStore } from '@/store/language';
import { authApi } from '@/lib/api/auth';
import type { ApiError } from '@/lib/api/client';

function LoginFormContent() {
  const { t } = useLanguageStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const sessionExpired = searchParams?.get('session') === 'expired';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError('');

    try {
      const data = await authApi.login({ email: email.trim(), password });
      setAuth(data.user, data.access_token, data.refresh_token);
      // Redirect to intended page or cases
      const next = searchParams?.get('next') || '/cases';
      router.push(next);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.detail || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '420px' }}>
      {/* Card */}
      <div
        className="card"
        style={{ padding: '40px', borderRadius: 'var(--radius-2xl)' }}
      >
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            {t('auth.welcomeBack')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            {t('auth.signInDesc')}
          </p>
        </div>

        {/* Session expired banner */}
        {sessionExpired && (
          <div
            style={{
              background: 'var(--gold-100)',
              border: '1px solid var(--gold-300)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: '0.875rem',
              color: 'var(--gold-700)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            role="alert"
          >
            <span>⚠</span>
            {t('auth.sessionExpired')}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              background: 'var(--evidence-insufficient-bg)',
              border: '1px solid #FECACA',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: '0.875rem',
              color: 'var(--evidence-insufficient)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            role="alert"
            aria-live="polite"
          >
            <span>✕</span>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="email" className="label">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              autoComplete="email"
              required
              disabled={loading}
              className={`input${error ? ' error' : ''}`}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label htmlFor="password" className="label" style={{ margin: 0 }}>
                {t('auth.password')}
              </label>
              <Link href="/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--green-600)', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                autoComplete="current-password"
                required
                disabled={loading}
                className={`input${error ? ' error' : ''}`}
                style={{ paddingRight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-body)',
                  padding: '2px 4px',
                }}
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              >
                {showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '13px',
              fontSize: '1rem',
              opacity: loading || !email || !password ? 0.7 : 1,
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                {t('auth.signingIn')}
              </span>
            ) : (
              t('auth.signIn')
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
          <div className="divider" style={{ flex: 1, margin: 0 }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>or</span>
          <div className="divider" style={{ flex: 1, margin: 0 }} />
        </div>

        {/* Register link */}
        <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          {t('auth.noAccount')}{' '}
          <Link href="/register" style={{ color: 'var(--green-700)', fontWeight: 600, textDecoration: 'none' }}>
            {t('auth.createAccount')}
          </Link>
        </p>
      </div>

      {/* Disclaimer */}
      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '16px', lineHeight: 1.5 }}>
        {t('footer.disclaimer')}
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}

