import { prisma } from '../prismaClient';

let ingredientIndexMap: Record<number, number> | null = null;

export async function buildIngredientIndexMap() {
  if (ingredientIndexMap) return ingredientIndexMap;
  const ingredients = await prisma.ingredient.findMany({ select: { id: true } });
  ingredientIndexMap = {};
  ingredients.forEach((ing, idx) => { ingredientIndexMap![ing.id] = idx; });
  return ingredientIndexMap;
}

export function makeMultiHot(ids: number[], indexMap: Record<number, number>) {
  const len = Object.keys(indexMap).length;
  const vec = new Array(len).fill(0);
  ids.forEach(id => {
    const idx = indexMap[id];
    if (idx !== undefined) vec[idx] = 1;
  });
  return vec;
}

export async function getUserIngredients(userId: number) {
  const rows = await prisma.userIngredient.findMany({ where: { userId } });
  return rows.map(r => ({ id: r.ingredientId, qty: r.qty }));
}

export async function buildState(userId: number) {
  const Iavail = await getUserIngredients(userId);
  const indexMap = await buildIngredientIndexMap();
  const ingredientVector = makeMultiHot(Iavail.map(i => i.id), indexMap);
  const recent = await prisma.history.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  const H = recent.map(r => ({ recipe_id: r.recipeId, feedback: r.feedback }));
  return {
    user_id: userId,
    Iavail,
    Imiss: [],
    H,
    ingredient_vector: ingredientVector,
    timestamp: new Date().toISOString()
  };
}
