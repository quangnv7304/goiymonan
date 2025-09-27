import { prisma } from '../prismaClient';

interface CalcInput {
  user_id: number;
  recipe_id: number;
  feedback: string;
  state: any;
  extra?: any;
}

async function computeMatchRatio(recipeId: number, Iavail: { id: number; qty: number }[]) {
  const recipeIngredients = await prisma.recipeOnIngredient.findMany({ where: { recipeId } });
  if (!recipeIngredients || recipeIngredients.length === 0) return 0;
  const availableSet = new Set(Iavail.map(i => i.id));
  let match = 0;
  for (const r of recipeIngredients) {
    if (availableSet.has(r.ingredientId)) match++;
  }
  return match / recipeIngredients.length;
}

export async function calculateReward({ user_id, recipe_id, feedback, state, extra }: CalcInput) {
  const matchRatio = await computeMatchRatio(recipe_id, state.Iavail);
  if (matchRatio >= 0.7) return 10;
  if (feedback === 'like' || feedback === 'choose') return 5;
  if (feedback === 'dislike') return -5;
  if (feedback === 'skip') return -1;
  if (feedback === 'not_enough_ingredients') return -5;
  if (matchRatio < 0.5) return -5;
  const recentSame = await prisma.history.count({ where: { userId: user_id, recipeId: recipe_id } });
  if (recentSame >= 3) return -10;
  return 0;
}
