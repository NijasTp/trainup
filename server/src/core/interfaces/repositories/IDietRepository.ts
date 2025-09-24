import { IDietDay, IMeal } from "../../../models/diet.model";

export interface IDietDayRepository {
  createDay(userId: string, date: string): Promise<IDietDay>;
  getByUserAndDate(userId: string, date: string): Promise<IDietDay | null>;
  createOrGet(userId: string, date: string): Promise<IDietDay>;
  addMeal(userId: string, date: string, meal: Partial<IMeal>): Promise<IDietDay>;
  updateMeal(userId: string, date: string, mealId: string, update: Partial<IMeal>): Promise<IDietDay | null>;
  markMeal(userId: string, date: string, mealId: string, isEaten: boolean): Promise<IDietDay | null>;
  removeMeal(userId: string, date: string, mealId: string): Promise<IDietDay | null>;
}