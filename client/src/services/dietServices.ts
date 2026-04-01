import API from '@/lib/axios'
import type { Meal } from '@/interfaces/user/IUserAddDiet'
import { API_ROUTES } from '@/constants/api.constants'

export const addMealToDate = async (date: string, meal: Meal) => {
  const res = await API.post(API_ROUTES.DIET.MEALS(date), {
    name: meal.name,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fats: meal.fats,
    time: meal.time,
    source: meal.source,
    description: meal.description
  })
  return res.data
}

export const getMealsByDate = async (date: string) => {
  const res = await API.post(API_ROUTES.DIET.BASE + '/', { date }) // Fix: following original pattern
  return res.data
}

export const deleteMeal = async (date: string, mealId: string) => {
  const res = await API.delete(API_ROUTES.DIET.MEAL_ACTION(date, mealId))
  return res.data
}

export const markEaten = async (date: string, mealId: string) => {
  const res = await API.patch(`${API_ROUTES.DIET.MEAL_ACTION(date, mealId)}/eaten`, {
    isEaten: true
  })
  return res.data
}
