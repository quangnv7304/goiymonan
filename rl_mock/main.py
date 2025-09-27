# rl_mock/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, List, Dict

app = FastAPI()

class PredictIn(BaseModel):
    state: Dict[str, Any]
    k: int = 3

@app.post("/predict")
def predict(payload: PredictIn):
    # Return dummy recipe ids (1..k)
    k = payload.k
    return [{"recipe_id": i+1, "score": 1.0 - i*0.1} for i in range(k)]

class FeedbackIn(BaseModel):
    state: Dict[str, Any]
    action: int
    reward: float
    next_state: Dict[str, Any]
    done: bool

@app.post("/feedback")
def feedback(payload: FeedbackIn):
    # just accept
    return {"success": True}
