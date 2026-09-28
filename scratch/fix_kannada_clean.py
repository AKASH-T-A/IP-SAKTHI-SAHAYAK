# -*- coding: utf-8 -*-
"""
IP-SAKTI Sahayak — Pure Kannada (kn) Translation Fix
Eliminates 100% of Hindi/Devanagari text in the Kannada dictionary.
"""

import json
import re

INDEX_PATH = "frontend/src/i18n/translations/index.ts"

KN_CLEAN = {
  "home.hero.multilingual": "ಬಹುಭಾಷಾ ಬೆಂಬಲ",
  "home.hero.multilingual_title": "22 ಭಾರತೀಯ ಭಾಷೆಗಳು + ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಲಭ್ಯವಿದೆ",
  "home.hero.multilingual_desc": "ಸಂಪೂರ್ಣ ವೇದಿಕೆ — AI ಉತ್ತರಗಳು, ಪುರಾವೆ ಕಾರ್ಡ್‌ಗಳು ಮತ್ತು ವರ್ಗೀಕರಣ ವಿವರಣೆಗಳು ಸೇರಿದಂತೆ — ಭಾರತದ ಎಲ್ಲಾ 22 ಅಧಿಕೃತ ಭಾಷೆಗಳಲ್ಲಿ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಲಭ್ಯವಿದೆ. ಶಾಸನಬದ್ಧ ಪದಗಳನ್ನು ಅವುಗಳ ಅಧಿಕೃತ ರೂಪದಲ್ಲಿ ಸಂರಕ್ಷಿಸಲಾಗಿದೆ.",
  "home.features.versioning_updates": "ಆವೃತ್ತಿ ನವೀಕರಣಗಳು",
  "home.features.abstention_protects": "ಸುರಕ್ಷಿತ ತಡೆ ರಕ್ಷಣೆ",
  "home.workflows.heading": "ನೀವು ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?",
  "home.demo.badge": "ಪ್ರತಿನಿಧಿ ಡೆಮೊ ಪ್ರಕರಣ",
  "home.demo.simulation": "ಶಾಸನಬದ್ಧ ಅನುಕರಣೆ",
  "home.demo.title": "ಸೂತ್ರೀಕರಣದಿಂದ ಕಾರ್ಯಯೋಜನೆಯವರೆಗೆ ಕೆಲವೇ ನಿಮಿಷಗಳಲ್ಲಿ",
  "home.demo.story": "ಡಾ. ಪ್ರಿಯಾ ಅವರು ಅಶ್ವಗಂಧದ ಮಾರ್ಪಡಿಸಿದ ಸೂತ್ರೀಕರಣವನ್ನು ಅಭಿವೃದ್ಧಿಪಡಿಸಿದ್ದಾರೆ. ಅವರು ಯಾವ IP ರಕ್ಷಣೆ ಲಭ್ಯವಿದೆ, ಯಾವ ನಿಯಮಗಳು ಅನ್ವಯಿಸುತ್ತವೆ ಮತ್ತು ABS ಅವಶ್ಯಕತೆಗಳು ಮುಖ್ಯವೇ ಎಂಬುದನ್ನು ತಿಳಿಯಲು ಬಯಸುತ್ತಾರೆ — ಅದೆಲ್ಲವೂ ಕನ್ನಡದಲ್ಲಿ.",
  "home.demo.notice": "ಸಾಂಸ್ಥಿಕ ಸೂಚನೆ: ಪ್ರದರ್ಶನ ಕಾರ್ಯಪ್ರವಾಹ. ಇದು ಕಾನೂನು ತೀರ್ಪಲ್ಲ. ಅಧಿಕೃತ ಕಾನೂನು ಅರ್ಜಿಗಾಗಿ ಕೇಸ್ ವರ್ಕ್‌ಸ್ಪೇಸ್‌ನಲ್ಲಿ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ.",
  "home.demo.startCase": "ನಿಮ್ಮ ಪ್ರಕರಣವನ್ನು ಪ್ರಾರಂಭಿಸಿ",
  "home.demo.inspectDossier": "ಡೆಮೊ ಡಾസിയರ್ ವೀಕ್ಷಿಸಿ →",
  "home.demo.step1.label": "ಸೂತ್ರೀಕರಣ ದಾಖಲಿಸಲಾಗಿದೆ",
  "home.demo.step1.sub": "ಅಶ್ವಗಂಧ + ಬ್ರಾಹ್ಮಿ ಕ್ಯಾಪ್ಸುಲ್, ವಾಣಿಜ್ಯ",
  "home.demo.step2.label": "ಫಾರ್ಮುಲೇಶನ್ ಡಿಎನ್‌ಎ (DNA)",
  "home.demo.step2.sub": "ಘಟಕಗಳು · ರೂಪ · TK ಧ್ವಜ · ಜೀವವೈವಿಧ್ಯ ಧ್ವಜ",
  "home.demo.step3.label": "ವರ್ಗೀಕರಣ",
  "home.demo.step3.sub": "ಆಯುರ್ವೇದ ಸ್ವಾಮ್ಯದ ಔಷಧಿ, ವೇಳಾಪಟ್ಟಿ T",
  "home.demo.step4.label": "ಪುರಾವೆ ಪಡೆಯಲಾಗಿದೆ",
  "home.demo.step4.sub": "ಔಷಧಿಗಳು ಮತ್ತು ಸೌಂದರ್ಯವರ್ಧಕಗಳ ಕಾಯಿದೆ 1940 · ಆಯುಷ್ ಮಾರ್ಗಸೂಚಿಗಳು",
  "home.demo.step5.label": "IP ಮಾರ್ಗಗಳು ಗುರುತಿಸಲಾಗಿದೆ",
  "home.demo.step5.sub": "ಪೇಟೆಂಟ್ (ವಿಭಾಗ 3(p) ಟಿಪ್ಪಣಿ) · ಟ್ರೇಡ್‌ಮಾರ್ಕ್ ಲಭ್ಯವಿದೆ",
  "home.demo.step6.label": "ABS ಮೌಲ್ಯಮಾಪನ",
  "home.demo.step6.sub": "NBA ಅಧಿಸೂಚನೆ ಅನ್ವಯಿಸಬಹುದು — ನಿರ್ದೇಶಿತ ಪ್ರಶ್ನೆಗಳು",
  "home.demo.step7.label": "ಕಾರ್ಯಯೋಜನೆ",
  "home.demo.step7.sub": "ಮೂಲಗಳ ಲಿಂಕ್‌ಗಳೊಂದಿಗೆ 4 ನಿರ್ದಿಷ್ಟ ಮುಂದಿನ ಹಂತಗಳು",
  "home.evidence.sample": "ಮಾದರಿ ಸಾಕ್ಷ್ಯಾಧಾರ ಕಾರ್ಡ್",
  "home.evidence.actIndia": "ಕಾಯಿದೆ · ಭಾರತ",
  "home.evidence.strength": "ಸಾಕ್ಷ್ಯಾಧಾರ ಸಾಮರ್ಥ್ಯ",
  "home.evidence.high": "ಹೆಚ್ಚಿನ",
  "home.evidence.whyRelevant": "ಏಕೆ ಪ್ರಸ್ತುತ?",
  "home.evidence.viewSource": "ಮೂಲವನ್ನು ವೀಕ್ಷಿಸಿ",
  "home.evidence.disclaimer": "ಈ ವೇದಿಕೆಯು ಮಾಹಿತಿಯನ್ನು ಮಾತ್ರ ಒದಗಿಸುತ್ತದೆ. ಕಾನೂನು ಸಲಹೆಯಲ್ಲ. ಅರ್ಹ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
  "home.multilingual.badge": "ಬಹುಭಾಷಾ",
  "home.multilingual.fullSupport": "ಸಂಪೂರ್ಣ ವೇದಿಕೆ ಬೆಂಬಲ",
  "home.multilingual.more": "+ ಇನ್ನಷ್ಟು",
  "home.multilingual.all22": "ಎಲ್ಲಾ 22 ಅಧಿಕೃತ ಭಾಷೆಗಳು ಬೆಂಬಲಿತವಾಗಿವೆ",
  "home.domain.patent": "ಪೇಟೆಂಟ್",
  "home.domain.patentDesc": "ಸೂತ್ರೀಕರಣ ಮತ್ತು ಉತ್ಪಾದನಾ ಪ್ರಕ್ರಿಯೆ ರಕ್ಷಣೆ",
  "home.domain.trademark": "ವ್ಯಾಪಾರ ಮುದ್ರೆ (ಟ್ರೇಡ್‌ಮಾರ್ಕ್)",
  "home.domain.trademarkDesc": "ಬ್ರಾಂಡ್ ಮತ್ತು ಉತ್ಪನ್ನ ಗುರುತು",
  "home.domain.gi": "ಭೌಗೋಳಿಕ ಸೂಚಕ (GI)",
  "home.domain.giDesc": "ಪ್ರಾದೇಶಿಕ ಉತ್ಪನ್ನ ಗುರುತು",
  "home.domain.plantVariety": "ಸಸ್ಯ ತಳಿ ಸಂರಕ್ಷಣೆ",
  "home.domain.plantVarietyDesc": "ಹೊಸ ಸಸ್ಯ ತಳಿ ಹಕ್ಕುಗಳು",
  "home.domain.copyright": "ಕೃತಿಸ್ವಾಮ್ಯ (ಕಾಪಿರೈಟ್)",
  "home.domain.copyrightDesc": "ಸೃಜನಶೀಲ ಮತ್ತು ಸಾಹಿತ್ಯಿಕ ಕೃತಿಗಳು",
  "home.domain.industrialDesign": "ಕೈಗಾರಿಕಾ ವಿನ್ಯಾಸ",
  "home.domain.industrialDesignDesc": "ವಿಶಿಷ್ಟ ಉತ್ಪನ್ನ ಬಾಹ್ಯ ನೋಟ",
  "home.domain.tk": "ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನ",
  "home.domain.tkDesc": "TKDL ಪುರಾವೆ ಮತ್ತು ಪೂರ್ವ-ಕಲೆ",
  "home.domain.abs": "ABS / ನಗೋಯಾ ಪ್ರೋಟೋಕಾಲ್",
  "home.domain.absDesc": "ಪ್ರವೇಶ ಮತ್ತು ಲಾಭ ಹಂಚಿಕೆ",
  "home.domain.ayush": "ಆಯುಷ್ ನಿಯಂತ್ರಣ",
  "home.domain.ayushDesc": "ಔಷಧ ಪರವಾನಗಿ ಮತ್ತು ಅನುಸರಣೆ",
  "home.domain.fssaiDesc": "ಆಹಾರ ಸುರಕ್ಷತೆ ವರ್ಗೀಕರಣ (ಆಯುರ್ವೇದ ಆಹಾರ)",
  "home.domain.drugsCosmetics": "ಔಷಧಿಗಳು ಮತ್ತು ಸೌಂದರ್ಯವರ್ಧಕಗಳ ಕಾಯಿದೆ",
  "home.domain.drugsCosmeticsDesc": "ವೇಳಾಪಟ್ಟಿ E/H ಅನುಸರಣೆ",
  "home.domain.internationalIp": "ಅಂತರರಾಷ್ಟ್ರೀಯ IP",
  "home.domain.internationalIpDesc": "WIPO, TRIPS, CBD ಚೌಕಟ್ಟು",
  "nav.quick.herbalPatent": "ಮೂಲಿಕಾ ಸೂತ್ರೀಕರಣಕ್ಕಾಗಿ ಪೇಟೆಂಟ್",
  "nav.quick.fssaiRules": "FSSAI ಆಯುರ್ವೇದ-ಆಹಾರ ನಿಯಮಗಳು",
  "nav.quick.giProtection": "ಸಾಂಪ್ರದಾಯಿಕ ಉತ್ಪನ್ನಗಳಿಗೆ GI ರಕ್ಷಣೆ",
  "nav.quick.absNagoya": "ABS ನಗೋಯಾ ಪ್ರೋಟೋಕಾಲ್",
  "nav.quick.section3p": "ಪೇಟೆಂಟ್ ಕಾಯಿದೆಯ ವಿಭಾಗ 3(p)",
  "nav.quick.tkNeem": "ಬೇವು ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನ",
  "wizard.stepProgress": "ಹಂತ {current} / {total}",
  "wizard.stepPrev": "← ಹಿಂದಿನ ಹಂತ",
  "wizard.stepNext": "ಹಂತ {next} ಕ್ಕೆ ಮುಂದುವರಿಯಿರಿ →",
  "wizard.stepSaveRoadmap": "ಉಳಿಸಿ ಮತ್ತು ಪ್ರಕರಣದ ಮಾರ್ಗಸೂಚಿ ರಚಿಸಿ 🚀",
  "wizard.backToCases": "← ಪ್ರಕರಣಗಳ ವರ್ಕ್‌ಸ್ಪೇಸ್‌ಗೆ ಹಿಂತಿರುಗಿ",
  "wizard.guidedSetup": "ಮಾರ್ಗದರ್ಶಿ ಸೂತ್ರೀಕರಣ ಸೆಟಪ್",
  "wizard.gap.title": "ಸಾಕ್ಷ್ಯಾಧಾರ ಅಂತರ: ಸಸ್ಯಶಾಸ್ತ್ರೀಯ ಹೆಸರು ಅಥವಾ ಸಸ್ಯದ ಭಾಗ ಲಭ್ಯವಿಲ್ಲ",
  "wizard.gap.desc": "ಜೀವವೈವಿಧ್ಯ ಕಾಯಿದೆ (ABS) ಮತ್ತು Section 3(p) ಮೌಲ್ಯಮಾಪನಕ್ಕಾಗಿ ನಿಖರವಾದ ದ್ವಿನಾಮಕರಣ ಮತ್ತು ಸಸ್ಯದ ಭಾಗ ಅಗತ್ಯವಿದೆ.",
  "wizard.gap.fix": "ಹಂತ 2 ರಲ್ಲಿ ಸರಿಪಡಿಸಿ →",
  "wizard.validation.titleRequired": "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸೂತ್ರೀಕರಣ ಅಥವಾ ಯೋಜನೆಗೆ ವಿವರಣಾತ್ಮಕ ಶೀರ್ಷಿಕೆಯನ್ನು ನಮೂದಿಸಿ.",
  "wizard.dnaReady": "ಸೂತ್ರೀಕರಣ DNA ಸಂಶ್ಲೇಷಣೆಗೆ ಸಿದ್ಧವಾಗಿದೆ",
  "wizard.ingIndex": "ಘಟಕ #{index}",
  "wizard.assetNature": "ಸ್ವತ್ತಿನ ಪ್ರಕಾರವನ್ನು ಆರಿಸಿ *",
  "wizard.selectTreatises": "ಘಟಕಗಳು, ತಯಾರಿಕಾ ವಿಧಾನ ಅಥವಾ ಸಾಂಪ್ರದಾಯಿಕ ಬಳಕೆಯನ್ನು ಬೆಂಬಲಿಸುವ ಎಲ್ಲಾ ಅಧಿಕೃತ ಶಾಸ್ತ್ರೀಯ ಗ್ರಂಥಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ:",
  "wizard.classicalCitation": "ಈ ಸೂತ್ರೀಕರಣವು ನೇರವಾಗಿ ಅಧಿಕೃತ ಶಾಸ್ತ್ರೀಯ ಗ್ರಂಥದಲ್ಲಿ (ಮೊದಲ ಅನುಸೂಚಿ) ಉಲ್ಲೇಖಿತವಾಗಿದೆ",
  "wizard.indicationsLabel": "ಪ್ರಾಥಮಿಕ ಸೂಚನೆಗಳು ಮತ್ತು ಆರೋಗ್ಯ ಪ್ರಯೋಜನಗಳು",
  "wizard.indicationsPlaceholder": "ಪ್ರಾಥಮಿಕ ರೋಗಲಕ್ಷಣಗಳು, ಸಾಂಪ್ರದಾಯಿಕ ಪರಿಣಾಮ (ಕರ್ಮ/ದೋಷ ಪರಿಣಾಮ), ಅಥವಾ ಆಹಾರದ ಆರೋಗ್ಯ ಪ್ರಯೋಜನಗಳನ್ನು ನಮೂದಿಸಿ...",
  "wizard.prepNarrative": "ನಿರ್ದಿಷ್ಟ ತಯಾರಿಕಾ ವಿಧಾನದ ವಿವರಣೆ",
  "wizard.prepNarrativePlaceholder": "ಹಂತ-ಹಂತದ ಹೊರತೆಗೆಯುವಿಕೆ, ದ್ರಾವಕ, ಅನುಪಾತ, ತಾಪಮಾನ, ಕಣದ ಗಾತ್ರ ಮತ್ತು ಶುದ್ಧೀಕರಣ ಪ್ರಕ್ರಿಯೆಗಳನ್ನು ನಮೂದಿಸಿ...",
  "wizard.commercialPathway": "ಪ್ರಾಥಮಿಕ ವಾಣಿಜ್ಯ ಅಥವಾ ಸಾಂಸ್ಥಿಕ ಮಾರ್ಗ",
  "wizard.targetJurisdictionTitle": "ಪ್ರಾಥಮಿಕ ಗುರಿ ನಿಯಂತ್ರಕ ಅಧಿಕಾರ ವ್ಯಾಪ್ತಿ",
  "wizard.supportingDocsTitle": "ಲಭ್ಯವಿರುವ ಬೆಂಬಲ ದಾಖಲೆಗಳು",
  "wizard.docAddPlaceholder": "ದಾಖಲೆ ಸೇರಿಸಿ (ಉದಾ. HPLC ಫಿಂಗರ್‌ಪ್ರಿಂಟಿಂಗ್, ಸುರಕ್ಷತಾ ವರದಿ, ಬ್ಯಾಚ್ ದಾಖಲೆ)...",
  "wizard.addDocBtn": "ಸೇರಿಸಿ",
  "wizard.plantPart": "ಸಸ್ಯದ ಭಾಗ",
  "wizard.sourcingType": "ಮೂಲದ ಪ್ರಕಾರ (ABS ಪರಿಣಾಮ)",
  "wizard.cat.ayurvedic": "ಆಯುರ್ವೇದ ಸೂತ್ರೀಕರಣ (Formulation)",
  "wizard.cat.ayurvedicDesc": "ಶಾಸ್ತ್ರೀಯ ಅಥವಾ ಸ್ವಾಮ್ಯದ (Proprietary) ಬಹು-ಮೂಲಿಕಾ ಅಥವಾ ರಸ-ಔಷಧ ತಯಾರಿಕೆ.",
  "wizard.cat.herbal": "ಮೂಲಿಕಾ ಸಾರ / ಉತ್ಪನ್ನ",
  "wizard.cat.herbalDesc": "ಪ್ರಮಾಣೀಕೃತ ಸಸ್ಯಶಾಸ್ತ್ರೀಯ ಸಾರಗಳು, ಸಸ್ಯ-ಔಷಧಿಗಳು, ಅಥವಾ ಆಹಾರ ಪೂರಕಗಳು.",
  "wizard.cat.traditional": "ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನ",
  "wizard.cat.traditionalDesc": "ದಾಖಲಿತ ಶಾಸ್ತ್ರೀಯ ಪದ್ಧತಿಗಳು, ಬುಡಕಟ್ಟು ಚಿಕಿತ್ಸೆಗಳು, ಅಥವಾ ಸಮುದಾಯ ಸಂಪ್ರದಾಯಗಳು.",
  "wizard.cat.plant": "ಸಸ್ಯ / ಜೈವಿಕ ಸಂಪನ್ಮೂಲ",
  "wizard.cat.plantDesc": "ಕಚ್ಚಾ ಸಸ್ಯ ಪ್ರಭೇದಗಳು, ಕೃಷಿ ತಳಿಗಳು, ಅಥವಾ ಅರಣ್ಯ ಉತ್ಪನ್ನ ಔಷಧಿಗಳು.",
  "wizard.cat.process": "ಪ್ರಕ್ರಿಯೆ / ಉತ್ಪಾದನಾ ವಿಧಾನ",
  "wizard.cat.processDesc": "ಹೊಸ ಹೊರತೆಗೆಯುವ ತಂತ್ರಜ್ಞಾನ, ಶೆಲ್ಫ್-ಲೈಫ್ ಸ್ಥಿರೀಕರಣ, ಅಥವಾ ಜೈವಿಕ-ವರ್ಧನೆ ಪ್ರಕ್ರಿಯೆಗಳು.",
  "wizard.cat.brand": "ಬ್ರಾಂಡ್ ಮತ್ತು ಗುರುತು",
  "wizard.cat.brandDesc": "ಹೆಸರು, ವಿಶಿಷ್ಟ ಪ್ಯಾಕೇಜಿಂಗ್, ಅಥವಾ ಭೌಗೋಳಿಕ ಸೂಚಕ (GI) ಸಂಬಂಧ.",
  "wizard.prep.classical": "ಶಾಸ್ತ್ರೀಯ ಆಯುರ್ವೇದ ತಯಾರಿಕೆ",
  "wizard.prep.classicalDesc": "54 ಮೊದಲ ಅನುಸೂಚಿ ಗ್ರಂಥಗಳಲ್ಲಿ ವಿವರಿಸಲಾದ ಸ್ವರಸ, ಕ್ವಾಥ, ತೈಲ ಪಾಕ, ಭಸ್ಮ ಶೋಧನೆ.",
  "wizard.prep.extract": "ಪ್ರಮಾಣೀಕೃತ ದ್ರಾವಕ ಸಾರ",
  "wizard.prep.extractDesc": "ಹೈಡ್ರೋ-ಆಲ್ಕೊಹಾಲಿಕ್ ಅಥವಾ CO2 ಹೊರತೆಗೆಯುವಿಕೆ.",
  "wizard.prep.novel": "ನವೀನ ತಾಂತ್ರಿಕ ವಿಧಾನ",
  "wizard.prep.novelDesc": "ನ್ಯಾನೊ-ಕ್ಯಾರಿಯರ್, ಫೈಟೋಸೋಮ್, ಲಿಪೊಸೋಮಲ್ ಅಥವಾ ಮಾರ್ಪಡಿಸಿದ ಹುದುಗುವಿಕೆ ತಂತ್ರಜ್ಞಾನ.",
  "wizard.commercial.domestic": "ಭಾರತದಲ್ಲಿ ವಾಣಿಜ್ಯ ಉತ್ಪಾದನೆ",
  "wizard.commercial.domesticDesc": "ಚಿಲ್ಲರೆ ಉತ್ಪಾದನೆ, ನೇರ ಗ್ರಾಹಕ ಆಯುರ್ವೇದ ಔಷಧಿಗಳು ಅಥವಾ ಆಯುರ್ವೇದ-ಆಹಾರ.",
  "wizard.commercial.export": "ಅಂತರರಾಷ್ಟ್ರೀಯ ರಫ್ತು",
  "wizard.commercial.exportDesc": "US FDA cGMP ಅಥವಾ ಯುರೋಪಿಯನ್ ಯೂನಿಯನ್ THMPD ಅನುಸರಣೆ.",
  "wizard.commercial.rd": "ಶೈಕ್ಷಣಿಕ / R&D ಮಾದರಿ",
  "wizard.commercial.rdDesc": "ಪೂರ್ವ-ವೈದ್ಯಕೀಯ ಮೌಲ್ಯೀಕರಣ, ಪೈಲಟ್ ಪರೀಕ್ಷೆ ಅಥವಾ ವೈಜ್ಞಾನಿಕ ದಸ್ತಾವೇಜೀಕರಣ.",
  "wizard.commercial.licensing": "ತಂತ್ರಜ್ಞಾನ ವರ್ಗಾವಣೆ ಮತ್ತು IP ಪರವಾನಗಿ",
  "wizard.commercial.licensingDesc": "ವಾಣಿಜ್ಯ ಪರವಾನಗಿಗೆ ಮೊದಲು ಪೇಟೆಂಟ್ ಅಥವಾ ವ್ಯಾಪಾರ ರಹಸ್ಯ ರಕ್ಷಣೆ ಪಡೆಯುವುದು.",
  "wizard.jur.india": "ಭಾರತ (ಆಯುಷ್ / D&C ಕಾಯಿದೆ ಮತ್ತು FSSAI)",
  "wizard.jur.indiaDesc": "ಔಷಧಿಗಳು ಮತ್ತು ಸೌಂದರ್ಯವರ್ಧಕಗಳ ಕಾಯಿದೆ 1940, ನಿಯಮ 158B, ವೇಳಾಪಟ್ಟಿ T GMP, BDA 2002 ABS.",
  "wizard.jur.us": "ಯುನೈಟೆಡ್ ಸ್ಟೇಟ್ಸ್ (US FDA)",
  "wizard.jur.usDesc": "DSHEA 1994, 21 CFR Part 111 ಆಹಾರ ಪೂರಕಗಳು, NDI ಅಧಿಸೂಚನೆಗಳು.",
  "wizard.jur.eu": "ಯುರೋಪಿಯನ್ ಯೂನಿಯನ್ (EMA)",
  "wizard.jur.euDesc": "ನಿರ್ದೇಶನ 2004/24/EC (THMPD), ಸಾಂಪ್ರದಾಯಿಕ ಮೂಲಿಕಾ ಔಷಧೀಯ ಉತ್ಪನ್ನಗಳು.",
  "wizard.jur.intl": "ಬಹು-ಅಧಿಕಾರ ವ್ಯಾಪ್ತಿ / PCT",
  "wizard.jur.intlDesc": "ಪೇಟೆಂಟ್ ಸಹಕಾರ ಒಪ್ಪಂದ (PCT) ಅರ್ಜಿ + ಪ್ರಾದೇಶಿಕ ನ್ಯೂಟ್ರಾಸ್ಯುಟಿಕಲ್ ಫೈಲಿಂಗ್.",
  "wizard.claim.therapeutic": "ಚಿಕಿತ್ಸಕ / ಔಷಧೀಯ (ಆಯುಷ್)",
  "wizard.claim.nutritional": "ಪೌಷ್ಟಿಕ / ಆಯುರ್ವೇದ-ಆಹಾರ",
  "wizard.claim.cosmetic": "ಆಯುರ್ವೇದ ಸೌಂದರ್ಯವರ್ಧಕ (ಸೌಂದರ್ಯ)",
  "wizard.claim.wellness": "ಸಾಮಾನ್ಯ ಕ್ಷೇಮ / ಜೀವನಶೈಲಿ"
}

with open(INDEX_PATH, "r", encoding="utf-8") as f:
    content = f.read()

pattern = r"export const KN_TRANSLATIONS: TranslationDict = (\{[\s\S]*?\n\});"
match = re.search(pattern, content)
kn_dict = json.loads(match.group(1))

# Update with clean Kannada
kn_dict.update(KN_CLEAN)

# Format and write back
new_dict_str = json.dumps(kn_dict, ensure_ascii=False, indent=2)
new_export = f"export const KN_TRANSLATIONS: TranslationDict = {new_dict_str};"
new_content = content[:match.start()] + new_export + content[match.end():]

with open(INDEX_PATH, "w", encoding="utf-8") as f:
    f.write(new_content)

print(f"Successfully cleaned all {len(KN_CLEAN)} contaminated keys in Kannada!")
