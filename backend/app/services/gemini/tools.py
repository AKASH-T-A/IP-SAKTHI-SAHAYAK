"""
IP-SAKTI Backend — Controlled Gemini Tools & Function Calling
SIH26045

Controlled execution boundaries for statutory search, classification,
and source retrieval. Gemini NEVER has raw database access.
"""
from typing import Dict, Any, List, Optional
from app.rag.corpus_data import STATUTORY_CORPUS


def search_evidence(query: str, jurisdiction: str = "India", top_k: int = 3) -> List[Dict[str, Any]]:
    """Controlled statutory evidence search over verified Gazette corpus."""
    from app.rag.hybrid_retriever import HybridRetriever
    retriever = HybridRetriever(STATUTORY_CORPUS)
    results = retriever.search(query=query, top_k=top_k, jurisdiction=jurisdiction, status="Active")
    return [
        {
            "id": r.get("id"),
            "short_title": r.get("short_title"),
            "section": r.get("section_number"),
            "authority": r.get("authority"),
            "content": r.get("content")[:300] + "..." if len(r.get("content", "")) > 300 else r.get("content")
        }
        for r in results
    ]


def get_source(source_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves authoritative statutory source metadata without direct database access."""
    for s in STATUTORY_CORPUS:
        if s.get("id") == source_id:
            return {
                "id": s.get("id"),
                "short_title": s.get("short_title"),
                "section": s.get("section_number"),
                "authority": s.get("authority"),
                "jurisdiction": s.get("jurisdiction"),
                "source_url": s.get("source_url"),
                "version": s.get("version"),
                "last_verified": s.get("last_verified")
            }
    return None


def get_tk_evidence(botanical_name: str) -> Dict[str, Any]:
    """Retrieves Traditional Knowledge references for an Ayurvedic botanical."""
    botanical_lower = botanical_name.lower()
    from app.rag.multilingual import AYURVEDA_HERB_MAP
    is_known_herb = any(botanical_lower in k.lower() or botanical_lower in v.lower() for k, v in AYURVEDA_HERB_MAP.items())
    matches = []
    for s in STATUTORY_CORPUS:
        if botanical_lower in s.get("content", "").lower() or botanical_lower in s.get("title", "").lower():
            matches.append({
                "source_id": s.get("id"),
                "title": s.get("short_title"),
                "authority": s.get("authority")
            })
    return {
        "botanical": botanical_name,
        "is_traditional_knowledge": is_known_herb or len(matches) > 0,
        "sources_found": matches,
        "statutory_note": "Section 3(p) of Patents Act 1970 excludes inventions which are traditional knowledge or an aggregation of known properties."
    }


def classify_formulation(ingredients: List[str], formulation_type: str = "proprietary") -> Dict[str, Any]:
    """Controlled formulation classification against Section 3(p) and Rule 158B."""
    return {
        "ingredients": ingredients,
        "formulation_type": formulation_type,
        "section_3p_scrutiny": "HIGH" if len(ingredients) > 1 else "MODERATE",
        "rule_158b_category": "Ayurvedic Proprietary Medicine" if formulation_type.lower() == "proprietary" else "Classical Formulation",
        "nba_form_iii_required": True,
        "recommendation": "Submit synergistic efficacy assay data to overcome Section 3(e)/3(p) objection."
    }


TOOL_DEFINITIONS = [
    {
        "name": "search_evidence",
        "description": "Searches official Indian statutory acts, rules, and Gazette notifications.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Legal or regulatory query text"},
                "jurisdiction": {"type": "string", "default": "India"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "get_source",
        "description": "Retrieves official statutory source record and citation metadata by ID.",
        "parameters": {
            "type": "object",
            "properties": {
                "source_id": {"type": "string", "description": "Canonical ID of statutory source"}
            },
            "required": ["source_id"]
        }
    },
    {
        "name": "get_tk_evidence",
        "description": "Checks Traditional Knowledge and Section 3(p) prior art for Ayurvedic botanicals.",
        "parameters": {
            "type": "object",
            "properties": {
                "botanical_name": {"type": "string", "description": "Scientific or classical name of botanical"}
            },
            "required": ["botanical_name"]
        }
    },
    {
        "name": "classify_formulation",
        "description": "Evaluates statutory IP pathways and Rule 158B requirements for a list of ingredients.",
        "parameters": {
            "type": "object",
            "properties": {
                "ingredients": {"type": "array", "items": {"type": "string"}, "description": "List of botanical actives"},
                "formulation_type": {"type": "string", "description": "proprietary or classical"}
            },
            "required": ["ingredients"]
        }
    }
]


def execute_tool(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Controlled tool dispatcher executing authorized functions."""
    if tool_name == "search_evidence":
        return {"results": search_evidence(**arguments)}
    elif tool_name == "get_source":
        return {"source": get_source(**arguments)}
    elif tool_name == "get_tk_evidence":
        return get_tk_evidence(**arguments)
    elif tool_name == "classify_formulation":
        return classify_formulation(**arguments)
    else:
        return {"error": f"Tool '{tool_name}' is not recognized or not authorized."}
