'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCasesStore } from '@/store/cases';
import { useLanguageStore } from '@/store/language';
import { getLanguageMeta } from '@/i18n/languages';
import { generateAssistantResponse } from '@/lib/intelligence/assistant';
import { assistantApi } from '@/lib/api/assistant';
import { StructuredAssistantResponse, Citation } from '@/lib/intelligence/types';
import EvidenceDrawer from '@/components/intelligence/EvidenceDrawer';
import EvidenceStrengthBadge from '@/components/intelligence/EvidenceStrengthBadge';
import { useSpeechRecognition } from '@/lib/voice/useSpeechRecognition';
import { useSpeechSynthesis } from '@/lib/voice/useSpeechSynthesis';
import AudioResponsePlayer from '@/components/voice/AudioResponsePlayer';
import { getVoiceStrings, getVoiceLocaleMeta } from '@/lib/voice/locales';
import { defaultBhashiniClient } from '@/lib/voice/bhashiniProvider';
import { unifiedVoiceProvider, UnifiedVoiceState } from '@/lib/voice/unifiedVoiceProvider';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text?: string;
  structured?: StructuredAssistantResponse;
  timestamp: string;
}

// ─── Welcome Messages Map across Indian Languages ─────────────────────────────
const WELCOME_MESSAGES_MAP: Record<string, string> = {
  kn: 'ನಮಸ್ಕಾರ! ನಾನು BHASHINI — IP-SAKTI ಯ ಬಹುಭಾಷಾ ಐಪಿ ಮತ್ತು ನಿಯಂತ್ರಕ ನಿರ್ಧಾರ ಸಹಾಯಕ. ನಿಮ್ಮ ಸೂತ್ರೀಕರಣ, ಭಾರತೀಯ ಪೇಟೆಂಟ್ ಕಾಯಿದೆ 1970, ಔಷಧ ಮತ್ತು ಸೌಂದರ್ಯವರ್ಧಕ ನಿಯಮಗಳು 1945 ಮತ್ತು ಜೈವಿಕ ವೈವಿಧ್ಯ ಕಾಯಿದೆ 2002 ರ ಅಧಿಕೃತ ಶಾಸನಬದ್ಧ ನಿಬಂಧನೆಗಳ ಆಧಾರದ ಮೇಲೆ ನಾನು ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತೇನೆ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
  hi: 'नमस्ते! मैं BHASHINI हूँ — IP-SAKTI का बहुभाषी बौद्धिक संपदा एवं विनियामक निर्णय सहायक। मैं आपके फॉर्मूलेशन, भारतीय पेटेंट अधिनियम 1970, औषधि एवं प्रसाधन नियमावली 1945 और जैव विविधता अधिनियम 2002 के अधिकृत प्रावधानों पर आधारित हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?',
  ta: 'வணக்கம்! நான் BHASHINI — IP-SAKTI இன் பன்மொழி அறிவுசார் சொத்துரிமை மற்றும் ஒழுங்குமுறை முடிவெடுக்கும் உதவியாளர். இந்திய காப்புரிமைச் சட்டம் 1970, மருந்துகள் விதிகள் 1945 மற்றும் பல்லுயிர் சட்டம் 2002 ஆகியவற்றின் அடிப்படையில் நான் வழிகாட்டுகிறேன். இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
  te: 'నమస్కారం! నేను BHASHINI — IP-SAKTI యొక్క బహుభాషా ఐపీ మరియు నియంత్రణ నిర్ణయ సహాయకుడిని. భారత పేటెంట్ చట్టం 1970, డ్రగ్స్ & కాస్మెటిక్స్ నియమాలు 1945 మరియు జీవ వైవిధ్య చట్టం 2002 ఆధారంగా నేను మార్గదర్శనం చేస్తాను. ఈరోజు నేను మీకు ఎలా సహాయపడగలను?',
  ml: 'നമസ്കാരം! ഞാൻ BHASHINI — IP-SAKTI യുടെ ബഹുഭാഷാ ഐപി, റെഗുലേറ്ററി അസിസ്റ്റന്റ്. ഇന്ത്യൻ പേറ്റന്റ് ആക്റ്റ് 1970, ഡ്രഗ്സ് റൂൾസ് 1945, ബയോഡൈവേഴ്സിറ്റി ആക്റ്റ് 2002 എന്നിവയുടെ അടിസ്ഥാനത്തിലാണ് ഞാൻ പ്രവർത്തിക്കുന്നത്. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?',
  mr: 'नमस्कार! मी BHASHINI — IP-SAKTI ची बहुभाषिक आयपी आणि नियामक सहाय्यक आहे. मी भारतीय पेटंट कायदा 1970, औषध नियमावली 1945 आणि जैवविविधता कायदा 2002 च्या अधिकृत तरतुदींवर आधारित मार्गदर्शन करते. आज मी आपली काय मदत करू शकते?',
  bn: 'নমস্কার! আমি BHASHINI — IP-SAKTI এর বহুভাষিক আইপি ও রেগুলেটরি সহকারী। ভারতীয় পেটেন্ট আইন ১৯৭০, ওষুধ বিধি ১৯৪৫ এবং জীববৈচিত্র্য আইন ২০০২ এর বিধিবদ্ধ প্রমাণের ভিত্তিতে আমি উত্তর প্রদান করি। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
  gu: 'નમસ્તે! હું BHASHINI છું — IP-SAKTI નો બહુભાષીય આઈપી અને નિયમનકારી સહાયક. હું ભારતીય પેટન્ટ અધિનિયમ 1970, ઔષધ નિયમો 1945 અને જૈવ વિવિધતા અધિનિયમ 2002 ના આધારે માર્ગદર્શન આપું છું. આજે હું તમને કેવી રીતે સહાય કરી શકું?',
  pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ BHASHINI ਹਾਂ — IP-SAKTI ਦਾ ਬਹੁਭਾਸ਼ਾਈ ਆਈਪੀ ਅਤੇ ਰੈਗੂਲੇਟਰੀ ਸਹਾਇਕ। ਮੈਂ ਭਾਰਤੀ ਪੇਟੈਂਟ ਐਕਟ 1970, ਡਰੱਗਜ਼ ਰੂਲਜ਼ 1945 ਅਤੇ ਜੈਵਿਕ ਵਿਭਿੰਨਤਾ ਐਕਟ 2002 ਦੇ ਆਧਾਰ ਤੇ ਮਾਰਗਦਰਸ਼ਨ ਕਰਦਾ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
  or: 'ନମସ୍କାର! ମୁଁ BHASHINI — IP-SAKTI ର ବହୁଭାଷୀ ଆଇପି ଏବଂ ନିୟାମକ ସହାୟକ। ମୁଁ ଭାରତୀୟ ପେଟେଣ୍ଟ ଆଇନ ୧୯୭୦, ଡ୍ରଗ୍ସ ନିୟମାବଳୀ ୧୯୪୫ ଏବଂ ଜୈବ ବିବିଧତା ଆଇନ ୨୦୦୨ ଆଧାରରେ ମାର୍ଗଦର୍ଶନ ପ୍ରଦାନ କରେ। ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?',
  ur: 'آداب! میں بھاشنی (BHASHINI) ہوں — IP-SAKTI کا کثیر لسانی آئی پی اور ریگولیٹری معاون۔ میں بھارتی پیٹنٹ ایکٹ 1970، ڈرگز رولز 1945 اور حیاتیاتی تنوع ایکٹ 2002 کے مستند شواہد پر مبنی رہنمائی فراہم کرتا ہوں۔ آج میں آپ کی کیا مدد کر سکتا ہوں؟',
  sa: 'नमस्ते! अहं BHASHINI — IP-SAKTI इत्यस्य बहुभाषीय-बौद्धिक-सम्पत्ति-नियामक-सहायकः अस्मि। भारतीय-पेटेण्ट्-अधिनियमः १९७०, औषधि-नियमावली १९४५, जैव-विविधता-अधिनियमः २००२ इत्येतेषां प्रामाणिक-साक्ष्याणाम् आधारेण मार्गदर्शनं करोमि। अद्य भवतां का सहायता करणीया?',
  en: 'Namaste! I am BHASHINI — IP-SAKTI’s Multilingual IP & Regulatory Assistant. I am grounded in your case context, The Patents Act 1970, Drugs & Cosmetics Rules 1945, and Biological Diversity Act 2002. How can I assist your formulation decision strategy today?',
};

