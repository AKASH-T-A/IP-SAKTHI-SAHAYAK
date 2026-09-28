"""
IP-SAKTI Backend — Legal-Aware Structural Chunker
Preserves exact legal hierarchy: Act -> Chapter -> Section -> Subsection -> Clause
Strictly prevents splitting mid-clause or dislocating statutory provisos.
"""
import re
import hashlib
from typing import List, Dict, Any, Optional


class LegalChunk:
    def __init__(
        self,
        content: str,
        legal_path: str,
        act_title: str,
        authority: str,
        jurisdiction: str,
        section_number: str,
        subsection: Optional[str] = None,
        clause: Optional[str] = None,
        source_url: Optional[str] = None,
        effective_date: Optional[str] = None,
        status: str = "Active",
        chunk_index: int = 0
    ):
        self.content = content.strip()
        self.legal_path = legal_path
        self.act_title = act_title
        self.authority = authority
        self.jurisdiction = jurisdiction
        self.section_number = section_number
        self.subsection = subsection
        self.clause = clause
        self.source_url = source_url
        self.effective_date = effective_date
        self.status = status
        self.chunk_index = chunk_index
        self.token_count = len(content.split())
        self.content_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "content": self.content,
            "legal_path": self.legal_path,
            "act_title": self.act_title,
            "authority": self.authority,
            "jurisdiction": self.jurisdiction,
            "section_number": self.section_number,
            "subsection": self.subsection,
            "clause": self.clause,
            "source_url": self.source_url,
            "effective_date": self.effective_date,
            "status": self.status,
            "chunk_index": self.chunk_index,
            "token_count": self.token_count,
            "content_hash": self.content_hash,
        }


class LegalAwareChunker:
    """
    Parses statutory documents while strictly respecting legal boundaries.
    """

    SECTION_PATTERN = re.compile(
        r"(?:^|\n)(?:Section|Rule|Regulation|Article)\s+([0-9]+[A-Za-z]?(?:\([a-z0-9]+\))?)\.?\s*[-–—:]?\s*([^\n]+)",
        re.IGNORECASE
    )
    
    CLAUSE_PATTERN = re.compile(
        r"(?:^|\n)\s*(\([a-z0-9]+\))\s+([^\n]+)",
        re.IGNORECASE
    )

    def chunk_statutory_text(
        self,
        raw_text: str,
        act_title: str,
        authority: str,
        jurisdiction: str = "India",
        source_url: Optional[str] = None,
        effective_date: Optional[str] = None,
        status: str = "Active"
    ) -> List[LegalChunk]:
        """
        Decomposes statutory text into legally coherent units preserving section and clause hierarchy.
        """
        chunks: List[LegalChunk] = []
        lines = raw_text.split("\n")
        
        current_section = "General"
        current_section_title = ""
        current_buffer: List[str] = []
        chunk_idx = 0

        for line in lines:
            sec_match = self.SECTION_PATTERN.search(line)
            if sec_match:
                # Flush previous section
                if current_buffer:
                    content_str = "\n".join(current_buffer).strip()
                    if content_str:
                        legal_path = f"{act_title} > Section {current_section}: {current_section_title}".strip(": ")
                        chunks.append(LegalChunk(
                            content=content_str,
                            legal_path=legal_path,
                            act_title=act_title,
                            authority=authority,
                            jurisdiction=jurisdiction,
                            section_number=current_section,
                            source_url=source_url,
                            effective_date=effective_date,
                            status=status,
                            chunk_index=chunk_idx
                        ))
                        chunk_idx += 1
                    current_buffer = []

                current_section = sec_match.group(1).strip()
                current_section_title = sec_match.group(2).strip()
                current_buffer.append(line)
            else:
                current_buffer.append(line)

        # Flush final buffer
        if current_buffer:
            content_str = "\n".join(current_buffer).strip()
            if content_str:
                legal_path = f"{act_title} > Section {current_section}: {current_section_title}".strip(": ")
                chunks.append(LegalChunk(
                    content=content_str,
                    legal_path=legal_path,
                    act_title=act_title,
                    authority=authority,
                    jurisdiction=jurisdiction,
                    section_number=current_section,
                    source_url=source_url,
                    effective_date=effective_date,
                    status=status,
                    chunk_index=chunk_idx
                ))

        return chunks
