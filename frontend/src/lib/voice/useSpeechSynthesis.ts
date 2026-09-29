/**
 * IP-SAKTI Sahayak — Browser Text-to-Speech (TTS) Hook
 * SIH26045
 * 
 * Accessible, multilingual Web Speech API synthesis hook.
 * Strictly adheres to selected language locale, prioritizes FEMALE voices for BHASHINI,
 * never forces English fallback voice on Indian languages, and prepares text with
 * canonical legal identifier preservation.
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LanguageCode } from '@/i18n/languages';
import { getVoiceLocaleMeta } from './locales';
import { prepareTextForSpeech } from './prepareSpeech';

export type SpeechSynthesisStatus = 'IDLE' | 'SPEAKING' | 'PAUSED' | 'ERROR';

export interface ActiveVoiceInfo {
  voiceName: string;
  lang: string;
  isFemale: boolean;
  isLanguageMatched: boolean;
}

// Well-known female voice names and tokens across Chrome, Edge, Safari, Android, and Windows
const FEMALE_VOICE_KEYWORDS = [
  'female',
  'woman',
  'girl',
  'zira',
  'heera',
  'kalpana',
  'swara',
  'priya',
  'shruti',
  'neerja',
  'geeta',
  'sangeeta',
  'kavya',
  'aditi',
  'vani',
  'ananya',
  'leela',
  'veena',
  'sita',
  'radha',
  'jaya',
  'deepa',
  'sunita',
  'rekha',
  'kamala',
  'pooja',
  'divya',
  'sapna',
  'samantha',
  'karen',
  'victoria',
  'moira',
  'fiona',
  'tessa',
];

/**
 * Checks if a SpeechSynthesisVoice represents a female voice.
 */
export function isVoiceFemale(voice: SpeechSynthesisVoice): boolean {
  const nameLower = voice.name.toLowerCase();
  return FEMALE_VOICE_KEYWORDS.some((kw) => nameLower.includes(kw));
}

/**
 * Selects the best voice for the target language, strictly prioritizing female voices.
 * NEVER returns an English fallback voice for non-English languages.
 */
export function selectBestVoice(
  voices: SpeechSynthesisVoice[],
  language: LanguageCode,
  ttsLocale: string
): { voice: SpeechSynthesisVoice | null; isFemale: boolean; isLanguageMatched: boolean } {
  if (!voices || voices.length === 0) {
    return { voice: null, isFemale: false, isLanguageMatched: false };
  }

  const langLower = ttsLocale.toLowerCase();
  const baseLang = language.toLowerCase();

  // 1. All voices exactly matching the locale (e.g. 'kn-IN' or 'hi-IN')
  const exactLocaleVoices = voices.filter((v) => v.lang.toLowerCase() === langLower);

  // 2. All voices matching base language code (e.g. 'kn' or 'hi')
  const baseLangVoices = voices.filter(
    (v) =>
      v.lang.toLowerCase().startsWith(baseLang + '-') ||
      v.lang.toLowerCase() === baseLang
  );

  const candidateVoices = exactLocaleVoices.length > 0 ? exactLocaleVoices : baseLangVoices;

  if (candidateVoices.length > 0) {
    // Check for female candidate first
    const femaleCandidate = candidateVoices.find((v) => isVoiceFemale(v));
    if (femaleCandidate) {
      return { voice: femaleCandidate, isFemale: true, isLanguageMatched: true };
    }
    // Return first candidate of that language
    return { voice: candidateVoices[0], isFemale: isVoiceFemale(candidateVoices[0]), isLanguageMatched: true };
  }

  // If language is English ('en'), find English female voice
  if (language === 'en') {
    const enVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
    const femaleEn = enVoices.find((v) => isVoiceFemale(v));
    if (femaleEn) {
      return { voice: femaleEn, isFemale: true, isLanguageMatched: true };
    }
    if (enVoices.length > 0) {
      return { voice: enVoices[0], isFemale: isVoiceFemale(enVoices[0]), isLanguageMatched: true };
    }
  }

  // CRITICAL FIX: For non-English Indian languages, DO NOT assign an English voice to utterance.voice!
  // Setting utterance.voice = EnglishVoice forces English phonetics onto Kannada/Hindi/Tamil text.
  // Instead, return voice: null so the browser relies on utterance.lang = ttsLocale to synthesize.
  return { voice: null, isFemale: false, isLanguageMatched: false };
}

export function useSpeechSynthesis() {
  const [status, setStatus] = useState<SpeechSynthesisStatus>('IDLE');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoiceInfo, setCurrentVoiceInfo] = useState<ActiveVoiceInfo | null>(null);

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
    setCurrentVoiceInfo(null);
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
      
      // Clean and prepare text: strip markdown, citation markers, protect legal identifiers
      const speechReadyText = prepareTextForSpeech(text, language);
      if (!speechReadyText) return;

      const utterance = new SpeechSynthesisUtterance(speechReadyText);
      utterance.lang = localeMeta.ttsLocale;
      utterance.rate = 0.95; // Slightly measured pace for statutory and legal clarity
      utterance.pitch = 1.05; // Slightly elevated pitch suitable for female voice timbre

      // Select female voice for the target language
      const { voice, isFemale, isLanguageMatched } = selectBestVoice(
        voices,
        language,
        localeMeta.ttsLocale
      );

      if (voice) {
        utterance.voice = voice;
        setCurrentVoiceInfo({
          voiceName: voice.name,
          lang: voice.lang,
          isFemale,
          isLanguageMatched,
        });
      } else {
        // No explicit voice object assigned: let native engine use utterance.lang
        setCurrentVoiceInfo({
          voiceName: `Native Platform Synthesizer (${localeMeta.ttsLocale})`,
          lang: localeMeta.ttsLocale,
          isFemale: false, // Truthful reporting: cannot verify female without voice metadata
          isLanguageMatched: true,
        });
      }

      utterance.onstart = () => {
        setStatus('SPEAKING');
        setSpeakingMessageId(messageId);
      };

      utterance.onend = () => {
        setStatus('IDLE');
        setSpeakingMessageId(null);
        setCurrentVoiceInfo(null);
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
        setCurrentVoiceInfo(null);
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
    currentVoiceInfo,
    isSupported,
    voices,
    speak,
    pause,
    resume,
    stop,
  };
}
