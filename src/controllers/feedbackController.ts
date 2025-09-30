import { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../prismaClient';

/**
 * Body: { recipeId: number; actionType: 'choose'|'skip'|'like'|'dislike'; state?: { avail: string[] } }
 * - Gửi feedback sang RL service (nếu có)
 * - Ghi log vào DB: tạo State tạm (nếu cần), tìm/tao Action theo recipe, rồi tạo Reward
 */
export async function postFeedback(req: Request, res: Response) {
  const { recipeId, actionType, state } = req.body ?? {};
  if (!recipeId || !actionType) {
    return res.status(400).json({ message: 'recipeId & actionType are required' });
  }

  const RL_BASE = process.env.RL_BASE;

  // 1) Forward sang RL-service nếu có
  if (RL_BASE && state) {
    try {
      await axios.post(`${RL_BASE}/feedback`, {
        state,
        action: recipeId,
        reward: 0,         // RL sẽ tự tính từ backend nếu muốn
        next_state: state, // demo
        done: false,
      });
    } catch (e: any) {
      console.warn('⚠️ RL feedback forward failed:', e?.message);
    }
  }

  // 2) Ghi Reward vào DB (tối thiểu)
  //    - tạo/tìm state tạm
  const dbState = await prisma.state.create({
    data: {
      available_ingredients: state?.avail ? { ingredients: state.avail } : undefined,
      context: { actionType },
      user_id: null,
    },
  });

  //    - tìm/tạo action cho recipe
  let action = await prisma.action.findFirst({
    where: { recipe_id: recipeId },
  });
  if (!action) {
    action = await prisma.action.create({
      data: { recipe_id: recipeId, description: `Action for recipe ${recipeId}` },
    });
  }

  //    - tính reward sơ bộ (0 vì không có matchRatio ở đây), bạn có thể mở rộng gửi state để tính đúng hơn
  const reward_value =
    actionType === 'like' || actionType === 'choose' ? 5 :
      actionType === 'dislike' ? -5 : 0;

  await prisma.reward.create({
    data: {
      user_id: 1,
      state_id: dbState.state_id,
      action_id: action.action_id,
      reward_value,
    },
  });

  return res.json({ success: true });
}
