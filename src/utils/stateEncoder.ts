import { prisma } from '../prismaClient';

/**
 * Chuẩn hóa chuỗi nguyên liệu người dùng nhập (tách dấu phẩy, trim, lower)
 */
export function parseAvailInput(avail: string[] | string): string[] {
  if (Array.isArray(avail)) return avail.map(s => s.trim().toLowerCase()).filter(Boolean);
  return avail.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
}

/**
 * Lấy danh sách nguyên liệu (tên, qty) của 1 recipe
 */
export async function getRecipeIngredients(recipe_id: number) {
  const rows = await prisma.recipeOnIngredient.findMany({
    where: { recipe_id },
    include: { ingredient: true },
  });
  return rows.map(r => ({
    ingredient_id: r.ingredient_id,
    name: r.ingredient.name.toLowerCase(),
    qty: r.quantity ?? 1,
  }));
}

/**
 * Tính tỷ lệ khớp nguyên liệu giữa pantry (avail) và recipe
 * - matchRatio: số nguyên liệu trong recipe có mặt trong avail / tổng nguyên liệu recipe
 * - thiếu quan trọng: mặc định coi nguyên liệu đầu danh sách là "quan trọng"
 */
export function computeMatch(avail: string[], recipeIngs: { name: string }[]) {
  const set = new Set(avail);
  const total = recipeIngs.length || 1;
  const matched = recipeIngs.filter(x => set.has(x.name)).length;
  const matchRatio = matched / total;

  const importantMissing =
    recipeIngs.length > 0 && !set.has(recipeIngs[0].name); // thiếu nguyên liệu đầu tiên

  return { matchRatio, importantMissing };
}
