"""
IP-SAKTI Backend — Relational Knowledge Graph Endpoint
SIH26045

Provides relational graph structures:
Ingredient -> Biological Resource -> Traditional Knowledge -> Formulation ->
Product Category -> IP Regime -> Regulation -> Authority -> Source -> Jurisdiction -> Evidence
"""
from fastapi import APIRouter, Body
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

router = APIRouter()


class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # ingredient, tk, formulation, category, ip, regulation, authority, source, jurisdiction
    description: str
    authority: Optional[str] = None
    level: int = 1


class GraphEdge(BaseModel):
    source: str
    target: str
    relationship: str  # "DERIVED_FROM", "GOVERNED_BY", "BARRED_BY", "APPLIES_TO", "MANDATED_BY"


class KnowledgeGraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    total_nodes: int
    total_edges: int
    summary: str


@router.get("/relational-map", response_model=KnowledgeGraphResponse)
@router.post("/relational-map", response_model=KnowledgeGraphResponse)
async def get_relational_map(payload: Optional[Dict[str, Any]] = Body(default=None)):
    """
    Generates a structured relational knowledge graph for a formulation
    mapping botanical ingredients, classical treatises, IP bars, regulatory regimes,
    and statutory authorities.
    """
    payload = payload or {}
    formulation = payload.get("formulation", payload)
    ingredients = formulation.get("ingredients", [])

    nodes: List[GraphNode] = []
    edges: List[GraphEdge] = []

    # 1. Root Formulation Node
    formulation_id = "node-formulation"
    formulation_name = formulation.get("product_category", "Ayurvedic Formulation")
    nodes.append(GraphNode(
        id=formulation_id,
        label=formulation_name,
        type="formulation",
        description="Core formulation subject to IP and regulatory governance.",
        level=0
    ))

    # 2. Ingredients & Biological Resources
    for idx, ing in enumerate(ingredients):
        if not isinstance(ing, dict):
            continue
        ing_name = ing.get("name", f"Herb-{idx+1}")
        ing_id = f"ing-{idx+1}"
        botanical = ing.get("botanical_name", "")

        nodes.append(GraphNode(
            id=ing_id,
            label=f"🌿 {ing_name}",
            type="ingredient",
            description=f"Botanical active: {botanical}. Source: {ing.get('source_type', 'cultivated')}.",
            level=1
        ))
        edges.append(GraphEdge(
            source=ing_id,
            target=formulation_id,
            relationship="INGREDIENT_OF"
        ))

        # Biological Resource Node
        bio_id = f"bio-{idx+1}"
        nodes.append(GraphNode(
            id=bio_id,
            label=f"🌱 Bio Resource ({ing.get('source_type', 'wild_harvested')})",
            type="biological_resource",
            description="Indian Biological Resource under Biological Diversity Act 2002.",
            level=2
        ))
        edges.append(GraphEdge(
            source=ing_id,
            target=bio_id,
            relationship="CLASSIFIED_AS"
        ))

        # Connect to ABS Authority
        edges.append(GraphEdge(
            source=bio_id,
            target="auth-nba-sbb",
            relationship="REGULATED_BY_ABS"
        ))

    # 3. Traditional Knowledge Node
    tk_id = "node-traditional-knowledge"
    nodes.append(GraphNode(
        id=tk_id,
        label="📜 Classical Ayurveda (Charaka / Sushruta)",
        type="traditional_knowledge",
        description="Public prior-art documented in classical Sanskrit Ayurvedic treatises.",
        level=2
    ))
    edges.append(GraphEdge(
        source=formulation_id,
        target=tk_id,
        relationship="BASED_ON_TK"
    ))

    # 4. IP Regimes (Patents, Trademarks, GI)
    nodes.append(GraphNode(
        id="ip-patent-3p",
        label="⚖️ Patents Act § 3(p) [TK Bar]",
        type="ip",
        description="Statutory bar against patenting known traditional knowledge remedies.",
        authority="Indian Patent Office (CGPDTM)",
        level=3
    ))
    edges.append(GraphEdge(
        source=tk_id,
        target="ip-patent-3p",
        relationship="TRIGGERS_STATUTORY_BAR"
    ))

    nodes.append(GraphNode(
        id="ip-tm-class5",
        label="🏷️ Trade Mark (Class 5)",
        type="ip",
        description="Brand protection for medicinal herbal products.",
        authority="Trade Marks Registry (CGPDTM)",
        level=3
    ))
    edges.append(GraphEdge(
        source=formulation_id,
        target="ip-tm-class5",
        relationship="PROTECTED_BY"
    ))

    # 5. Regulatory Regimes (D&C Act, FSSAI)
    nodes.append(GraphNode(
        id="reg-dc-158b",
        label="🏛️ D&C Rules 1945 Rule 158B",
        type="regulation",
        description="Licensing criteria for Ayurvedic Proprietary Medicines.",
        authority="Ministry of Ayush / State Licensing Authority",
        level=3
    ))
    edges.append(GraphEdge(
        source=formulation_id,
        target="reg-dc-158b",
        relationship="LICENSED_UNDER"
    ))

    nodes.append(GraphNode(
        id="reg-fssai-aahar",
        label="🥗 FSSAI Ayurveda Aahar Regs 2022",
        type="regulation",
        description="Food and dietary supplement framework (No disease claims).",
        authority="FSSAI, Ministry of Health",
        level=3
    ))
    edges.append(GraphEdge(
        source=formulation_id,
        target="reg-fssai-aahar",
        relationship="ALTERNATIVE_FOOD_PATHWAY"
    ))

    # 6. Statutory Authorities
    nodes.append(GraphNode(
        id="auth-nba-sbb",
        label="🏛️ NBA & State Biodiversity Boards",
        type="authority",
        description="National Biodiversity Authority & State Biodiversity Boards governing ABS.",
        authority="MoEFCC, Government of India",
        level=4
    ))
    nodes.append(GraphNode(
        id="auth-cgpdtm",
        label="🏛️ CGPDTM (Indian Patent Office)",
        type="authority",
        description="Controller General of Patents, Designs and Trade Marks.",
        authority="DPIIT, Ministry of Commerce",
        level=4
    ))
    edges.append(GraphEdge(
        source="ip-patent-3p",
        target="auth-cgpdtm",
        relationship="EXAMINED_BY"
    ))

    # 7. Jurisdiction
    nodes.append(GraphNode(
        id="jur-india",
        label="🇮🇳 Jurisdiction: India",
        type="jurisdiction",
        description="Primary territorial jurisdiction for enforcement and licensing.",
        level=5
    ))
    edges.append(GraphEdge(
        source="auth-cgpdtm",
        target="jur-india",
        relationship="TERRITORY_OF"
    ))
    edges.append(GraphEdge(
        source="auth-nba-sbb",
        target="jur-india",
        relationship="TERRITORY_OF"
    ))

    return KnowledgeGraphResponse(
        nodes=nodes,
        edges=edges,
        total_nodes=len(nodes),
        total_edges=len(edges),
        summary=f"Relational knowledge graph mapped across {len(nodes)} legal/botanical entities with {len(edges)} authoritative dependencies."
    )
