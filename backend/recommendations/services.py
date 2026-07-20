import json
import math
from typing import List, Optional


class EmbeddingService:
    """Simple embedding service using lightweight lexical fallback until a model is installed."""

    def __init__(self, model_name: str = 'fallback'):
        self.model_name = model_name

    def _tokenize(self, text: str) -> List[str]:
        return [token.lower() for token in text.replace('\n', ' ').split() if token.strip()]

    def encode_batch(self, texts: List[str]) -> List[List[float]]:
   
        tokenized = [self._tokenize(t or '') for t in texts]

        vocab = sorted({tok for tokens in tokenized for tok in tokens})
        if not vocab:
            return [[0.0] for _ in texts]

        vectors = []
        for tokens in tokenized:
            raw = [tokens.count(word) for word in vocab]
            norm = math.sqrt(sum(v * v for v in raw))
            if norm == 0:
                vectors.append([0.0] * len(vocab))
            else:
                vectors.append([v / norm for v in raw])
        return vectors
    
    
    def cosine_similarity(self, left: List[float], right: List[float]) -> float:
        if not left or not right:
            return 0.0
        max_len = max(len(left), len(right))
        left = left + [0.0] * (max_len - len(left))
        right = right + [0.0] * (max_len - len(right))
        dot = sum(l * r for l, r in zip(left, right))
        left_norm = math.sqrt(sum(l * l for l in left))
        right_norm = math.sqrt(sum(r * r for r in right))
        if left_norm == 0.0 or right_norm == 0.0:
            return 0.0
        return dot / (left_norm * right_norm)

    def serialize_vector(self, vector: List[float]) -> str:
        return json.dumps(vector)

    def deserialize_vector(self, value: Optional[str]) -> List[float]:
        if not value:
            return []
        try:
            return json.loads(value)
        except (TypeError, json.JSONDecodeError):
            return []
