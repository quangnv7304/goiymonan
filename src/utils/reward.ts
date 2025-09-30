import { computeMatch } from "./stateEncoder";

/**
 * Tính reward tức thời dựa vào loại action và kết quả match nguyên liệu.
 * Theo tài liệu nhóm:
 *  +10 nếu khớp ≥ 70%
 *  +5 nếu "like" hoặc "choose"
 *  -5 nếu thiếu nguyên liệu quan trọng
 *  -5 nếu "dislike"
 */
export function instantReward(
  actionType: "choose" | "skip" | "like" | "dislike",
  matchRatio: number,
  importantMissing: boolean
): number {
  let r = 0;

  if (matchRatio >= 0.7) r += 10;
  if (actionType === "like" || actionType === "choose") r += 5;
  if (importantMissing) r -= 5;
  if (actionType === "dislike") r -= 5;
  // tuỳ chỉnh shaping reward cho skip nếu muốn
  return r;
}

/**
 * Tính reward cho một action dựa vào nguyên liệu hiện có và nguyên liệu món ăn.
 */
export function calculateReward(
  availIngredients: string[],
  recipeIngredients: { name: string }[],
  actionType: "choose" | "skip" | "like" | "dislike"
): number {
  const { matchRatio, importantMissing } = computeMatch(
    availIngredients,
    recipeIngredients
  );
  return instantReward(actionType, matchRatio, importantMissing);
}
