/**
 * IP-SAKTI Sahayak — Browser Text-to-Speech (TTS) Hook
 * SIH26045
 * 
 * Accessible, multilingual Web Speech API synthesis hook.
 * Only reads approved statutory answers and explanations, never replacing evidence cards.
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LanguageCode } from '@/i18n/languages';
import { getVoiceLocaleMeta } from './locales';

export type SpeechSynthesisStatus = 'IDLE' | 'SPEAKING' | 'PAUSED' | 'ERROR';

export function useSpeechSynthesis() {
  const [status, setStatus] = useState<SpeechSynthesisStatus>('IDLE');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize and load available browser voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const voiceList = window.speechSynthesis.getVoices();
        setVoices(voiceList);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      setIsSupported(false);
    }
  }, []);

  // Stop active speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Ignored
        }
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignored
      }
    }
    setStatus('IDLE');
    setSpeakingMessageId(null);
    activeUtteranceRef.current = null;
  }, []);

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && status === 'SPEAKING') {
      try {
        window.speechSynthesis.pause();
        setStatus('PAUSED');
      } catch {
        // Ignored
      }
    }
  }, [status]);

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && status === 'PAUSED') {
      try {
        window.speechSynthesis.resume();
        setStatus('SPEAKING');
      } catch {
        // Ignored
      }
    }
  }, [status]);

  const speak = useCallback(
    (text: string, messageId: string, language: LanguageCode, onComplete?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setIsSupported(false);
        return;
      }

      // Stop any existing speech first
      stop();

      const localeMeta = getVoiceLocaleMeta(language);
      const cleanText = text.trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = localeMeta.ttsLocale;
      utterance.rate = 0.95; // Slightly measured pace for statutory and legal clarity
      utterance.pitch = 1.0;

      // Find best matching voice among available browser voices
      if (voices.length > 0) {
        const langLower = localeMeta.ttsLocale.toLowerCase();
        const baseLang = language.toLowerCase();

        const exactMatch = voices.find((v) => v.lang.toLowerCase() === langLower);
        const prefixMatch = voices.find((v) => v.lang.toLowerCase().startsWith(baseLang));
        const fallbackMatch = voices.find((v) => v.lang.toLowerCase().includes(localeMeta.fallbackLocale.toLowerCase()));

        if (exactMatch) {
          utterance.voice = exactMatch;
        } else if (prefixMatch) {
          utterance.voice = prefixMatch;
        } else if (fallbackMatch) {
          utterance.voice = fallbackMatch;
        }
      }

      utterance.onstart = () => {
        setStatus('SPEAKING');
        setSpeakingMessageId(messageId);
      };

      utterance.onend = () => {
        setStatus('IDLE');
        setSpeakingMessageId(null);
        activeUtteranceRef.current = null;
        onComplete?.();
      };

      utterance.onerror = (e) => {
        // 'interrupted' or 'canceled' are normal when user presses Stop or Pause
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('[SpeechSynthesis] Synthesis error:', e.error);
        }
        setStatus('IDLE');
        setSpeakingMessageId(null);
        activeUtteranceRef.current = null;
      };

      activeUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [voices, stop]
  );

  return {
    status,
    speakingMessageId,
    isSupported,
    voices,
    speak,
    pause,
    resume,
    stop,
  };
}
