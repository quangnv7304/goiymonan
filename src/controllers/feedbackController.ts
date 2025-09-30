import { Request, Response } from "express";
import axios from "axios";
import { prisma } from "../prismaClient";
import feedbackQueue from "../queue/feedbackQueue";
import Redis from "ioredis";
import { calculateReward } from "../utils/reward";
import { parseAvailInput, getRecipeIngredients } from "../utils/stateEncoder";

const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

export async function postFeedback(req: Request, res: Response) {
  try {
    const { recipeId, actionType, state } = req.body ?? {};

    if (!recipeId || !actionType) {
      return res
        .status(400)
        .json({ message: "recipeId & actionType are required" });
    }

    // --- Parse nguyên liệu user nhập ---
    const availIngredients = parseAvailInput(state?.avail ?? []);

    // --- Lấy nguyên liệu của recipe từ DB ---
    const recipeIngredients = await getRecipeIngredients(Number(recipeId));

    // --- Tính reward cơ bản ---
    let reward = calculateReward(availIngredients, recipeIngredients, actionType);

    // --- Check lặp lại bằng Redis ---
    const historyKey = `user:1:recipe:${recipeId}:count`; // TODO: bind user_id
    const repeats = await redis.incr(historyKey);
    await redis.expire(historyKey, 3600);

    if (repeats > 2) {
      reward.total -= 10;
      reward.details["repeatPenalty"] = -10;
    }

    // --- Forward sang RL-service ---
    const RL_BASE = process.env.RL_BASE;
    if (RL_BASE && state) {
      try {
        await axios.post(`${RL_BASE}/feedback`, {
          state,
          action: recipeId,
          reward: reward.total,
          next_state: state,
          done: false,
        });
        console.log(
          `✅ Forwarded feedback → RL service (reward=${reward.total})`
        );
      } catch (err: any) {
        console.warn("⚠️ RL feedback forward failed:", err?.message);
      }
    }

    // --- Lưu state vào DB ---
    const dbState = await prisma.state.create({
      data: {
        available_ingredients: availIngredients,
        context: { actionType },
        user_id: 1, // TODO: bind user thật
      },
    });

    // --- Lưu action ---
    let action = await prisma.action.findFirst({ where: { recipe_id: recipeId } });
    if (!action) {
      action = await prisma.action.create({
        data: {
          recipe_id: recipeId,
          description: `Action for recipe ${recipeId}`,
        },
      });
    }

    // --- Lưu reward ---
    await prisma.reward.create({
      data: {
        user_id: 1,
        state_id: dbState.state_id,
        action_id: action.action_id,
        reward_value: reward.total,
      },
    });

    // --- Push vào queue ---
    await feedbackQueue.add({ recipeId, actionType, reward: reward.total });

    console.log(
      `💾 Feedback saved: recipe=${recipeId}, action=${actionType}, reward=${reward.total}`
    );

    return res.json({
      success: true,
      reward: reward.total,
      details: reward.details,
      repeats,
    });
  } catch (err: any) {
    console.error("❌ postFeedback error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
