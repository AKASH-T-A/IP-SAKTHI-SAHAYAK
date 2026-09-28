/**
 * IP-SAKTI Sahayak — Browser Speech-to-Text (STT) Hook
 * SIH26045
 * 
 * Production-grade Web Speech API recognition hook.
 * Integrated with the centralized LanguageCode store and BCP-47 locale registry.
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LanguageCode } from '@/i18n/languages';
import { getVoiceLocaleMeta, getVoiceStrings } from './locales';

export type SpeechRecognitionStatus = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'ERROR';

export interface UseSpeechRecognitionOptions {
  language: LanguageCode;
  onTranscriptChange?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onError?: (err: string) => void;
}

// Minimal interface for browser SpeechRecognition
interface IBrowserSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: IBrowserSpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: IBrowserSpeechRecognition, ev: any) => void) | null;
  onerror: ((this: IBrowserSpeechRecognition, ev: any) => void) | null;
  onend: ((this: IBrowserSpeechRecognition, ev: Event) => void) | null;
}

export function useSpeechRecognition({
  language,
  onTranscriptChange,
  onFinalTranscript,
  onError,
}: UseSpeechRecognitionOptions) {
  const [status, setStatus] = useState<SpeechRecognitionStatus>('IDLE');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const recognitionRef = useRef<IBrowserSpeechRecognition | null>(null);
  const isExplicitStopRef = useRef<boolean>(false);
  const finalTranscriptRef = useRef<string>('');

  // Check browser support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as any;
      const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
      setIsSupported(Boolean(SpeechRec));
    }
  }, []);

  const voiceStrings = getVoiceStrings(language);
  const localeMeta = getVoiceLocaleMeta(language);

  // Stop & cleanup recognition instance
  const cleanupRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignored
      }
      recognitionRef.current.onstart = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRecognition();
    };
  }, [cleanupRecognition]);

  const stopListening = useCallback(() => {
    isExplicitStopRef.current = true;
    if (recognitionRef.current && status === 'LISTENING') {
      setStatus('PROCESSING');
      try {
        recognitionRef.current.stop();
      } catch {
        cleanupRecognition();
        setStatus('IDLE');
      }
    } else {
      setStatus('IDLE');
    }
  }, [status, cleanupRecognition]);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    const win = window as any;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setIsSupported(false);
      setStatus('ERROR');
      const msg = voiceStrings.langNotSupported;
      setErrorMessage(msg);
      onError?.(msg);
      return;
    }

    // Stop existing instance
    cleanupRecognition();

    setErrorMessage(null);
    setInterimTranscript('');
    isExplicitStopRef.current = false;
    finalTranscriptRef.current = '';

    try {
      const recognition: IBrowserSpeechRecognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      // Configure BCP-47 locale for selected language
      recognition.lang = localeMeta.speechLocale;

      recognition.onstart = () => {
        setStatus('LISTENING');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';
          if (res.isFinal) {
            final += text;
          } else {
            interim += text;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
          onTranscriptChange?.(interim);
        }

        if (final) {
          finalTranscriptRef.current += (finalTranscriptRef.current ? ' ' : '') + final.trim();
          setTranscript(finalTranscriptRef.current);
          setInterimTranscript('');
          onTranscriptChange?.(finalTranscriptRef.current);
        }
      };

      recognition.onerror = (event: any) => {
        const errType = event.error || 'unknown';

        let friendlyError = voiceStrings.tryAgain;

        if (errType === 'not-allowed' || errType === 'service-not-allowed') {
          friendlyError = voiceStrings.micBlocked;
        } else if (errType === 'no-speech') {
          friendlyError = voiceStrings.noSpeechDetected;
        } else if (errType === 'language-not-supported') {
          friendlyError = `${voiceStrings.langNotSupported} (${localeMeta.speechLabel})`;
        } else if (errType === 'audio-capture') {
          friendlyError = 'Microphone hardware unavailable or in use by another application.';
        } else if (errType === 'network') {
          friendlyError = 'Speech recognition network error. Check your connection or type.';
        }

        setStatus('ERROR');
        setErrorMessage(friendlyError);
        onError?.(friendlyError);
      };

      recognition.onend = () => {
        const text = finalTranscriptRef.current.trim();
        setStatus('IDLE');
        setInterimTranscript('');

        if (text) {
          onFinalTranscript?.(text);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      cleanupRecognition();
      setStatus('ERROR');
      const msg = err?.message || voiceStrings.tryAgain;
      setErrorMessage(msg);
      onError?.(msg);
    }
  }, [localeMeta, voiceStrings, onTranscriptChange, onFinalTranscript, onError, cleanupRecognition]);

  const reset = useCallback(() => {
    cleanupRecognition();
    setStatus('IDLE');
    setTranscript('');
    setInterimTranscript('');
    setErrorMessage(null);
  }, [cleanupRecognition]);

  return {
    status,
    transcript,
    interimTranscript,
    errorMessage,
    isSupported,
    startListening,
    stopListening,
    reset,
  };
}
