import { Request, Response } from 'express';
import { buildState } from '../utils/stateEncoder';
import { getPredictions } from '../services/rlService';
import { prisma } from '../prismaClient';

export async function getRecommendations(req: Request, res: Response) {
  try {
    const userId = Number(req.query.user_id);
    const k = Number(req.query.k) || 3;
    if (!userId) return res.status(400).json({ error: 'user_id required' });

    const state = await buildState(userId);
    const preds = await getPredictions(state, k); // [{recipe_id, score}]
    const recipeIds = preds.map((p: any) => p.recipe_id);
    // fetch recipes
    const recipes = await prisma.recipe.findMany({ where: { id: { in: recipeIds } } });
    const mapped = preds.map((p: any) => ({
      recipe_id: p.recipe_id,
      score: p.score,
      recipe: recipes.find(r => r.id === p.recipe_id) || null
    }));
    return res.json({ success: true, recommendations: mapped });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
