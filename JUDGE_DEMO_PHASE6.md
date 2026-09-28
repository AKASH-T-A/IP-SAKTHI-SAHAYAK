# IP-SAKTI SAHAYAK — SIH JURY DEMONSTRATION & TECHNICAL DEFENSE (PHASE 6)
## SIH26045 | Intellectual Property & Regulatory Decision Support Platform for Ayurveda

---

### 1. Executive Summary & Problem Context (SIH26045)

**The Problem:**
India has over 40,000 documented traditional herbal remedies and an expanding $24B AYUSH market. However, Ayurvedic researchers and startups face a fragmented statutory maze:
1. **Patents Act 1970 (Section 3(p)):** Forbids patenting traditional knowledge or mere aggregations of known components.
2. **Drugs & Cosmetics Act 1940 (Rule 158B):** Mandates published textual citations from 54 First Schedule texts or pilot clinical safety trials for proprietary medicines.
3. **Biological Diversity Act 2002 / 2023 Amendment:** Requires prior intimation to State Biodiversity Boards (SBB) or approval from National Biodiversity Authority (NBA) for commercial access.
4. **FSSAI (Ayurveda Aahar) Regulations 2022:** Imposes strict boundaries preventing food supplements from making unauthorized disease cure claims.

Generic AI chatbots hallucinate law and invent non-existent sections.

**The Solution:**
**IP-SAKTI Sahayak** is a deterministic, evidence-grounded decision-support platform:
*Rules Constrain → RAG Grounds → AI Explains → Citations Prove → Versioning Updates → Abstention Protects*.

---

### 2. Time-Structured Jury Demonstration Scripts

#### A. 30-Second Elevator Pitch
> *"Judges, generic AI tools hallucinate law and fail Ayurvedic startups. IP-SAKTI Sahayak replaces probabilistic guessing with a deterministic statutory pipeline. When an innovator inputs their formulation, our system generates a scientific Formulation DNA, maps applicable regimes across Patents Section 3(p), AYUSH Rule 158B, and the Biological Diversity Act, detects missing evidence gaps, and produces an authoritative Case Dossier—all verifiable against India Code with zero citation hallucination and safe abstention."*

#### B. 2-Minute Rapid Demo
1. **Intelligent Intake (0:00–0:30):**
   - Open Homepage (`/`). Show the **"What are you working with?"** selector.
   - Click **"Ayurvedic formulation"**, which pre-selects the category in the Guided Wizard (`/cases/new`).
2. **Formulation DNA & Dynamic Gap Detection (0:30–1:00):**
   - In Step 2, show how entering *Withania somnifera* (Ashwagandha) and *Bacopa monnieri* (Brahmi) immediately triggers Section 3(p) and NBA Access & Benefit Sharing (ABS) awareness.
3. **Interactive Dossier & Evidence Chain (1:00–1:30):**
   - View `/cases/demo-case-ashwagandha-brahmi`. Show the **Formulation DNA**, **Evidence Chain**, **Evidence Gap Detector** (`CRITICAL`, `IMPORTANT`, `OPTIONAL`), and the **Regulatory Time Machine** comparing the 2002 Act vs. the 2023 Biodiversity Amendment.
4. **Printable Dossier (1:30–2:00):**
   - Click **"Generate Case Dossier (PDF)"** (`/cases/[id]/report`). Highlight the formal institutional dossier with verification hashes.

#### C. 5-Minute Comprehensive Deep-Dive
- **Minute 1: Intelligent Search & Intent Routing**
  - Search `"Section 3(p)"` or `"patent for herbal formulation"` in `/search`.
  - Show intent classification (`PATENT`), recent searches persistence, and grouped results.
- **Minute 2: Formulation DNA & Real-Time Gap Detection**
  - Demonstrate wizard step navigation: show dynamic gap alert when botanical taxon is incomplete.
- **Minute 3: Evidence Chain & Evidentiary Boundaries**
  - Click an evidence node in `/cases/[id]` to open the **Evidence Drawer**.
  - Show explicit boundaries: *"✓ What this source establishes"* vs *"✕ What this source does NOT establish"*.
- **Minute 4: Regulatory Time Machine & Safe Abstention**
  - Demonstrate Time Machine: side-by-side diff of BDA Section 7 showing exemption for AYUSH practitioners.
  - Click **"Simulate Missing Ingredients"**: show the **Safe Abstention Banner** trigger immediately.
- **Minute 5: Technical Defense & API Infrastructure**
  - Demonstrate `/health` and `/ready` backend endpoints.
  - Show the bilingual toggle (preserving canonical identifiers like Section 3(p) in Hindi).

---

### 3. Anticipated Judge Questions & Technical Defense

| Anticipated Jury Question | Technical Architecture Defense |
|---|---|
| **"Why not just query ChatGPT or Claude directly?"** | LLMs are probabilistic token predictors that frequently hallucinate non-existent statutory sections or claim that an herbal tea is guaranteed a patent. IP-SAKTI uses deterministic rules for classification and strict regex-boundary validators for citations. The LLM only explains pre-validated statutory evidence. |
| **"How do you prevent legal hallucinations?"** | Our `statutory_validator.py` applies word-boundary regex patterns against a pre-verified statutory corpus. If an explanation references an ungrounded or bogus section (e.g. "Section 999"), the validator suppresses it and triggers Safe Abstention. |
| **"Do you have direct access to TKDL (Traditional Knowledge Digital Library)?"** | No private or third-party platform has unrestricted open API access to restricted TKDL systems without CSIR/Ministry clearance. IP-SAKTI clearly labels prior-art signals as *publicly documented classical knowledge and published patent oppositions*, adhering strictly to government disclosure ethics. |
| **"How is proprietary formulation data protected?"** | Formulations and uploaded documents are sandboxed with user-scoped database boundaries (`Case.user_id == current_user.id`). Document text is classified as untrusted user evidence and cannot override deterministic system rules or inject prompt overrides. |
| **"How does the multilingual translation work for statutory terms?"** | We support English and Hindi with architectural readiness for regional languages. Critically, canonical legal identifiers (e.g. *Section 3(p)*, *Rule 158B*, *Schedule T*, *Form III*) are permanently preserved in their authoritative form and never transliterated into confusing phonetics. |