// ─── Quick Prompts Map across Indian Languages ────────────────────────────────
const QUICK_PROMPTS_MAP: Record<string, string[]> = {
  kn: [
    'ನನ್ನ ಉತ್ಪನ್ನವನ್ನು ವಿಶ್ಲೇಷಿಸಿ',
    'ಈ ಫಾರ್ಮುಲೇಶನ್ಗೆ ಪೇಟೆಂಟ್ ಸಾಧ್ಯವೇ?',
    'ABS ಅನುಸರಣೆ ಅಗತ್ಯವಿದೆಯೇ?',
    'ಈ ಉತ್ಪನ್ನದ ನಿಯಂತ್ರಣ ವರ್ಗ ಯಾವುದು?',
    'ಸಂಬಂಧಿತ ಕಾನೂನು ಮೂಲಗಳನ್ನು ತೋರಿಸಿ',
  ],
  hi: [
    'मेरे उत्पाद का विश्लेषण करें',
    'क्या इस फॉर्मूलेशन पर पेटेंट मिल सकता है?',
    'क्या ABS अनुपालन आवश्यक है?',
    'इस उत्पाद की नियामक श्रेणी क्या है?',
    'संबंधित विधिक स्रोत दिखाएं',
  ],
  ta: [
    'எனது தயாரிப்பை பகுப்பாய்வு செய்க',
    'இந்த கலவைக்கு காப்புரிமை பெற முடியுமா?',
    'ABS இணக்கம் தேவையா?',
    'இந்த பொருளின் ஒழுங்குமுறை வகை என்ன?',
    'தொடர்புடைய சட்ட ஆதாரங்களைக் காட்டுங்கள்',
  ],
  te: [
    'నా ఉత్పత్తిని విశ్లేషించండి',
    'ఈ ఫార్ములేషన్‌కు పేటెంట్ లభిస్తుందా?',
    'ABS అనుమతి అవసరమా?',
    'ఈ ఉత్పత్తి యొక్క నియంత్రణ వర్గం ఏమిటి?',
    'సంబంధిత చట్టపరమైన ఆధారాలను చూపండి',
  ],
  ml: [
    'എന്റെ ഉൽപ്പന്നം വിശകലനം ചെയ്യുക',
    'ഈ ഫോർമുലേഷന് പേറ്റന്റ് സാധ്യമാണോ?',
    'ABS അനുമതി ആവശ്യമാണോ?',
    'ഈ ഉൽപ്പന്നത്തിന്റെ നിയന്ത്രണ വിഭാഗം ഏതാണ്?',
    'പ്രസക്തമായ നിയമ സ്രോതസ്സുകൾ കാണിക്കുക',
  ],
  mr: [
    'माझ्या उत्पादनाचे विश्लेषण करा',
    'या फॉर्म्युलेशनला पेटंट मिळू शकते का?',
    'ABS अनुपालन आवश्यक आहे का?',
    'या उत्पादनाची नियामक श्रेणी कोणती आहे?',
    'संबंधित कायदेशीर स्रोत दाखवा',
  ],
  bn: [
    'আমার পণ্য বিশ্লেষণ করুন',
    'এই ফর্মুলেশনে পেটেন্ট পাওয়া সম্ভব?',
    'ABS অনুমোদন কি প্রয়োজনীয়?',
    'এই পণ্যের নিয়ন্ত্রণ বিভাগ কোনটি?',
    'প্রাসঙ্গিক আইনি উৎস দেখান',
  ],
  gu: [
    'મારા ઉત્પાદનનું વિશ્લેષણ કરો',
    'શું આ ફોર્મ્યુલેશન પર પેટન્ટ શક્ય છે?',
    'શું ABS પાલન જરૂરી છે?',
    'આ ઉત્પાદનની નિયમનકારી શ્રેણી કઈ છે?',
    'સંબંધિત કાનૂની સ્ત્રોતો બતાવો',
  ],
  pa: [
    'ਮੇਰੇ ਉਤਪਾਦ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ',
    'ਕੀ ਇਸ ਫਾਰਮੂਲੇਸ਼ਨ ਨੂੰ ਪੇਟੈਂਟ ਮਿਲ ਸਕਦਾ ਹੈ?',
    'ਕੀ ABS ਮਨਜ਼ੂਰੀ ਲੋੜੀਂਦੀ ਹੈ?',
    'ਇਸ ਉਤਪਾਦ ਦੀ ਰੈਗੂਲੇਟਰੀ ਸ਼੍ਰੇਣੀ ਕਿਹੜੀ ਹੈ?',
    'ਸੰਬੰਧਿਤ ਕਾਨੂੰਨੀ ਸਰੋਤ ਦਿਖਾਓ',
  ],
  or: [
    'ମୋ ଉତ୍ପାଦ ବିଶ୍ଳେଷଣ କରନ୍ତୁ',
    'ଏହି ଫର୍ମୁଲେସନ ପାଇଁ ପେଟେଣ୍ଟ ସମ୍ଭବ କି?',
    'ABS ଅନୁପାଳନ ଆବଶ୍ୟକ କି?',
    'ଏହି ଉତ୍ପାଦର ନିୟାମକ ବର୍ଗ କ\'ଣ?',
    'ପ୍ରାସଙ୍ଗିକ ଆଇନଗତ ଉତ୍ସ ଦେଖାନ୍ତୁ',
  ],
  ur: [
    'میری مصنوعات کا تجزیہ کریں',
    'کیا اس فارمولیشن کو پیٹنٹ مل سکتا ہے؟',
    'کیا ABS کی تعمیل لازمی ہے؟',
    'اس پروڈکٹ کا ریگولیٹری زمرہ کیا ہے؟',
    'متعلقہ قانونی ذرائع دکھائیں',
  ],
  sa: [
    'मम उत्पादस्य विश्लेषणं कुरुत',
    'किम् अस्य योगस्य पेटेण्ट्-अधिकारः सम्भवति?',
    'किम् ABS-अनुपालनम् आवश्यकम्?',
    'अस्य उत्पादस्य नियामक-वर्गः कः?',
    'प्रासङ्गिक-वैधानिक-स्रोतांसि दर्शयत',
  ],
  en: [
    'Analyze my product formulation',
    'Can this formulation be patented under Section 3(p)?',
    'Do I need State Biodiversity Board (SBB) approval?',
    'What are the Rule 158B AYUSH licensing requirements?',
    'What if I market this as an Ayurveda-Aahar food product?',
  ],
};

