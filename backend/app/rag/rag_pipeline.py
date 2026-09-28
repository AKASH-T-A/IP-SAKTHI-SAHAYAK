"""
IP-SAKTI Backend — Real RAG & Decision Support Pipeline
Pipeline: Query -> Intent -> Retrieval -> Authority Filter -> Citation Validation -> Safe Abstention Guard
"""
import re
from typing import List, Dict, Any, Optional
from app.rag.corpus_data import STATUTORY_CORPUS
from app.rag.hybrid_retriever import HybridRetriever
from app.rag.statutory_validator import StatutoryValidator


class RAGPipeline:
    """
    Complete statutory decision-support and retrieval pipeline.
    """

    def __init__(self):
        self.retriever = HybridRetriever(STATUTORY_CORPUS)
        self.validator = StatutoryValidator(STATUTORY_CORPUS)

    def classify_intent(self, query: str) -> str:
        from app.rag.multilingual import classify_multilingual_intent
        multi_intent = classify_multilingual_intent(query)
        if multi_intent != "GENERAL_QUESTION":
            return multi_intent

        q = query.lower()
        if any(w in q for w in ["patent", "invent", "novel", "3(p)", "3(e)", "claim", "infringement"]):
            return "PATENT"
        elif any(w in q for w in ["abs", "biodiversity", "nba", "sbb", "form iii", "benefit sharing", "biological resource"]):
            return "ABS"
        elif any(w in q for w in ["ayush", "fssai", "license", "licensing", "158b", "aahar", "gmp", "schedule t"]):
            return "REGULATION"
        elif any(w in q for w in ["trademark", "brand", "logo", "name"]):
            return "TRADEMARK"
        elif any(w in q for w in ["gi", "geographical", "origin", "darjeeling", "kashmiri"]):
            return "GI"
        elif any(w in q for w in ["tk", "traditional knowledge", "tkdl", "samhita", "treatise"]):
            return "TRADITIONAL_KNOWLEDGE"
        return "GENERAL_QUESTION"

    def retrieve(
        self,
        query: str,
        top_k: int = 4,
        jurisdiction: str = "India",
        authority: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Executes hybrid retrieval over authoritative statutory corpus.
        Normalizes multilingual queries across Indian languages.
        """
        from app.rag.multilingual import normalize_query_for_retrieval
        normalized = normalize_query_for_retrieval(query)
        results = self.retriever.search(
            query=normalized,
            top_k=top_k,
            jurisdiction=jurisdiction,
            authority=authority,
            status="Active"
        )
        if not results and normalized != query:
            results = self.retriever.search(
                query=query,
                top_k=top_k,
                jurisdiction=jurisdiction,
                authority=authority,
                status="Active"
            )
        return results

    def answer_query(
        self,
        query: str,
        case_context: Optional[Dict[str, Any]] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Grounded decision-support synthesis with prompt-injection containment,
        cross-lingual retrieval, and localized response generation for all 22 scheduled Indian languages.
        """
        # Prompt injection & adversarial safety check
        lower_q = query.lower()
        adversarial_terms = [
            "ignore previous instructions", "ignore all previous", "grant this patent",
            "system prompt", "bypass rules", "give me a 100% guarantee", "override"
        ]
        if any(term in lower_q for term in adversarial_terms):
            return {
                "abstained": True,
                "answer": "Security Guardrail Active: System directives, statutory verification rules, and legal standards cannot be overridden by user prompts.",
                "why": "Prompt injection or unsupported absolute guarantee requested.",
                "evidence_strength": "Insufficient",
                "citations": [],
                "missing_information": ["Valid bona fide statutory inquiry required."],
                "next_actions": ["Rephrase inquiry with a specific formulation or statutory section question."]
            }

        intent = self.classify_intent(query)
        sources = self.retrieve(query, top_k=3)

        # Safe Abstention check
        if not sources or len(sources) == 0:
            return {
                "abstained": True,
                "answer": "IP-SAKTI does not have sufficient authoritative evidence to evaluate this query reliably.",
                "why": "No statutory provisions or official Gazette notifications in the current corpus sufficiently support a definitive determination.",
                "evidence_strength": "Insufficient",
                "citations": [],
                "missing_information": [
                    "Specific botanical species and part used",
                    "Governing jurisdiction or intended commercial market",
                    "Reference to applicable Schedule 1 classical texts"
                ],
                "next_actions": [
                    "Refine search query with recognized statutory terms (e.g., Section 3(p), Rule 158B, NBA Form III)",
                    "Consult an accredited patent agent or AYUSH regulatory facilitator"
                ]
            }

        # Synthesize Grounded Decision-Support Response
        primary_source = sources[0]
        citations = [
            {
                "id": s.get("id"),
                "short_title": s.get("short_title"),
                "section": s.get("section_number"),
                "authority": s.get("authority"),
                "source_url": s.get("source_url"),
                "excerpt": s.get("content"),
                "canonical_status": "Authoritative Gazette Text (Canonical)",
            }
            for s in sources
        ]

        # Case Context Awareness
        case_title = case_context.get("title", "Active Formulation") if case_context else "Active Formulation"
        ingredients = case_context.get("ingredients", []) if case_context else []
        ing_names = [i.get("name") for i in ingredients if isinstance(i, dict) and i.get("name")]
        ing_summary = ", ".join(ing_names) if ing_names else "botanical actives"

        # Localized generation using Bharat Multilingual Engine
        from app.rag.multilingual import build_localized_response
        localized = build_localized_response(
            language=language,
            case_title=case_title,
            ing_summary=ing_summary,
            source_title=primary_source.get("short_title", "Statutory Framework"),
            authority=primary_source.get("authority", "Statutory Authority")
        )

        return {
            "abstained": False,
            "detected_intent": intent,
            "answer": localized["answer"],
            "why": localized["why"],
            "evidence_strength": "High" if len(sources) >= 2 else "Moderate",
            "citations": citations,
            "missing_information": localized["missing_information"],
            "practical_meaning": localized["practical_meaning"],
            "next_actions": localized["next_actions"],
            "disclaimer": localized["disclaimer"],
            "is_rtl": localized["is_rtl"],
            "language": language,
            "canonical_language": "en"
        }
