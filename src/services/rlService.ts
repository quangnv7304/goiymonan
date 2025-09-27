import axios from 'axios';
const RL_BASE = process.env.RL_BASE || 'http://localhost:8000';

export async function getPredictions(state: any, k = 3) {
  const res = await axios.post(`${RL_BASE}/predict`, { state, k }, { timeout: 5000 });
  return res.data; // expect [{recipe_id, score}, ...]
}

export async function sendFeedback(payload: any) {
  await axios.post(`${RL_BASE}/feedback`, payload, { timeout: 5000 });
}
