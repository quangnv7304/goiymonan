import { computeMatch } from "./stateEncoder";

/**
 * Tính reward tức thời dựa trên hành động và mức độ khớp nguyên liệu.
 * Quy tắc:
 *  +10 nếu tỷ lệ khớp ≥ 70%
 *  +5 nếu hành động là "like" hoặc "choose"
 *  -5 nếu thiếu nguyên liệu quan trọng
 *  -5 nếu hành động là "dislike"
 */
export function instantReward(
  actionType: "choose" | "skip" | "like" | "dislike",
  matchRatio: number,
  importantMissing: boolean
): { total: number; details: Record<string, number> } {
  const details: Record<string, number> = {};
  let total = 0;

  // +10 nếu match ≥ 70%
  if (matchRatio >= 0.7) {
    total += 10;
    details["match>=70%"] = 10;
  }

  // +5 nếu like hoặc choose
  if (actionType === "like" || actionType === "choose") {
    total += 5;
    details[`action:${actionType}`] = 5;
  }

  // -5 nếu thiếu nguyên liệu quan trọng
  if (importantMissing) {
    total -= 5;
    details["importantMissing"] = -5;
  }

  // -5 nếu dislike
  if (actionType === "dislike") {
    total -= 5;
    details["action:dislike"] = -5;
  }

  return { total, details };
}

/**
 * Tính reward tổng hợp dựa trên avail + nguyên liệu recipe.
 * Trả về cả số điểm tổng, chi tiết đóng góp, tỷ lệ match và flag thiếu nguyên liệu quan trọng.
 */
export function calculateReward(
  availIngredients: string[],
  recipeIngredients: { name: string }[],
  actionType: "choose" | "skip" | "like" | "dislike"
): {
  total: number;
  details: Record<string, number>;
  matchRatio: number;
  importantMissing: boolean;
} {
  const { matchRatio, importantMissing } = computeMatch(availIngredients, recipeIngredients);
  const reward = instantReward(actionType, matchRatio, importantMissing);

  return {
    total: reward.total,
    details: reward.details,
    matchRatio,
    importantMissing,
  };
}
