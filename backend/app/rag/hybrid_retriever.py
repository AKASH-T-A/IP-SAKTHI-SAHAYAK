"""
IP-SAKTI Backend — Hybrid Statutory Retriever
Combines BM25 lexical search with Vector semantic retrieval and Reciprocal Rank Fusion (RRF).
Applies statutory hierarchy boosts (Acts > Rules > Regulations > Guidelines) and strict metadata filtering.
"""
import math
import numpy as np
from typing import List, Dict, Any, Optional
from rank_bm25 import BM25Okapi


class HybridRetriever:
    """
    Hybrid retriever maintaining statutory provenance and strict authority weighting.
    """

    def __init__(self, chunks: Optional[List[Dict[str, Any]]] = None):
        self.chunks: List[Dict[str, Any]] = chunks or []
        self._init_bm25()

    def set_corpus(self, chunks: List[Dict[str, Any]]):
        self.chunks = chunks
        self._init_bm25()

    def _init_bm25(self):
        if not self.chunks:
            self.bm25 = None
            return
        tokenized_corpus = [
            (c.get("content", "") + " " + c.get("legal_path", "") + " " + c.get("section_number", "")).lower().split()
            for c in self.chunks
        ]
        self.bm25 = BM25Okapi(tokenized_corpus)

    def _get_authority_multiplier(self, source_type: str) -> float:
        st = source_type.lower()
        if "act" in st:
            return 1.3
        elif "rule" in st:
            return 1.2
        elif "regulation" in st:
            return 1.15
        elif "notification" in st:
            return 1.1
        elif "guidance" in st or "guideline" in st:
            return 1.0
        return 1.0

    def search(
        self,
        query: str,
        top_k: int = 5,
        jurisdiction: Optional[str] = None,
        authority: Optional[str] = None,
        status: Optional[str] = "Active",
        query_embedding: Optional[List[float]] = None
    ) -> List[Dict[str, Any]]:
        """
        Executes hybrid retrieval over the corpus with metadata filtering and reciprocal rank fusion.
        """
        if not self.chunks or not query.strip():
            return []

        # 1. Apply Metadata Filters
        eligible_indices = []
        for i, chunk in enumerate(self.chunks):
            if jurisdiction and chunk.get("jurisdiction", "").lower() != jurisdiction.lower():
                continue
            if authority and authority.lower() not in chunk.get("authority", "").lower():
                continue
            if status and chunk.get("status", "").lower() != status.lower():
                continue
            eligible_indices.append(i)

        if not eligible_indices:
            return []

        tokenized_query = query.lower().split()

        # 2. BM25 Lexical Ranking
        bm25_scores = self.bm25.get_scores(tokenized_query) if self.bm25 else [0.0] * len(self.chunks)
        bm25_ranked = sorted(eligible_indices, key=lambda idx: bm25_scores[idx], reverse=True)

        # 3. Dense Vector Ranking (if embeddings provided, otherwise fallback to pseudo/lexical)
        if query_embedding is not None:
            dense_scores = []
            q_vec = np.array(query_embedding, dtype=float)
            q_norm = np.linalg.norm(q_vec)
            for idx in eligible_indices:
                c_emb = self.chunks[idx].get("embedding")
                if c_emb:
                    c_vec = np.array(c_emb, dtype=float)
                    c_norm = np.linalg.norm(c_vec)
                    cos_sim = float(np.dot(q_vec, c_vec) / (q_norm * c_norm + 1e-9))
                else:
                    cos_sim = 0.0
                dense_scores.append((idx, cos_sim))
            dense_ranked = [item[0] for item in sorted(dense_scores, key=lambda x: x[1], reverse=True)]
        else:
            dense_ranked = bm25_ranked

        # 4. Reciprocal Rank Fusion (RRF, k=60)
        rrf_scores: Dict[int, float] = {}
        for rank, idx in enumerate(bm25_ranked[:50]):
            rrf_scores[idx] = rrf_scores.get(idx, 0.0) + (1.0 / (60 + rank + 1))

        for rank, idx in enumerate(dense_ranked[:50]):
            rrf_scores[idx] = rrf_scores.get(idx, 0.0) + (1.0 / (60 + rank + 1))

        # 5. Statutory Authority Multiplier Boost
        final_ranked = []
        for idx, score in rrf_scores.items():
            chunk = self.chunks[idx]
            st = chunk.get("source_type", "Act")
            multiplier = self._get_authority_multiplier(st)
            weighted_score = score * multiplier
            final_ranked.append((idx, weighted_score))

        final_ranked.sort(key=lambda x: x[1], reverse=True)

        # 6. Format Return Results
        results = []
        for idx, score in final_ranked[:top_k]:
            chunk = dict(self.chunks[idx])
            chunk["retrieval_score"] = round(score, 4)
            results.append(chunk)

        return results