function AssistantContent() {
  const searchParams = useSearchParams();
  const contextParam = searchParams?.get('context') || '';

  const { cases } = useCasesStore();
  const { language, isRtl, t } = useLanguageStore();
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [inputQuery, setInputQuery] = useState('');
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [voiceMode, setVoiceMode] = useState<boolean>(false);
  const [autoReadResponses, setAutoReadResponses] = useState<boolean>(false);
  const [expandedWhy, setExpandedWhy] = useState<Record<string, boolean>>({});
  const [voiceDraft, setVoiceDraft] = useState<string | null>(null);
  const [geminiStatus, setGeminiStatus] = useState<{ status: string; model?: string; provider?: string }>({
    status: 'CHECKING',
  });
  const [voiceProviderState, setVoiceProviderState] = useState<UnifiedVoiceState | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const effectiveLang = mounted ? language : 'en';
  const currentMeta = getLanguageMeta(effectiveLang);
  const voiceStrings = getVoiceStrings(effectiveLang);
  const voiceLocaleMeta = getVoiceLocaleMeta(effectiveLang);
  const bhashiniStatus = defaultBhashiniClient.getStatus();

  // Sync Gemini LLM and Unified Voice Provider status
  useEffect(() => {
    let isMounted = true;
    assistantApi.getStatus().then((res) => {
      if (isMounted) {
        setGeminiStatus({
          status: res.gemini?.status || 'GEMINI_NOT_CONFIGURED',
          model: res.gemini?.model,
          provider: res.gemini?.provider_name,
        });
      }
    }).catch(() => {
      if (isMounted) setGeminiStatus({ status: 'GEMINI_NOT_CONFIGURED' });
    });

    unifiedVoiceProvider.syncWithBackend(language).then((vState) => {
      if (isMounted) {
        setVoiceProviderState(vState);
      }
    }).catch(() => {
      // browser fallback
    });

    return () => { isMounted = false; };
  }, [language]);

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
    return WELCOME_MESSAGES_MAP[lang] || WELCOME_MESSAGES_MAP.en;
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: getWelcomeMessage('en'),
      timestamp: 'Just now',
    },
  ]);

  // Update welcome message when language changes if only welcome is present
  useEffect(() => {
    if (mounted) {
      setMessages((prev) => {
        if (prev.length === 1 && prev[0].id === 'welcome') {
          return [{ ...prev[0], text: getWelcomeMessage(language) }];
        }
        return prev;
      });
    }
  }, [mounted, language]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, voiceDraft]);

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
      setVoiceDraft(text);
    },
    onFinalTranscript: (finalText) => {
      setVoiceDraft(finalText);
      if (voiceMode && finalText.trim()) {
        handleSend(finalText.trim());
        setVoiceDraft(null);
      }
    },
  });

  const {
    status: ttsStatus,
    speakingMessageId,
    currentVoiceInfo,
    speak: ttsSpeak,
    pause: ttsPause,
    resume: ttsResume,
    stop: ttsStop,
  } = useSpeechSynthesis();

  const [isQuerying, setIsQuerying] = useState<boolean>(false);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || inputQuery).trim();
    if (!q || isQuerying) return;

    // Release microphone and cancel active speech
    stopListening();
    ttsStop();
    setVoiceDraft(null);

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    resetSpeech();
    setIsQuerying(true);

    try {
      const backendRes = await assistantApi.query({
        query: q,
        language: language,
        case_context: activeCase
          ? {
              case_id: activeCase.id,
              title: activeCase.title,
              ingredients: activeCase.formulation?.ingredients || [],
              jurisdiction: activeCase.jurisdiction || 'India',
            }
          : undefined,
      });

      const strengthMap: Record<string, 'HIGH_EVIDENCE' | 'MODERATE_EVIDENCE' | 'LIMITED_EVIDENCE' | 'INSUFFICIENT_EVIDENCE'> = {
        High: 'HIGH_EVIDENCE',
        Moderate: 'MODERATE_EVIDENCE',
        Low: 'LIMITED_EVIDENCE',
        Insufficient: 'INSUFFICIENT_EVIDENCE',
      };

      const structured: StructuredAssistantResponse = {
        answer: backendRes.answer,
        why: backendRes.why,
        evidence: (backendRes.citations || []).map((c) => ({
          sourceId: c.id,
          sourceTitle: c.short_title,
          authority: c.authority,
          hierarchy: { act: c.short_title, section: c.section },
          version: 'Official Gazette',
          status: 'ACTIVE',
          relevanceExplanation: c.canonical_status || 'Authoritative Gazette Text (Canonical)',
          supportingExcerpt: c.excerpt,
          canonicalUrl: c.source_url,
        })),
        whatIsMissing: backendRes.missing_information || [],
        whatThisMeans: backendRes.practical_meaning || '',
        nextAction: backendRes.next_actions || [],
        confidence: strengthMap[backendRes.evidence_strength] || 'MODERATE_EVIDENCE',
        confidenceExplanation: backendRes.why,
        isAbstained: backendRes.abstained,
      };

      const botMsgId = 'msg-bot-' + Date.now();
      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'assistant',
        structured,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);

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
    } catch (err) {
      console.warn('Backend query error, using local fallback:', err);
      const structured = generateAssistantResponse(q, activeCase, language);
      const botMsgId = 'msg-bot-' + Date.now();
      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: 'assistant',
        structured,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsQuerying(false);
    }
  };

  const getQuickPrompts = (lang: string) => {
    return QUICK_PROMPTS_MAP[lang] || QUICK_PROMPTS_MAP.hi || QUICK_PROMPTS_MAP.en;
  };

  const quickPrompts = getQuickPrompts(language);

  const toggleWhy = (msgId: string) => {
    setExpandedWhy((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        padding: '2rem 1rem 6rem',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* ─── Breadcrumbs & Context ────────────────────────────────────────── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{mounted ? (t('nav.home') || 'Home') : 'Home'}</Link>
            <span>/</span>
            <Link href="/cases" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{mounted ? (t('nav.cases') || 'My Cases') : 'My Cases'}</Link>
            <span>/</span>
            <span style={{ color: 'var(--green-900)', fontWeight: 600 }}>BHASHINI</span>
          </div>

          {/* ─── Assistant Header Banner ─────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem', color: 'var(--green-900)', margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>
                  IP-SAKTI Sahayak
                </h1>
                <span
                  style={{
                    padding: '4px 12px',
                    background: 'rgba(46, 125, 50, 0.12)',
                    border: '1px solid rgba(46, 125, 50, 0.3)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    color: 'var(--green-800)',
                    fontWeight: 700,
                  }}
                >
                  🎙️ Voice Assistant: BHASHINI
                </span>
                <span
                  style={{
                    padding: '4px 10px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  🇮🇳 {currentMeta.nativeName} ({currentMeta.name})
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', margin: '0.4rem 0 0', lineHeight: 1.5 }}>
                AI-powered IP & Regulatory Assistant — Grounded in The Patents Act 1970, Drugs & Cosmetics Rules 1945, and Biological Diversity Act 2002.
              </p>
            </div>

            {/* Top Right Controls: Case Selector + Voice Settings Toolbar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: isRtl ? 'flex-start' : 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* Voice Mode Toggle */}
                <div style={{ display: 'inline-flex', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => { setVoiceMode(false); stopListening(); }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: !voiceMode ? 'var(--green-800)' : 'transparent',
                      color: !voiceMode ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.75rem',
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
                      background: voiceMode ? 'var(--green-800)' : 'transparent',
                      color: voiceMode ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.75rem',
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
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    background: autoReadResponses ? 'rgba(46, 125, 50, 0.08)' : 'var(--bg-surface)',
                    color: autoReadResponses ? 'var(--green-800)' : 'var(--text-muted)',
                    fontSize: '0.75rem',
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
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '0.35rem 0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.1rem' }}>
                    Active Case Context:
                  </label>
                  <select
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--green-900)',
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

          {/* Unified AI Engine & Voice Provider Status Badges */}
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Gemini / LLM Layer Status */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: geminiStatus.status === 'GEMINI_READY' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(46, 125, 50, 0.08)',
                border: `1px solid ${geminiStatus.status === 'GEMINI_READY' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(46, 125, 50, 0.25)'}`,
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--green-900)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: geminiStatus.status === 'GEMINI_READY' ? '#16a34a' : '#059669',
                }}
              />
              {geminiStatus.status === 'GEMINI_READY'
                ? `✨ Gemini 2.5 Flash Grounded Layer (${geminiStatus.model || 'Active'})`
                : '🏛️ IP-SAKTI Authoritative Statutory RAG Engine (Deterministic Grounded Mode)'}
            </span>

            {/* Voice Provider Status */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: voiceProviderState?.selectionState === 'GEMINI_READY' || voiceProviderState?.selectionState === 'BHASHINI_READY'
                  ? 'rgba(34, 197, 94, 0.12)'
                  : 'rgba(217, 119, 6, 0.08)',
                border: `1px solid ${voiceProviderState?.selectionState === 'GEMINI_READY' || voiceProviderState?.selectionState === 'BHASHINI_READY'
                  ? 'rgba(34, 197, 94, 0.3)'
                  : 'rgba(217, 119, 6, 0.25)'}`,
                fontSize: '0.72rem',
                fontWeight: 600,
                color: voiceProviderState?.selectionState === 'GEMINI_READY' || voiceProviderState?.selectionState === 'BHASHINI_READY'
                  ? 'var(--green-800)'
                  : 'var(--gold-800)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: voiceProviderState?.selectionState === 'GEMINI_READY' || voiceProviderState?.selectionState === 'BHASHINI_READY'
                    ? '#16a34a'
                    : '#d97706',
                }}
              />
              {voiceProviderState?.selectionState === 'GEMINI_READY'
                ? '🎙️ BHASHINI: Gemini Live Audio'
                : voiceProviderState?.selectionState === 'BHASHINI_READY'
                ? '🎙️ BHASHINI: NLTM ULCA Neural API'
                : '🎙️ BHASHINI: Native Browser Speech Engine (23 Languages)'}
            </span>

            {ttsStatus === 'SPEAKING' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(46, 125, 50, 0.12)',
                  border: '1px solid rgba(46, 125, 50, 0.3)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--green-800)',
                }}
              >
                <span>🔊</span>
                <span>
                  Speaking in {currentMeta.nativeName} ({currentVoiceInfo?.isFemale ? 'BHASHINI Female Voice' : 'Browser Voice'})
                </span>
              </span>
            )}
          </div>
        </div>

        {/* ─── Active Case Context Banner ──────────────────────────────────── */}
        {activeCase && (
          <div
            style={{
              background: 'rgba(46, 125, 50, 0.05)',
              border: '1px solid rgba(46, 125, 50, 0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.75rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <span style={{ fontWeight: 700, color: 'var(--green-800)' }}>🌿 Active Formulation: </span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                {activeCase.title} — {activeCase.formulation.ingredients.map(i => i.name).join(', ')} ({activeCase.jurisdiction})
              </span>
            </div>
            <Link
              href={`/cases/${activeCase.id}`}
              style={{ color: 'var(--green-700)', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}
            >
              View Full Dossier ↗
            </Link>
          </div>
        )}

        {/* ─── Main Chat Conversation Card ─────────────────────────────────── */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-2xl)',
            padding: '1.5rem',
            minHeight: '520px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '1.5rem',
          }}
        >
          {/* Messages Stream */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', flex: 1, overflowY: 'auto', marginBottom: '1.5rem' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? (isRtl ? 'flex-start' : 'flex-end') : (isRtl ? 'flex-end' : 'flex-start'),
                  width: '100%',
                }}
              >
                {/* ─── USER MESSAGE ─── */}
                {msg.sender === 'user' && (
                  <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', alignItems: isRtl ? 'flex-start' : 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        You
                      </span>
                      <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--green-700)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700 }}>
                        👤
                      </span>
                    </div>
                    <div
                      style={{
                        background: '#1b4332', // Deep botanical green
                        color: '#ffffff',
                        padding: '0.85rem 1.25rem',
                        borderRadius: isRtl ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                        fontSize: '0.9375rem',
                        lineHeight: 1.5,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.text}
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {msg.timestamp}
                    </span>
                  </div>
                )}

                {/* ─── ASSISTANT WELCOME MESSAGE ─── */}
                {msg.sender === 'assistant' && msg.text && (
                  <div style={{ maxWidth: '90%', display: 'flex', flexDirection: 'column', alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green-800)' }}>
                        🌿 BHASHINI
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        AI Assistant
                      </span>
                    </div>
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid var(--border-default)',
                        padding: '1.25rem',
                        borderRadius: isRtl ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        fontSize: '0.9375rem',
                        lineHeight: 1.6,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
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
                          isFemaleVoice={currentVoiceInfo?.isFemale}
                          onSpeak={(text, id) => ttsSpeak(text, id, language)}
                          onPause={ttsPause}
                          onResume={ttsResume}
                          onStop={ttsStop}
                        />
                      </div>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {msg.timestamp}
                    </span>
                  </div>
                )}

                {/* ─── BHASHINI STRUCTURED INTELLIGENCE RESPONSE CARD ─── */}
                {msg.sender === 'assistant' && msg.structured && (
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '920px',
                      background: '#ffffff',
                      border: msg.structured.isAbstained ? '2px solid rgba(217, 119, 6, 0.4)' : '1.5px solid var(--border-default)',
                      padding: '1.5rem',
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem',
                      boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Header Banner: BHASHINI + Confidence + Audio Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--border-default)', paddingBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--green-900)' }}>
                          🌿 BHASHINI
                        </span>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          IP-SAKTI Statutory Answer
                        </span>
                        <EvidenceStrengthBadge strength={msg.structured.confidence} />
                      </div>
                      <div>
                        <AudioResponsePlayer
                          messageId={msg.id}
                          answerText={msg.structured.answer}
                          language={language}
                          synthesisStatus={ttsStatus}
                          activeMessageId={speakingMessageId}
                          isFemaleVoice={currentVoiceInfo?.isFemale}
                          onSpeak={(text, id) => ttsSpeak(text, id, language)}
                          onPause={ttsPause}
                          onResume={ttsResume}
                          onStop={ttsStop}
                        />
                      </div>
                    </div>

                    {/* 1. DIRECT ANSWER (Primary Focal Point) */}
                    <div>
                      <div style={{ marginBottom: '0.4rem' }}>
                        <span
                          style={{
                            background: msg.structured.isAbstained ? '#fffbeb' : '#ecfdf5',
                            color: msg.structured.isAbstained ? '#b45309' : '#065f46',
                            border: `1px solid ${msg.structured.isAbstained ? '#fde68a' : '#a7f3d0'}`,
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {msg.structured.isAbstained ? '⚠️ BHASHINI NEEDS MORE EVIDENCE' : '🧠 ANSWER'}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '1.025rem',
                          color: 'var(--text-primary)',
                          lineHeight: 1.6,
                          fontWeight: 500,
                        }}
                      >
                        {msg.structured.answer}
                      </p>
                    </div>

                    {/* 2. WHY THIS APPLIES (Progressive Disclosure) */}
                    {msg.structured.why && (
                      <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            💡 Why This Applies
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          {msg.structured.why}
                        </p>
                      </div>
                    )}

                    {/* 3. EVIDENCE & CITATIONS (1-3 Key Items) */}
                    {msg.structured.evidence.length > 0 && (
                      <div>
                        <div style={{ marginBottom: '0.4rem' }}>
                          <span
                            style={{
                              background: 'rgba(217, 119, 6, 0.08)',
                              color: 'var(--gold-800)',
                              border: '1px solid rgba(217, 119, 6, 0.25)',
                              borderRadius: '6px',
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase',
                            }}
                          >
                            📚 Statutory Evidence Supporting This Answer
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {msg.structured.evidence.slice(0, 3).map((ev, i) => (
                            <div
                              key={i}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: '#ffffff',
                                padding: '0.55rem 0.85rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-default)',
                                fontSize: '0.82rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>📖</span>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {ev.sourceTitle}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  ({ev.authority})
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedCitation(ev)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--green-700)',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  fontSize: '0.78rem',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                View Source ↗
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. IMPORTANT LIMITATIONS / EVIDENCE GAPS */}
                    {msg.structured.whatIsMissing.length > 0 && (
                      <div style={{ background: 'rgba(234, 88, 12, 0.05)', border: '1px solid rgba(234, 88, 12, 0.2)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '0.3rem' }}>
                          <span
                            style={{
                              background: '#fff7ed',
                              color: '#c2410c',
                              border: '1px solid #ffedd5',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            ⚠️ Important Limitations & Missing Evidence
                          </span>
                        </div>
                        <ul style={{ margin: 0, paddingInlineStart: '1.2rem', fontSize: '0.82rem', color: '#c2410c', lineHeight: 1.5 }}>
                          {msg.structured.whatIsMissing.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 5. RECOMMENDED NEXT ACTIONS */}
                    {msg.structured.nextAction.length > 0 && (
                      <div style={{ background: 'rgba(46, 125, 50, 0.05)', border: '1px solid rgba(46, 125, 50, 0.25)', padding: '0.85rem 1rem', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '0.35rem' }}>
                          <span
                            style={{
                              background: '#ecfdf5',
                              color: 'var(--green-800)',
                              border: '1px solid #a7f3d0',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            ➜ Recommended Next Actions
                          </span>
                        </div>
                        <ul style={{ margin: 0, paddingInlineStart: '1.2rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          {msg.structured.nextAction.map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Bottom Metadata & Timestamp */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6875rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)', paddingTop: '0.5rem' }}>
                      <span>
                        🛡️ Decision support guidance. Canonical citations govern legal interpretations.
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                  </div>
                )}
              </div>
            ))}
            {isQuerying && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isRtl ? 'flex-end' : 'flex-start',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green-800)' }}>
                    🌿 BHASHINI
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    Generating answer...
                  </span>
                </div>
                <div
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid var(--border-default)',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ display: 'inline-block' }}>⚙️</span>
                  Analyzing statutory corpus & synthesizing decision-support response...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ─── Empty State Quick Prompts ───────────────────────────────────── */}
          {messages.length === 1 && (
            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                💡 Quick Inquiries in {currentMeta.nativeName}:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {quickPrompts.map((promptText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(promptText)}
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.8125rem',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'start',
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--green-600)';
                      e.currentTarget.style.background = 'var(--bg-surface)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                      e.currentTarget.style.background = 'var(--bg-subtle)';
                    }}
                  >
                    • {promptText}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message for Voice Recognition */}
          {speechError && (
            <div
              style={{
                background: '#fff1f2',
                border: '1.5px solid #fecdd3',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                color: '#be123c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem' }}>⚠️</span>
                <span style={{ fontWeight: 500 }}>{speechError}</span>
              </div>
              <button
                type="button"
                onClick={() => resetSpeech()}
                aria-label="Dismiss error"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#be123c',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  padding: '2px 6px',
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* ─── Requirement 13: BHASHINI Voice Listening Card ──────────────── */}
          {speechStatus === 'LISTENING' && (
            <div
              style={{
                background: '#ffffff',
                border: '2px solid rgba(220, 38, 38, 0.35)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'center',
                boxShadow: '0 6px 20px rgba(220, 38, 38, 0.08)',
                animation: 'fadeIn 150ms ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem' }}>🎙️</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--green-900)' }}>
                  BHASHINI
                </span>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {voiceStrings.listening} ({currentMeta.nativeName})
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(220, 38, 38, 0.1)',
                  color: '#dc2626',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626', animation: 'pulse 1s infinite' }} />
                {voiceStrings.listening}
              </div>
              <div
                style={{
                  fontSize: '1.05rem',
                  color: interimTranscript ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontStyle: interimTranscript ? 'normal' : 'italic',
                  minHeight: '2rem',
                  padding: '0 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                &ldquo;{interimTranscript || voiceStrings.speakQuestion || 'Speak your question...'}&rdquo;
              </div>
              <button
                type="button"
                onClick={stopListening}
                aria-label="Stop speech recognition"
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 22px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
                  transition: 'all 150ms ease',
                }}
              >
                ⏹ {voiceStrings.stop || 'Stop'}
              </button>
            </div>
          )}

          {/* ─── Requirement 13: BHASHINI Transcript Review Card ────────────── */}
          {speechStatus !== 'LISTENING' && voiceDraft && (
            <div
              style={{
                background: '#ffffff',
                border: '2px solid rgba(46, 125, 50, 0.35)',
                borderRadius: '16px',
                padding: '1.35rem',
                marginBottom: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 6px 20px rgba(46, 125, 50, 0.08)',
                animation: 'fadeIn 150ms ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--green-900)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {voiceStrings.reviewTranscript || 'You said'}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Locale: {voiceLocaleMeta.speechLocale}
                </span>
              </div>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                  background: 'var(--bg-subtle)',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-default)',
                }}
              >
                {voiceDraft}
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '2px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setInputQuery(voiceDraft);
                    setVoiceDraft(null);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  aria-label="Edit speech transcript"
                  style={{
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    border: '1.5px solid var(--border-default)',
                    borderRadius: '8px',
                    padding: '6px 16px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  ✏️ {t('common.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSend(voiceDraft);
                  }}
                  aria-label="Send speech transcript"
                  style={{
                    background: 'var(--green-700)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 20px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(46, 125, 50, 0.25)',
                    transition: 'all 150ms ease',
                  }}
                >
                  ➤ {t('assistant.send')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVoiceDraft(null);
                    resetSpeech();
                  }}
                  aria-label="Cancel speech transcript"
                  style={{
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    border: 'none',
                    padding: '6px 12px',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}

          {/* ─── Bottom Composer ────────────────────────────────────────────── */}
          <div
            style={{
              borderTop: '1px solid var(--border-default)',
              paddingTop: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {/* Language indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>
                Conversing in: <strong style={{ color: 'var(--green-900)' }}>{currentMeta.nativeName} ({currentMeta.name} • 🇮🇳)</strong>
              </span>
              <span>
                Type in {currentMeta.nativeName} or English
              </span>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
            >
              {/* Microphone Trigger */}
              <button
                type="button"
                onClick={speechStatus === 'LISTENING' ? stopListening : startListening}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: speechStatus === 'LISTENING' ? '#fee2e2' : 'var(--bg-subtle)',
                  border: `1.5px solid ${speechStatus === 'LISTENING' ? '#dc2626' : 'var(--border-default)'}`,
                  color: speechStatus === 'LISTENING' ? '#dc2626' : 'var(--text-primary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.75rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  whiteSpace: 'nowrap',
                }}
                aria-label="Toggle voice input"
              >
                <span>{speechStatus === 'LISTENING' ? '🔴' : '🎤'}</span>
                <span>{speechStatus === 'LISTENING' ? 'Listening...' : 'Speak'}</span>
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                placeholder={`Ask BHASHINI in ${currentMeta.nativeName} or English (e.g. Section 3(p), Rule 158B, ABS)...`}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid var(--border-default)',
                  background: 'var(--bg-base)',
                  fontSize: '0.9375rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 150ms ease',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--green-600)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                style={{
                  background: 'var(--green-700)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: inputQuery.trim() ? 'pointer' : 'not-allowed',
                  opacity: inputQuery.trim() ? 1 : 0.6,
                  transition: 'all 150ms ease',
                  whiteSpace: 'nowrap',
                }}
              >
                ➤ Send
              </button>
            </form>
          </div>

        </div>

        {/* Institutional Safeguard Note */}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
          🛡️ BHASHINI operates under strict statutory constraints. Canonical statutory citations and gazette notifications govern all legal conclusions.
        </div>

      </div>

      {/* Evidence Drawer for Inspecting Citations */}
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
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading BHASHINI...</div>}>
      <AssistantContent />
    </Suspense>
  );
}
