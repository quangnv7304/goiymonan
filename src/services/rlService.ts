// src/services/rlService.ts
import axios from "axios";
import type { RLState, PredictResponse, RLFeedbackRequest } from "@/types";

const RL_BASE = process.env.RL_BASE || "http://localhost:8000";

/**
 * Gọi API RL để lấy dự đoán món ăn
 */
export async function getPredictions(
  state: RLState,
  k = 3
): Promise<PredictResponse> {
  const res = await axios.post<PredictResponse>(
    `${RL_BASE}/predict`,
    { state, k },
    { timeout: 5000 }
  );
  return res.data;
}

/**
 * Gửi feedback của người dùng (choose/like/dislike/skip)
 */
export async function sendFeedback(payload: RLFeedbackRequest): Promise<void> {
  await axios.post(`${RL_BASE}/feedback`, payload, { timeout: 5000 });
}
