/**
 * IP-SAKTI Sahayak — Speech Text Preparation & Normalization
 * SIH26045
 * 
 * Prepares text for Text-to-Speech (TTS) synthesis across all 22 Scheduled
 * Indian Languages + English.
 * 
 * CORE RULES:
 * 1. Canonical Legal Identifiers (e.g. Section 3(p), Section 3(e), Section 10(4)(ii)(D),
 *    Rule 158B, Form III, Schedule T, Schedule 1, Patents Act 1970) MUST be preserved.
 * 2. Surrounding text must be spoken in the selected language.
 * 3. Strips markdown syntax, technical symbols, citation markup [1], [2], URLs,
 *    and UI-only decorations.
 * 4. Normalizes numbers and punctuation to prevent speech synthesizers from tripping
 *    or inappropriately switching to English phonetics.
 */

import { LanguageCode } from '@/i18n/languages';

// Canonical legal and statutory identifiers that must never be mangled or translated
const LEGAL_IDENTIFIERS_PATTERNS = [
  /Section\s+\d+\s*\([a-z0-9]+\)(?:\s*\([a-z0-9ivx]+\))*/gi, // Section 3(p), Section 10(4)(ii)(D)
  /Section\s+\d+/gi,                                            // Section 3
  /Rule\s+\d+[A-Z]?/gi,                                         // Rule 158B, Rule 158
  /Schedule\s+[A-Z0-9]+/gi,                                     // Schedule T, Schedule 1
  /Form\s+[IVX0-9]+/gi,                                         // Form III, Form 1
  /Patents\s+Act(?:\s*,\s*|\s+)1970/gi,                         // Patents Act 1970
  /Biological\s+Diversity\s+Act(?:\s*,\s*|\s+)2002/gi,          // Biological Diversity Act 2002
  /Drugs\s+(?:and|&)\s+Cosmetics\s+Act(?:\s*,\s*|\s+)1940/gi,   // Drugs & Cosmetics Act 1940
  /Drugs\s+(?:and|&)\s+Cosmetics\s+Rules(?:\s*,\s*|\s+)1945/gi, // Drugs & Cosmetics Rules 1945
  /AYUSH/g,
  /FSSAI/g,
  /TKDL/g,
  /NBA/g,
  /SBB/g,
];

/**
 * Prepares and normalizes text for speech synthesis in the given language.
 */
export function prepareTextForSpeech(text: string, language: LanguageCode): string {
  if (!text || typeof text !== 'string') return '';

  let prepared = text.trim();

  // 1. Remove URLs (http://, https://, www.)
  prepared = prepared.replace(/https?:\/\/\S+/gi, '');
  prepared = prepared.replace(/www\.\S+/gi, '');

  // 2. Remove citation references like [1], [2], [Citation 3], (Source: Gazette...)
  prepared = prepared.replace(/\[\s*\d+\s*\]/g, '');
  prepared = prepared.replace(/\[\s*Citation\s*\d+\s*\]/gi, '');
  prepared = prepared.replace(/\(\s*Source:\s*[^)]+\)/gi, '');
  prepared = prepared.replace(/\[\s*Source:\s*[^\]]+\]/gi, '');

  // 3. Remove Markdown headings (# Heading), blockquotes (> quote)
  prepared = prepared.replace(/^#{1,6}\s+/gm, '');
  prepared = prepared.replace(/^>\s+/gm, '');

  // 4. Remove Markdown bold/italics/strikethrough/code blocks
  // ```code``` -> strip completely
  prepared = prepared.replace(/```[\s\S]*?```/g, '');
  // `code` -> retain content
  prepared = prepared.replace(/`([^`]+)`/g, '$1');
  // **bold** or *italic* or _italic_ -> retain content
  prepared = prepared.replace(/\*\*([^*]+)\*\*/g, '$1');
  prepared = prepared.replace(/\*([^*]+)\*/g, '$1');
  prepared = prepared.replace(/__([^_]+)__/g, '$1');
  prepared = prepared.replace(/_([^_]+)_/g, '$1');
  prepared = prepared.replace(/~~([^~]+)~~/g, '$1');

  // 5. Remove Markdown list markers (*, -, +, 1., 2.)
  prepared = prepared.replace(/^\s*[-*+]\s+/gm, '');
  prepared = prepared.replace(/^\s*\d+\.\s+/gm, '');

  // 6. Remove UI emojis, special graphical symbols, and decorative glyphs
  // Keep standard punctuation and Indic unicode characters
  prepared = prepared.replace(
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}🌿🛡️⚙️💡✓✔❌✕✖➜➤►•●★☆🔍🔊🎤]/gu,
    ''
  );

  // 7. Protect Legal Identifiers from destructive transformations
  // Temporarily replace legal identifiers with safe placeholders
  const placeholders: { placeholder: string; original: string }[] = [];
  let placeholderCount = 0;

  for (const pattern of LEGAL_IDENTIFIERS_PATTERNS) {
    prepared = prepared.replace(pattern, (match) => {
      const ph = `__LEGAL_PH_${placeholderCount++}__`;
      placeholders.push({ placeholder: ph, original: match });
      return ph;
    });
  }

  // 8. Normalize repetitive punctuation and dashes
  prepared = prepared.replace(/\.{2,}/g, '.');
  prepared = prepared.replace(/[-–—]{2,}/g, '—');
  prepared = prepared.replace(/\s*([,;:.!?])\s*/g, '$1 ');

  // 9. Restore Legal Identifiers intact
  for (const { placeholder, original } of placeholders) {
    prepared = prepared.replace(placeholder, original);
  }

  // 10. Clean excessive whitespace
  prepared = prepared.replace(/\s+/g, ' ').trim();

  return prepared;
}
