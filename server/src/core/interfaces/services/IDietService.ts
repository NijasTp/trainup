import { CreateOrGetDayResponseDto, MealDto } from '../../../dtos/diet.dto';

export interface IDietService {
  createOrGetDay(
    userId: string,
    date: string
  ): Promise<CreateOrGetDayResponseDto>
  getDay(
    userId: string,
    date: string
  ): Promise<CreateOrGetDayResponseDto | null>
  addMeal(
    actor: { id: string; role: string },
    userId: string,
    date: string,
    mealPayload: Partial<MealDto>
  ): Promise<CreateOrGetDayResponseDto>

  updateMeal(
    actor: { id: string; role: string },
    userId: string,
    date: string,
    mealId: string,
    update: Partial<MealDto>
  ): Promise<CreateOrGetDayResponseDto | null>

  markMealEaten(
    actor: { id: string; role: string },
    userId: string,
    date: string,
    mealId: string,
    isEaten: boolean
  ): Promise<CreateOrGetDayResponseDto | null>

  removeMeal(
    actor: { id: string; role: string },
    userId: string,
    date: string,
    mealId: string
  ): Promise<CreateOrGetDayResponseDto | null>
}
