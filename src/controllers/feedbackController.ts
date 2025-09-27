import { Request, Response } from 'express';
import { buildState } from '../utils/stateEncoder';
import { calculateReward } from '../utils/reward';
import { prisma } from '../prismaClient';
import feedbackQueue from '../queue/feedbackQueue';

export async function postFeedback(req: Request, res: Response) {
  try {
    const { user_id, recipe_id, feedback, extra } = req.body;
    if (!user_id || !recipe_id || !feedback) {
      return res.status(400).json({ error: 'user_id, recipe_id, feedback required' });
    }
    const state = await buildState(user_id);
    const reward = await calculateReward({ user_id, recipe_id, feedback, state, extra });
    const nextState = await buildState(user_id);

    // save history
    await prisma.history.create({
      data: {
        userId: user_id,
        recipeId: recipe_id,
        actionType: 'suggest',
        feedback,
        reward,
        state,
        nextState
      }
    });

    // enqueue
    await feedbackQueue.add('send-feedback', { state, action: recipe_id, reward, nextState, done: false }, { attempts: 3, backoff: 5000 });

    return res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
