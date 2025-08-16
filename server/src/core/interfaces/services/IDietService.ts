import { IDietDay, IMeal } from "../../../models/diet.model";

export interface IDietService {
  createOrGetDay(userId: string, date: string): Promise<IDietDay>;
  getDay(userId: string, date: string): Promise<IDietDay | null>;

  addMeal(
    actor: { id: string; role: string },
    userId: string,
    date: string,
    mealPayload: Partial<IMeal>
  ): Promise<IDietDay>;

  updateMeal(
    actor: { id: string; role: string },
    userId: string,
    date: string,
    mealId: string,
    update: Partial<IMeal>
  ): Promise<IDietDay | null>;

  markMealEaten(
    actor: { id: string; role: string },
    userId: string,
    date: string,
    mealId: string,
    isEaten: boolean
  ): Promise<IDietDay | null>;

  removeMeal(
    actor: { id: string; role: string },
    userId: string,
    date: string,
    mealId: string
  ): Promise<IDietDay | null>;
}
