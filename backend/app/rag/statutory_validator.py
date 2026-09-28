"""
IP-SAKTI Backend — Statutory Citation Validator
Strictly forbids LLM hallucinations and fabricated statutory sections.
Validates extracted citations against the verified authoritative statutory corpus with boundary precision.
"""
import re
from typing import List, Dict, Any, Tuple
from app.rag.corpus_data import STATUTORY_CORPUS


class StatutoryValidator:
    """
    Validates legal citations against verified statutory sources.
    """

    def __init__(self, corpus: List[Dict[str, Any]] = STATUTORY_CORPUS):
        self.corpus = corpus
        self.valid_ids = {c["id"]: c for c in corpus}
        self.section_patterns = []
        for c in corpus:
            sec = c["section_number"]
            # Pattern matching word boundary e.g. "Section 3(p)", "Sec 3(p)", "Rule 158B", or exact "3(p)"
            escaped_sec = re.escape(sec)
            pattern = re.compile(
                rf"(?:^|\b)(?:section|rule|regulation|sec\.|r\.)?\s*{escaped_sec}(?:\b|$)",
                re.IGNORECASE
            )
            self.section_patterns.append((pattern, c))

    def validate_citation(self, citation_identifier: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Validates whether a citation exists in the authoritative statutory corpus.
        """
        clean_key = citation_identifier.strip()
        
        # 1. Match by exact ID
        if clean_key in self.valid_ids:
            return True, self.valid_ids[clean_key]

        # 2. Match with boundary pattern
        for pattern, chunk in self.section_patterns:
            if pattern.search(clean_key):
                return True, chunk

        return False, {}

    def filter_verified_citations(self, candidate_citations: List[str]) -> List[Dict[str, Any]]:
        """
        Takes candidate citations extracted from text and returns only verified sources.
        """
        verified = []
        for cand in candidate_citations:
            is_valid, source = self.validate_citation(cand)
            if is_valid and source not in verified:
                verified.append(source)
        return verified
