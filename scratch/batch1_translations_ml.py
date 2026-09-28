# -*- coding: utf-8 -*-
"""
IP-SAKTI Sahayak - Malayalam Native Translation Dictionary Generator
Eliminates all 98 English fallbacks in Malayalam (ml)
"""

import json
import re

ML_UPDATES = {
  "explore.searchPlaceholder": "ഫോർമുലേഷനുകൾ, പേറ്റന്റുകൾ, Section 3(p), Rule 158B, ABS, TKDL തിരയുക...",
  "explore.ipPatents": "ഐപി & പേറ്റന്റുകൾ",
  "explore.ayushFssai": "ആയുഷ് & എഫ്എസ്എസ്എഐ",
  "explore.bioAbs": "ജൈവവൈവിധ്യം & എബിഎസ്",
  "explore.tkTkdl": "പരമ്പരാഗത അറിവ് & ടികെഡിഎൽ",
  "explore.noItems": "തിരഞ്ഞെടുത്ത വിഭാഗത്തിൽ നിയന്ത്രണ ചട്ടക്കൂടുകളൊന്നും കണ്ടെത്തിയില്ല.",
  "explore.actSec3p": "പേറ്റന്റ്സ് ആക്ട് 1970 — സെക്ഷൻ 3(p) & 3(e)",
  "explore.actRule158b": "ഡ്രഗ്സ് & കോസ്മെറ്റിക്സ് റൂൾസ് 1945 — റൂൾ 158B",
  "explore.actAbs": "ബയോളജിക്കൽ ഡൈവേഴ്സിറ്റി ആക്ട് 2002 — ഫോം III എബിഎസ്",
  "explore.actAahar": "ആയുഷ് ആഹാർ റെഗുലേഷൻസ് 2022 — എഫ്എസ്എസ്എഐ ചട്ടക്കൂട്",
  "explore.actTkdl": "പരമ്പരാഗത അറിവ് ഡിജിറ്റൽ ലൈബ്രറി (ടികെഡിഎൽ) ചട്ടക്കൂട്",
  "explore.actGi": "ഭൂമിശാസ്ത്രപരമായ സൂചികകൾ (രജിസ്ട്രേഷൻ & സംരക്ഷണം) ആക്ട് 1999",
  "evidence.allAuthorities": "എല്ലാ നിയന്ത്രണ അതോറിറ്റികളും",
  "evidence.allTypes": "എല്ലാ നിയമപരമായ തരങ്ങളും",
  "evidence.act": "ആക്ട് (നിയമം)",
  "evidence.rule": "ചട്ടം (റൂൾ)",
  "evidence.gazetteNotification": "ഗസറ്റ് വിജ്ഞാപനം",
  "evidence.pharmacopoeialStandard": "ഫാർമക്കോപ്പിയൽ മാനദണ്ഡം",
  "evidence.treaty": "അന്താരാഷ്ട്ര ഉടമ്പടി",
  "evidence.cryptoHash": "ക്രിപ്റ്റോഗ്രാഫിക് ഫോറൻസിക് ഹാഷ്",
  "evidence.plainSummary": "ലളിതമായ സംഗ്രഹം",
  "evidence.officialExcerpt": "ഔദ്യോഗിക നിയമാനുസൃത ഉദ്ധരണി",
  "evidence.inspectCitation": "നിയമപരമായ ഉദ്ധരണി പരിശോധിക്കുക",
  "evidence.noCorpusFound": "നിയമപരമായ തെളിവുകൾ കണ്ടെത്തിയില്ല",
  "evidence.noCorpusHint": "നിങ്ങളുടെ തിരയൽ മാനദണ്ഡം മാറ്റുക അല്ലെങ്കിൽ ഫിൽട്ടറുകൾ മായ്ക്കുക.",
  "caseDetail.notFoundDesc": "ആവശ്യപ്പെട്ട കേസ് റെക്കോർഡ് നിലവിലില്ല അല്ലെങ്കിൽ നീക്കംചെയ്തിരിക്കാം.",
  "caseDetail.juryDemo": "ജൂറി ഡെമോ മോഡ്",
  "caseDetail.simulateMissing": "നഷ്ടപ്പെട്ട പ്രമാണങ്ങൾ അനുകരിക്കുക",
  "caseDetail.exportDossier": "കേസ് ഡോസിയർ കയറ്റുമതി ചെയ്യുക",
  "caseDetail.timeMachine": "റെഗുലേറ്ററി ടൈം മെഷീൻ",
  "caseDetail.editFormulation": "ഫോർമുലേഷൻ തിരുത്തുക",
  "caseDetail.classificationVerdict": "വർഗ്ഗീകരണ വിധി",
  "caseDetail.evidenceStrength": "തെളിവിന്റെ ബലം",
  "caseDetail.governingAuthority": "ഭരണ അതോറിറ്റി",
  "caseDetail.statutoryBasis": "നിയമപരമായ അടിസ്ഥാനം",
  "caseDetail.coreExcerpt": "പ്രധാന നിയമപരമായ ഉദ്ധരണി",
  "caseDetail.plainExplanation": "ലളിതമായ വിശദീകരണം",
  "caseDetail.whyThis": "എന്തുകൊണ്ട് ഈ വർഗ്ഗീകരണം ബാധകമാകുന്നു?",
  "auth.showPassword": "പാസ്‌വേഡ് കാണിക്കുക",
  "auth.hidePassword": "പാസ്‌വേഡ് മറയ്ക്കുക",
  "auth.charRequirement": "8+ പ്രതീകങ്ങൾ",
  "auth.upperRequirement": "വലിയക്ഷരം (Uppercase)",
  "auth.numRequirement": "സംഖ്യ (Number)",
  "auth.demoAdmin": "ഡെമോ അഡ്മിൻ ക്രെഡൻഷ്യലുകൾ ഉപയോഗിക്കുക",
  "intel.drawerTitle": "നിയമപരമായ തെളിവ് ഡ്രോയർ",
  "intel.authority": "ഭരണ അതോറിറ്റി",
  "intel.hierarchy": "നിയമപരമായ മുൻഗണന ശ്രേണി",
  "intel.version": "ഔദ്യോഗിക പതിപ്പ്",
  "intel.excerpt": "നിയമപരമായ ഉദ്ധരണി",
  "intel.plainSummary": "ലളിതമായ നിയമ സംഗ്രഹം",
  "intel.gazetteSource": "ഗസറ്റ് ഉറവിടം",
  "intel.openExternal": "ഔദ്യോഗിക ഗസറ്റ് തുറക്കുക",
  "intel.closeDrawer": "ഡ്രോയർ അടയ്ക്കുക",
  "intel.gapsTitle": "തെളിവുകളുടെ കുറവുകൾ & പരിഹാര തന്ത്രം",
  "intel.resolutionStrategy": "പരിഹാര തന്ത്രം",
  "intel.chainTitle": "നിയമാനുസൃത തെളിവ് ശൃംഖല",
  "intel.factTriggered": "പ്രവർത്തിപ്പിച്ച വസ്തുത",
  "intel.ruleApplied": "പ്രയോഗിച്ച ചട്ടം",
  "intel.matrixTitle": "സ്റ്റാറ്റ്യൂട്ടറി ഇന്റലിജൻസ് ബോർഡ്",
  "intel.timeMachineTitle": "റെഗുലേറ്ററി ടൈം മെഷീൻ",
  "intel.historicalAmendments": "ചരിത്രപരമായ ഭേദഗതികൾ",
  "intel.uploadTitle": "സഹായ രേഖകൾ അപ്‌ലോഡ് ചെയ്യുക",
  "intel.dragDrop": "രേഖകൾ ഇവിടെ വലിച്ചിടുക അല്ലെങ്കിൽ ബ്രൗസ് ചെയ്യുക",
  "intel.whyTitle": "എന്തുകൊണ്ടാണ് നിങ്ങൾ ഇത് കാണുന്നത്?",
  "intel.deterministicVerification": "നിശ്ചിത നിയമാനുസൃത സ്ഥിരീകരണം",
  "search.breadcrumb": "തിരയൽ",
  "search.heading": "സ്റ്റാറ്റ്യൂട്ടറി & പേറ്റന്റ് സെർച്ച്",
  "search.suggestedLabel": "നിർദ്ദേശിച്ച അന്വേഷണങ്ങൾ",
  "search.recentLabel": "സമീപകാല തിരയലുകൾ",
  "search.clearLabel": "മായ്ക്കുക",
  "search.advancedFilters": "വിപുലമായ ഫിൽട്ടറുകൾ",
  "search.hideAdvancedFilters": "വിപുലമായ ഫിൽട്ടറുകൾ മറയ്ക്കുക",
  "search.allAuthorities": "എല്ലാ അതോറിറ്റികളും",
  "search.allJurisdictions": "എല്ലാ അധികാരപരിധികളും",
  "assistant.breadcrumb": "എഐ സഹായകൻ",
  "assistant.bannerActive": "സജീവ കേസ് പശ്ചാത്തലത്തിൽ പ്രവർത്തിക്കുന്നു",
  "assistant.suggestedInquiries": "നിർദ്ദേശിച്ച അന്വേഷണങ്ങൾ",
  "assistant.directAnswer": "നേരിട്ടുള്ള നിയമാനുസൃത ഉത്തരം",
  "assistant.ruleConstraints": "ബാധകമായ ചട്ട നിയന്ത്രണങ്ങൾ",
  "assistant.officialCitations": "ഔദ്യോഗിക നിയമ ഉദ്ധരണികൾ",
  "assistant.evidenceGaps": "കണ്ടെത്തിയ തെളിവ് വിടവുകൾ",
  "assistant.disclaimerFooter": "നിയമപരമായ മുന്നറിയിപ്പ്: ഈ സിസ്റ്റം വിവര ആവശ്യങ്ങൾക്കായി നിയമാനുസൃത മാർഗ്ഗനിർദ്ദേശം നൽകുന്നു.",
  "report.tableIngredients": "ഫോർമുലേഷൻ ചേരുവകൾ & വിവരണം",
  "report.name": "ചേരുവയുടെ പേര്",
  "report.botanical": "സസ്യശാസ്ത്ര നാമം",
  "report.sanskrit": "സംസ്കൃത നാമം",
  "report.part": "ഉപയോഗിച്ച ഭാഗം",
  "report.percentage": "അനുപാതം / ശതമാനം",
  "report.source": "ഉറവിട റഫറൻസ്",
  "report.origin": "ഭൂമിശാസ്ത്രപരമായ ഉത്ഭവം",
  "home.pipeline.question": "ചോദ്യം",
  "home.pipeline.classify": "വർഗ്ഗീകരിക്കുക",
  "home.pipeline.evidence": "തെളിവ്",
  "home.pipeline.intelligence": "ഇന്റലിജൻസ്",
  "home.pipeline.action": "നടപടി",
  "home.domain.plantVarietyProtection": "സസ്യ ഇനങ്ങളുടെ സംരക്ഷണം",
  "cases.noMatch": "നിങ്ങളുടെ തിരയലിന് അനുയോജ്യമായ കേസുകളൊന്നും കണ്ടെത്തിയില്ല.",
  "cases.jurisdictionIndia": "ഇന്ത്യ (ദേശീയ)"
}

def update_malayalam():
    filepath = "frontend/src/i18n/translations/index.ts"
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    pattern = r"export const ML_TRANSLATIONS: TranslationDict = (\{[\s\S]*?\n\});"
    match = re.search(pattern, content)
    if not match:
        print("ERROR: ML_TRANSLATIONS not found!")
        return

    ml_dict = json.loads(match.group(1))
    ml_dict.update(ML_UPDATES)

    new_dict_str = json.dumps(ml_dict, ensure_ascii=False, indent=2)
    new_export = f"export const ML_TRANSLATIONS: TranslationDict = {new_dict_str};"
    
    updated_content = content[:match.start()] + new_export + content[match.end():]
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(updated_content)

    print(f"Successfully updated {len(ML_UPDATES)} Malayalam translations!")

if __name__ == "__main__":
    update_malayalam()
