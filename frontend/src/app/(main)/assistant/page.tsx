'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCasesStore } from '@/store/cases';
import { useLanguageStore } from '@/store/language';
import { generateAssistantResponse } from '@/lib/intelligence/assistant';
import { StructuredAssistantResponse, Citation } from '@/lib/intelligence/types';
import EvidenceDrawer from '@/components/intelligence/EvidenceDrawer';
import EvidenceStrengthBadge from '@/components/intelligence/EvidenceStrengthBadge';
import { useSpeechRecognition } from '@/lib/voice/useSpeechRecognition';
import { useSpeechSynthesis } from '@/lib/voice/useSpeechSynthesis';
import VoiceInputButton from '@/components/voice/VoiceInputButton';
import AudioResponsePlayer from '@/components/voice/AudioResponsePlayer';
import { getVoiceStrings, getVoiceLocaleMeta } from '@/lib/voice/locales';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text?: string;
  structured?: StructuredAssistantResponse;
  timestamp: string;
}

function AssistantContent() {
  const searchParams = useSearchParams();
  const contextParam = searchParams?.get('context') || '';

  const { cases } = useCasesStore();
  const { language, t } = useLanguageStore();
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [inputQuery, setInputQuery] = useState('');
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [voiceMode, setVoiceMode] = useState<boolean>(false);
  const [autoReadResponses, setAutoReadResponses] = useState<boolean>(false);

  const voiceStrings = getVoiceStrings(language);
  const voiceLocaleMeta = getVoiceLocaleMeta(language);

  // Match case from context query param if provided
  useEffect(() => {
    if (contextParam) {
      const match = cases.find(
        (c) => c.id === contextParam || c.title.toLowerCase().includes(contextParam.toLowerCase())
      );
      if (match) {
        setSelectedCaseId(match.id);
      }
    }
  }, [contextParam, cases]);

  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  const getWelcomeMessage = (lang: string) => {
    switch (lang) {
      case 'hi':
        return 'नमस्ते! मैं IP-SAKTI विधिक एवं विनियामक निर्णय सहायक हूँ। मैं आपके प्रकरण, भारतीय पेटेंट अधिनियम 1970, औषधि एवं प्रसाधन नियमावली 1945 और जैव विविधता अधिनियम 2002 के अधिकृत प्रावधानों पर आधारित हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?';
      case 'kn':
        return 'ನಮಸ್ಕಾರ! ನಾನು IP-SAKTI ಶಾಸನಬದ್ಧ ಮತ್ತು ನಿಯಂತ್ರಕ ನಿರ್ಧಾರ ಬೆಂಬಲ ಸಹಾಯಕ. ನಾನು ಭಾರತೀಯ ಪೇಟೆಂಟ್ ಕಾಯಿದೆ 1970, ಔಷಧ ಮತ್ತು ಸೌಂದರ್ಯವರ್ಧಕ ನಿಯಮಗಳು 1945 ಮತ್ತು ಜೈವಿಕ ವೈವಿಧ್ಯ ಕಾಯಿದೆ 2002 ರ ಅಧಿಕೃತ ನಿಬಂಧನೆಗಳ ಮೇಲೆ ಆಧಾರಿತನಾಗಿದ್ದೇನೆ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?';
      case 'ta':
        return 'வணக்கம்! நான் IP-SAKTI சட்டரீதியான முடிவெடுக்கும் உதவியாளர். இந்திய காப்புரிமைச் சட்டம் 1970, மருந்துகள் மற்றும் அழகுசாதனப் பொருட்கள் விதிகள் 1945 மற்றும் பல்லுயிர் சட்டம் 2002 ஆகியவற்றின் அடிப்படையில் நான் பதிலளிக்கிறேன். இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?';
      case 'te':
        return 'నమస్కారం! నేను IP-SAKTI చట్టపరమైన మరియు నియంత్రణ నిర్ణయ సహాయకుడిని. భారత పేటెంట్ చట్టం 1970, డ్రగ్స్ & కాస్మెటిక్స్ నియమాలు 1945 మరియు జీవ వైవిధ్య చట్టం 2002 ఆధారంగా నేను మార్గదర్శనం చేస్తాను. ఈరోజు నేను మీకు ఎలా సహాయపడగలను?';
      default:
        return 'Namaste! I am the IP-SAKTI Sahayak Statutory Intelligence Assistant. I am grounded in your case context, The Patents Act 1970, Drugs & Cosmetics Rules 1945, and Biological Diversity Act 2002. How can I assist your formulation decision strategy today?';
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: getWelcomeMessage(language),
      timestamp: 'Just now',
    },
  ]);

  // Update welcome message when language changes if only welcome is present
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{ ...prev[0], text: getWelcomeMessage(language) }];
      }
      return prev;
    });
  }, [language]);

  const {
    status: speechStatus,
    interimTranscript,
    errorMessage: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    reset: resetSpeech,
  } = useSpeechRecognition({
    language,
    onTranscriptChange: (text) => {
      setInputQuery(text);
    },
    onFinalTranscript: (finalText) => {
      setInputQuery(finalText);
      if (voiceMode && finalText.trim()) {
        handleSend(finalText.trim());
      }
    },
  });

  const {
    status: ttsStatus,
    speakingMessageId,
    speak: ttsSpeak,
    pause: ttsPause,
    resume: ttsResume,
    stop: ttsStop,
  } = useSpeechSynthesis();

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || inputQuery).trim();
    if (!q) return;

    // Release microphone and cancel active speech
    stopListening();
    ttsStop();

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const structured = generateAssistantResponse(q, activeCase, language);
    const botMsgId = 'msg-bot-' + Date.now();

    const botMsg: ChatMessage = {
      id: botMsgId,
      sender: 'assistant',
      structured,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputQuery('');
    resetSpeech();

    // Auto-read response if enabled or in Voice Mode
    if (autoReadResponses || voiceMode) {
      setTimeout(() => {
        ttsSpeak(structured.answer, botMsgId, language, () => {
          if (voiceMode) {
            startListening();
          }
        });
      }, 300);
    }
  };

  const getSampleQuestions = (lang: string) => {
    switch (lang) {
      case 'hi':
        return [
          'क्या मेरी formulation के लिए patent protection संभव है?',
          'Rule 158B के तहत आयुष लाइसेंस की क्या आवश्यकताएं हैं?',
          'क्या राज्य जैव विविधता बोर्ड (SBB) की अनुमति आवश्यक है?',
          'यदि मैं इसे आयुर्वेद-आहार (Ayurveda Aahar) के रूप में बेचूं तो क्या नियम हैं?',
          'क्या आप पेटेंट मिलने की 100% गारंटी दे सकते हैं?',
        ];
      case 'kn':
        return [
          'ಈ ಗಿಡಮೂಲಿಕೆ ಸಂಯೋಜನೆಗೆ ಪೇಟೆಂಟ್ ಪಡೆಯಬಹುದೇ?',
          'Rule 158B ಅಡಿಯಲ್ಲಿ ಆಯುಷ್ ಲೈಸೆನ್ಸ್ ಪಡೆಯಲು ಅಗತ್ಯತೆಗಳೇನು?',
          'ರಾಜ್ಯ ಜೈವಿಕ ವೈವಿಧ್ಯ ಮಂಡಳಿ (SBB) ಅನುಮೋದನೆ ಅಗತ್ಯವಿದೆಯೇ?',
          'ಇದನ್ನು ಆಯುರ್ವೇದ ಆಹಾರ (Ayurveda Aahar) ಎಂದು ಮಾರಾಟ ಮಾಡಲು ನಿಯಮಗಳೇನು?',
          'ಪೇಟೆಂಟ್ ಸಿಗುತ್ತದೆ ಎಂದು 100% ಗ್ಯಾರಂಟಿ ನೀಡಲು ಸಾಧ್ಯವೇ?',
        ];
      case 'ta':
        return [
          'இந்த மூலிகை கலவைக்கு காப்புரிமை பெற முடியுமா?',
          'Rule 158B இன் கீழ் ஆயுஷ் உரிமத் தேவைகள் என்ன?',
          'மாநில பல்லுயிர் வாரியத்தின் (SBB) அனுமதி தேவையா?',
          'இதை ஆயுர்வேத உணவு (Ayurveda Aahar) என சந்தைப்படுத்தினால் என்ன விதிமுறைகள்?',
          'காப்புரிமை கிடைப்பதற்கு 100% உத்தரவாதம் அளிக்க முடியுமா?',
        ];
      case 'te':
        return [
          'ఈ మూలికా ఫార్ములేషన్కు పేటెంట్ పొందవచ్చా?',
          'Rule 158B కింద ఆయుష్ లైసెన్స్ నిబంధనలు ఏమిటి?',
          'రాష్ట్ర జీవ వైవిధ్య మండలి (SBB) అనుమతి అవసరమా?',
          'దీనిని ఆయుర్వేద ఆహారంగా మార్కెట్ చేయడానికి నియమాలు ఏమిటి?',
          'పేటెంట్ లభిస్తుందని 100% హామీ ఇవ్వగలరా?',
        ];
      default:
        return [
          'Can I explore patent protection for this formulation?',
          'What are my AYUSH licensing requirements under Rule 158B?',
          'Do I need State Biodiversity Board (SBB) approval?',
          'What if I market this as an Ayurveda-Aahar food product?',
          'Can you guarantee that my patent will be granted?',
        ];
    }
  };

  const sampleQuestions = getSampleQuestions(language);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '2.5rem 1.5rem 6rem' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>

        {/* Header & Case Context Selector */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('nav.home')}</Link>
            <span>/</span>
            <Link href="/cases" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('nav.cases')}</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t('assistant.breadcrumb')}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.1rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
                  {t('assistant.title')}
                </h1>
                <span
                  style={{
                    padding: '0.2rem 0.65rem',
                    background: 'rgba(46, 125, 50, 0.1)',
                    border: '1px solid rgba(46, 125, 50, 0.3)',
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    color: 'var(--color-primary-dark)',
                    fontWeight: 700,
                  }}
                >
                  {t('assistant.badge')}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: '0.4rem 0 0', lineHeight: 1.5 }}>
                {t('assistant.subtitle')}
              </p>
            </div>

            {/* Top Right Controls: Case Selector + Voice Settings Toolbar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                {/* Voice Mode Toggle */}
                <div style={{ display: 'inline-flex', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => { setVoiceMode(false); stopListening(); }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: !voiceMode ? 'var(--color-primary)' : 'transparent',
                      color: !voiceMode ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    💬 {voiceStrings.textMode}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setVoiceMode(true); setAutoReadResponses(true); }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: voiceMode ? 'var(--color-primary)' : 'transparent',
                      color: voiceMode ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    🎙️ {voiceStrings.voiceMode}
                  </button>
                </div>

                {/* Auto-read Toggle */}
                <button
                  type="button"
                  onClick={() => setAutoReadResponses(!autoReadResponses)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: autoReadResponses ? 'rgba(46, 125, 50, 0.08)' : 'var(--bg-surface)',
                    color: autoReadResponses ? 'var(--color-primary-dark)' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  title={voiceStrings.autoRead}
                  aria-pressed={autoReadResponses}
                >
                  <span>🔊</span>
                  <span>{autoReadResponses ? voiceStrings.autoReadOn : voiceStrings.autoReadOff}</span>
                </button>
              </div>

              {/* Case Selector Dropdown */}
              {cases.length > 0 && (
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.45rem 0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                    {t('assistant.activeCase')}
                  </label>
                  <select
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--color-primary-dark)',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.jurisdiction})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Context Banner */}
        {activeCase && (
          <div
            style={{
              background: 'rgba(46, 125, 50, 0.04)',
              border: '1px solid rgba(46, 125, 50, 0.2)',
              borderRadius: '8px',
              padding: '0.85rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>🌿 {t('assistant.bannerActive')} </span>
              <span style={{ color: 'var(--text-primary)' }}>
                {activeCase.title} — {activeCase.formulation.ingredients.map(i => i.name).join(', ')} ({activeCase.jurisdiction})
              </span>
            </div>
            <Link
              href={`/cases/${activeCase.id}`}
              style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}
            >
              {t('assistant.viewFullDossier')}
            </Link>
          </div>
        )}

        {/* Chat Stream Card */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '1.75rem',
            minHeight: '480px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            marginBottom: '1.5rem',
          }}
        >
          {/* Messages list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, overflowY: 'auto', marginBottom: '1.5rem' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {/* User Message */}
                {msg.sender === 'user' && (
                  <div
                    style={{
                      background: 'var(--color-primary)',
                      color: '#fff',
                      padding: '0.85rem 1.25rem',
                      borderRadius: '12px 12px 2px 12px',
                      maxWidth: '80%',
                      fontSize: '0.92rem',
                      lineHeight: 1.45,
                    }}
                  >
                    {msg.text}
                  </div>
                )}

                {/* Assistant Simple Welcome */}
                {msg.sender === 'assistant' && msg.text && (
                  <div
                    style={{
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-color)',
                      padding: '1rem 1.25rem',
                      borderRadius: '12px 12px 12px 2px',
                      maxWidth: '85%',
                      fontSize: '0.92rem',
                      lineHeight: 1.5,
                      color: 'var(--text-primary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div>{msg.text}</div>
                    <div>
                      <AudioResponsePlayer
                        messageId={msg.id}
                        answerText={msg.text}
                        language={language}
                        synthesisStatus={ttsStatus}
                        activeMessageId={speakingMessageId}
                        onSpeak={(text, id) => ttsSpeak(text, id, language)}
                        onPause={ttsPause}
                        onResume={ttsResume}
                        onStop={ttsStop}
                      />
                    </div>
                  </div>
                )}

                {/* Assistant Structured Intelligence Response */}
                {msg.sender === 'assistant' && msg.structured && (
                  <div
                    style={{
                      background: 'var(--bg-base)',
                      border: msg.structured.isAbstained ? '1.5px solid rgba(234, 88, 12, 0.35)' : '1px solid var(--border-color)',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      width: '100%',
                      maxWidth: '880px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    {/* Top: Confidence Badge & TTS Audio Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <EvidenceStrengthBadge strength={msg.structured.confidence} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {msg.structured.confidenceExplanation}
                        </span>
                      </div>
                      <AudioResponsePlayer
                        messageId={msg.id}
                        answerText={msg.structured.answer}
                        language={language}
                        synthesisStatus={ttsStatus}
                        activeMessageId={speakingMessageId}
                        onSpeak={(text, id) => ttsSpeak(text, id, language)}
                        onPause={ttsPause}
                        onResume={ttsResume}
                        onStop={ttsStop}
                      />
                    </div>

                    {/* 1. ANSWER */}
                    <div>
                      <h4 style={{ margin: '0 0 0.35rem', fontSize: '0.8rem', color: 'var(--color-primary-dark)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {t('assistant.directAnswer')}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 500 }}>
                        {msg.structured.answer}
                      </p>
                    </div>

                    {/* 2. WHY */}
                    <div style={{ background: 'var(--bg-surface)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {t('assistant.why')}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {msg.structured.why}
                      </p>
                    </div>

                    {/* 3. EVIDENCE CITATIONS */}
                    {msg.structured.evidence.length > 0 && (
                      <div>
                        <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {t('assistant.officialCitations')}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {msg.structured.evidence.map((ev, i) => (
                            <div
                              key={i}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'var(--bg-surface)',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.82rem',
                              }}
                            >
                              <span>📖 {ev.sourceTitle} — {ev.authority}</span>
                              <button
                                onClick={() => setSelectedCitation(ev)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--color-primary-dark)',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  fontSize: '0.78rem',
                                }}
                              >
                                {t('assistant.viewEvidence')} ↗
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. WHAT IS MISSING */}
                    {msg.structured.whatIsMissing.length > 0 && (
                      <div style={{ background: 'rgba(234, 88, 12, 0.06)', border: '1px solid rgba(234, 88, 12, 0.2)', padding: '0.75rem 1rem', borderRadius: '6px' }}>
                        <h4 style={{ margin: '0 0 0.3rem', fontSize: '0.75rem', color: '#c2410c', textTransform: 'uppercase' }}>
                          {t('assistant.evidenceGaps')}
                        </h4>
                        <ul style={{ margin: 0, paddingInlineStart: '1.2rem', fontSize: '0.82rem', color: '#c2410c', lineHeight: 1.45 }}>
                          {msg.structured.whatIsMissing.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 5. WHAT THIS MEANS */}
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {t('assistant.practicalMeaning')}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                        {msg.structured.whatThisMeans}
                      </p>
                    </div>

                    {/* 6. NEXT ACTION */}
                    <div style={{ background: 'rgba(46, 125, 50, 0.06)', border: '1px solid rgba(46, 125, 50, 0.25)', padding: '0.85rem 1rem', borderRadius: '8px' }}>
                      <h4 style={{ margin: '0 0 0.35rem', fontSize: '0.75rem', color: 'var(--color-primary-dark)', textTransform: 'uppercase' }}>
                        {t('assistant.nextActions')}
                      </h4>
                      <ul style={{ margin: 0, paddingInlineStart: '1.2rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {msg.structured.nextAction.map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>

                  </div>
                )}

                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  {msg.timestamp}
                </span>
              </div>
            ))}
          </div>

          {/* Suggested Sample Questions */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
              {t('assistant.suggestedInquiries')}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {sampleQuestions.map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(sq)}
                  style={{
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '0.3rem 0.75rem',
                    fontSize: '0.78rem',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'start',
                  }}
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
          >
            <input
              type="text"
              placeholder={speechStatus === 'LISTENING' ? voiceStrings.listening : t('assistant.placeholder')}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: speechStatus === 'LISTENING' ? '1.5px solid #dc2626' : '1.5px solid var(--border-color)',
                background: 'var(--bg-base)',
                fontSize: '0.92rem',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <VoiceInputButton
              status={speechStatus}
              language={language}
              isSupported={isSpeechSupported}
              onStart={startListening}
              onStop={stopListening}
              errorMessage={speechError}
              interimTranscript={interimTranscript}
              onDismissError={resetSpeech}
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              style={{
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 1.6rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: inputQuery.trim() ? 'pointer' : 'not-allowed',
                opacity: inputQuery.trim() ? 1 : 0.7,
              }}
            >
              {t('assistant.send')} 🚀
            </button>
          </form>

          {/* Transcript review hint if speech was recorded */}
          {inputQuery && speechStatus === 'IDLE' && (
            <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>✍️ {voiceStrings.reviewTranscript}</span>
            </div>
          )}

        </div>

        {/* Institutional Safeguard Note */}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
          🛡️ {t('assistant.disclaimerFooter')}
        </div>

      </div>

      <EvidenceDrawer
        isOpen={Boolean(selectedCitation)}
        onClose={() => setSelectedCitation(null)}
        citation={selectedCitation}
      />
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>}>
      <AssistantContent />
    </Suspense>
  );
}
