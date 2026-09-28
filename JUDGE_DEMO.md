# IP-SAKTI SAHAYAK — SIH JUDGE DEMO & TECHNICAL DEFENSE GUIDE
## SIH26045 | Intellectual Property & Regulatory Decision Support Platform for Ayurveda

---

### 1. Executive Summary & Problem Context (SIH26045)

**The Problem:**
Ayurvedic innovators, MSMEs, researchers, and traditional healers face a fragmented statutory maze. An Ayurvedic product is not just a patent question:
- The **Patents Act 1970 (Section 3(p))** bars patents on traditional knowledge and mere aggregations.
- The **Drugs and Cosmetics Act 1940 (Rule 158B)** demands proof of safety and classical reference (First Schedule) for proprietary medicines.
- The **Biological Diversity Act 2002** mandates prior intimation or approval from the National Biodiversity Authority (NBA) / State Biodiversity Boards (SBB) before accessing domestic medicinal plants.
- The **FSSAI (Ayurveda Aahar) Regulations 2022** strictly regulate nutritional botanical claims.

Traditional search engines and generic AI chatbots hallucinate non-existent patent sections or give misleading legal guarantees.

**The Solution — IP-SAKTI Sahayak:**
A case-centered, multilingual, deterministic intelligence engine grounded in authoritative statutory corpus.
*Core Architecture:* **Rules Constrain → RAG Grounds → AI Explains → Citations Prove → Versioning Updates → Abstention Protects**.

---

### 2. Time-Structured Demo Scripts

#### A. 30-Second Elevator Pitch
> *"Judges, generic AI tools hallucinate law and fail Ayurvedic startups. IP-SAKTI Sahayak solves this by replacing probabilistic AI guesswork with a deterministic legal pipeline. When an innovator inputs their formulation, our system generates a scientific Formulation DNA, maps applicable regimes across Patents, AYUSH Rule 158B, and the Biological Diversity Act, detects missing evidence gaps, and produces an authoritative Case Dossier—all verifiable against India Code with zero hallucination and safe abstention."*

#### B. 2-Minute Rapid Demo
1. **Intelligent Intake (0:00–0:30):**
   - Open Homepage (`/`). Show the **"What are you working with?"** dynamic intake widget.
   - Click **"Ayurvedic formulation"** to enter the Guided Wizard (`/cases/new`).
2. **Formulation DNA & Gap Detection (0:30–1:00):**
   - Show how declaring Withania somnifera (Ashwagandha) and Bacopa monnieri (Brahmi) immediately triggers dynamic Section 3(p) and NBA Access & Benefit Sharing (ABS) alerts.
3. **Interactive Dossier & Evidence Chain (1:00–1:30):**
   - Navigate to `/cases/demo-case-ashwagandha-brahmi`. Show the **Formulation DNA**, **Evidence Chain** (User Facts → Classification → Statutory Section → IP Pathway), and **Evidence Gap Detector** (`CRITICAL`, `IMPORTANT`, `OPTIONAL`).
4. **Printable Dossier (1:30–2:00):**
   - Click **"Generate Case Dossier (PDF)"** (`/cases/[id]/report`). Highlight the formal institutional dossier with verification hashes.

#### C. 5-Minute Comprehensive Jury Walkthrough
- **Minute 1: The Intake & Intelligent Intent Search**
  - Search `"Section 3(p)"` or `"patent for herbal formulation"` in `/search`.
  - Demonstrate automatic intent classification (`PATENT` / `REGULATION`), grouped statutory results, and collapsible Authority filters (Indian Patent Office, AYUSH, NBA).
- **Minute 2: Formulation DNA & Guided Wizard**
  - Walk through `/cases/new`: show how changing processing from classical to standardized extract conditionally alters regulatory scrutiny under Rule 158B.
- **Minute 3: Signature Features — Evidence Chain & Time Machine**
  - On `/cases/[id]`, demonstrate the **Evidence Chain**: click an evidence node to open the **Evidence Drawer**.
  - Show the **Evidentiary Boundaries**: *"What this source establishes"* vs *"What this source does NOT establish"*.
  - Show the **Regulatory Time Machine**: compare Section 7 of the Biological Diversity Act 2002 before and after the 2023 Amendment (exempting registered AYUSH practitioners).
- **Minute 4: Safe Abstention & Adversarial Protection**
  - Toggle the live **"Simulate Missing Ingredients"** button on the case page.
  - Show the **Safe Abstention Banner** instantly trigger: the system withholds speculative classification when evidence is incomplete.
- **Minute 5: Technical Defense & Verification**
  - Show the printable formal dossier, bilingual toggle (preserving canonical identifiers like Section 3(p) and Rule 158B in Hindi), and discuss architecture.

---

### 3. Anticipated Judge Questions & Technical Answers

| Question | Technical Defense |
|---|---|
| **"Why not just use ChatGPT or Claude directly?"** | LLMs are probabilistic text generators that frequently fabricate legal citations or overlook mandatory regional statutes like AYUSH Rule 158B. IP-SAKTI uses deterministic rules for classification and strict regex-boundary validators for citations. The LLM only explains verified statutory evidence. |
| **"How do you prevent legal hallucinations?"** | Our `statutory_validator.py` uses word-boundary regex patterns against a pre-verified statutory corpus. If an AI explanation mentions an ungrounded or bogus section (e.g., "Section 999"), the validator suppresses it or triggers Safe Abstention. |
| **"Do you have access to TKDL (Traditional Knowledge Digital Library)?"** | No platform has open API access to restricted TKDL databases without government clearance. IP-SAKTI clearly labels prior-art signals as *publicly documented traditional knowledge and published patent oppositions*, adhering strictly to government disclosure ethics. |
| **"How is user formulation data protected?"** | Formulations and uploaded documents are sandboxed with user-scoped database boundaries. Document text is classified as untrusted user evidence and cannot override deterministic system rules or inject malicious prompt instructions. |
| **"How does the multilingual translation work for statutory terms?"** | We support English and Hindi with architectural support for regional languages. Critically, canonical legal identifiers (e.g. *Section 3(p)*, *Rule 158B*, *Schedule T*, *Form III*) are permanently preserved in their authoritative form and never transliterated into confusing phonetics. |
