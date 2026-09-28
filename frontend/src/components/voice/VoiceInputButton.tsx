/**
 * IP-SAKTI Sahayak — Accessible Voice Input Button Component
 * SIH26045
 * 
 * Provides microphone input with real-time feedback, accessibility,
 * and seamless fallback across Indian languages.
 */

'use client';

import React from 'react';
import { LanguageCode } from '@/i18n/languages';
import { SpeechRecognitionStatus } from '@/lib/voice/useSpeechRecognition';
import { getVoiceStrings, getVoiceLocaleMeta } from '@/lib/voice/locales';

interface VoiceInputButtonProps {
  status: SpeechRecognitionStatus;
  language: LanguageCode;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
  errorMessage: string | null;
  interimTranscript?: string;
  onDismissError?: () => void;
}

export default function VoiceInputButton({
  status,
  language,
  isSupported,
  onStart,
  onStop,
  errorMessage,
  interimTranscript,
  onDismissError,
}: VoiceInputButtonProps) {
  const voiceStrings = getVoiceStrings(language);
  const localeMeta = getVoiceLocaleMeta(language);

  const isListening = status === 'LISTENING';
  const isProcessing = status === 'PROCESSING';

  const handleClick = () => {
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  const getAriaLabel = () => {
    if (!isSupported) return voiceStrings.langNotSupported;
    if (isListening) return `${voiceStrings.listening} ${voiceStrings.stop}`;
    if (isProcessing) return voiceStrings.understanding;
    return `${voiceStrings.tapToSpeak} (${localeMeta.speechLabel})`;
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {/* Live Accessibility Announcement */}
      <div
        aria-live="polite"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {isListening ? `${voiceStrings.listening} ${localeMeta.speechLabel}` : ''}
        {isProcessing ? voiceStrings.understanding : ''}
        {errorMessage ? errorMessage : ''}
      </div>

      {/* Live Interim Transcript Bubble */}
      {isListening && interimTranscript && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 12px)',
            right: 0,
            background: 'var(--bg-surface)',
            border: '1px solid var(--color-primary)',
            borderRadius: '10px',
            padding: '8px 14px',
            maxWidth: '280px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            zIndex: 100,
            fontSize: '0.82rem',
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            animation: 'fadeIn 150ms ease',
          }}
        >
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '3px', textTransform: 'uppercase' }}>
            🎙️ {voiceStrings.listening} ({localeMeta.speechLabel})
          </div>
          <em>&ldquo;{interimTranscript}&rdquo;</em>
        </div>
      )}

      {/* Inline Error Toast */}
      {errorMessage && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 10px)',
            right: 0,
            background: '#fff7ed',
            border: '1px solid #fdba74',
            borderRadius: '8px',
            padding: '8px 12px',
            maxWidth: '320px',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.15)',
            zIndex: 100,
            fontSize: '0.78rem',
            color: '#9a3412',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>⚠️ {errorMessage}</span>
          {onDismissError && (
            <button
              type="button"
              onClick={onDismissError}
              style={{
                background: 'none',
                border: 'none',
                color: '#9a3412',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.9rem',
                padding: '0 4px',
              }}
              aria-label="Dismiss error"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Main Microphone Button */}
      <button
        type="button"
        onClick={handleClick}
        aria-label={getAriaLabel()}
        title={getAriaLabel()}
        disabled={!isSupported && status !== 'ERROR'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '42px',
          height: '42px',
          borderRadius: '8px',
          border: isListening
            ? '2px solid #ef4444'
            : isProcessing
            ? '2px solid var(--gold-700, #b45309)'
            : '1.5px solid var(--border-color)',
          background: isListening
            ? 'rgba(239, 68, 68, 0.1)'
            : isProcessing
            ? 'rgba(245, 158, 11, 0.1)'
            : 'var(--bg-base)',
          color: isListening ? '#dc2626' : 'var(--color-primary-dark)',
          cursor: isSupported ? 'pointer' : 'not-allowed',
          transition: 'all 150ms ease',
          outline: 'none',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          if (!isListening && isSupported) {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.background = 'rgba(46, 125, 50, 0.08)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isListening && isSupported) {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.background = 'var(--bg-base)';
          }
        }}
      >
        {isListening ? (
          /* Listening Pulse Icon */
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '3px',
                background: '#dc2626',
              }}
            />
          </span>
        ) : isProcessing ? (
          /* Processing Spinner */
          <span style={{ fontSize: '1rem', animation: 'spin 1s linear infinite' }}>⏳</span>
        ) : (
          /* Microphone SVG */
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        )}
      </button>
    </div>
  );
}
