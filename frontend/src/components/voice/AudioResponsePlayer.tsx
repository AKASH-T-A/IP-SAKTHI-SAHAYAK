/**
 * IP-SAKTI Sahayak — Audio Response Player Component
 * SIH26045
 * 
 * Provides accessible TTS controls ([Listen], [Pause], [Resume], [Stop])
 * for Assistant intelligence responses.
 */

'use client';

import React from 'react';
import { LanguageCode } from '@/i18n/languages';
import { SpeechSynthesisStatus } from '@/lib/voice/useSpeechSynthesis';
import { getVoiceStrings, getVoiceLocaleMeta } from '@/lib/voice/locales';

interface AudioResponsePlayerProps {
  messageId: string;
  answerText: string;
  language: LanguageCode;
  synthesisStatus: SpeechSynthesisStatus;
  activeMessageId: string | null;
  onSpeak: (text: string, messageId: string) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export default function AudioResponsePlayer({
  messageId,
  answerText,
  language,
  synthesisStatus,
  activeMessageId,
  onSpeak,
  onPause,
  onResume,
  onStop,
}: AudioResponsePlayerProps) {
  const isThisMessageActive = activeMessageId === messageId;
  const isSpeaking = isThisMessageActive && synthesisStatus === 'SPEAKING';
  const isPaused = isThisMessageActive && synthesisStatus === 'PAUSED';

  const voiceStrings = getVoiceStrings(language);
  const localeMeta = getVoiceLocaleMeta(language);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: isThisMessageActive ? 'rgba(46, 125, 50, 0.08)' : 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '3px 10px',
        fontSize: '0.78rem',
        transition: 'all 150ms ease',
      }}
    >
      {/* Primary Listen / Resume / Pause Toggle Button */}
      {!isSpeaking && !isPaused && (
        <button
          type="button"
          onClick={() => onSpeak(answerText, messageId)}
          aria-label={`${voiceStrings.listen} (${localeMeta.speechLabel})`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'none',
            border: 'none',
            color: 'var(--color-primary-dark)',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '4px',
            fontSize: '0.78rem',
          }}
        >
          <span aria-hidden="true">🔊</span>
          <span>{voiceStrings.listen}</span>
        </button>
      )}

      {isSpeaking && (
        <button
          type="button"
          onClick={onPause}
          aria-label={voiceStrings.pause}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'none',
            border: 'none',
            color: 'var(--color-primary-dark)',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '4px',
            fontSize: '0.78rem',
          }}
        >
          <span aria-hidden="true">⏸</span>
          <span>{voiceStrings.pause}</span>
        </button>
      )}

      {isPaused && (
        <button
          type="button"
          onClick={onResume}
          aria-label={voiceStrings.resume}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'none',
            border: 'none',
            color: 'var(--color-primary-dark)',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '4px',
            fontSize: '0.78rem',
          }}
        >
          <span aria-hidden="true">▶</span>
          <span>{voiceStrings.resume}</span>
        </button>
      )}

      {/* Stop Button (shown whenever this message is speaking or paused) */}
      {(isSpeaking || isPaused) && (
        <button
          type="button"
          onClick={onStop}
          aria-label={voiceStrings.stop}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: '#dc2626',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '4px',
            fontSize: '0.78rem',
          }}
        >
          <span aria-hidden="true">⏹</span>
          <span>{voiceStrings.stop}</span>
        </button>
      )}

      {/* Speaking Indicator */}
      {isSpeaking && (
        <span
          style={{
            fontSize: '0.72rem',
            color: 'var(--color-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 500,
          }}
        >
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)', animation: 'pulse 1s infinite' }} />
          {localeMeta.speechLabel}
        </span>
      )}
    </div>
  );
}
