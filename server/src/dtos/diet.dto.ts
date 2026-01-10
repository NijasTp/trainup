export class CreateOrGetDayRequestDto {
  date: string;
}

export class CreateOrGetDayResponseDto {
  _id: string;
  user: string;
  date: string;
  meals: MealDto[];
  templateDay?: number;
  templateName?: string;
  templateDuration?: number;
  templateMeals?: MealDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class MealDto {
  _id?: string;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  time: string;
  isEaten: boolean;
  usedBy: string;
  source: string;
  sourceId: string;
  nutritions?: NutritionItemDto[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class NutritionItemDto {
  label: string;
  value: number;
  unit?: string;
}

export class GetDayParamsDto {
  date: string;
}

export class GetDayQueryDto {
  userId?: string;
}

export class CreateDietSessionRequestDto {
  userId: string;
  date: string;
}

export class AddMealRequestDto {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  time: string;
  nutritions?: NutritionItemDto[];
  notes?: string;
}

export class AddMealParamsDto {
  date: string;
}

export class UpdateMealRequestDto {
  name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  time?: string;
  nutritions?: NutritionItemDto[];
  notes?: string;
}

export class UpdateMealParamsDto {
  date: string;
  mealId: string;
  userId?: string;
}

export class MarkEatenRequestDto {
  isEaten: boolean;
}

export class MarkEatenParamsDto {
  date: string;
  mealId: string;
  userId?: string;
}

export class RemoveMealParamsDto {
  date: string;
  mealId: string;
  userId?: string;
}

export class CreateTemplateRequestDto {
  title: string;
  description?: string;
  meals: TemplateMealDto[];
}

export class TemplateMealDto {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  time: string;
  nutritions?: NutritionItemDto[];
  notes?: string;
}

export class TemplateResponseDto {
  _id: string;
  title: string;
  description?: string;
  createdBy: string;
  meals: TemplateMealDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class ApplyTemplateRequestDto {
  date: string;
  templateId: string;
}

export class ApplyTemplateParamsDto {
  userId?: string;
}