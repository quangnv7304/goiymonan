// src/types/index.ts

// Ingredient cơ bản
export type Ingredient = {
    ingredient_id: number;
    name: string;
    unit?: string;
};

// Recipe
export type Recipe = {
    recipe_id: number;
    name: string;
    description?: string;
    instructions?: string;
    created_at?: string;
};

// Trạng thái RL
export type RLState = {
    avail: string[];   // nguyên liệu có sẵn
    miss: string[];    // nguyên liệu thiếu
    history?: number[]; // lịch sử recipe_id đã xem
};

// Kết quả gợi ý
export type PredictItem = {
    recipe_id: number;
    score: number;
};

export type PredictResponse = {
    recommendations: PredictItem[];
    epsilon: number;
    chosen?: number | null;
};

// Feedback request
export type UserFeedbackRequest = {
    recipeId: number;
    actionType: 'choose' | 'skip' | 'like' | 'dislike';
};

export type RLFeedbackRequest = {
    state: Record<string, unknown>;
    action: number;
    reward: number;
    next_state: Record<string, unknown>;
    done: boolean;
};
