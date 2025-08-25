import API from '@/lib/axios'
import type { Meal } from '@/pages/user/UserAddDiet'

export const addMealToDate = async (date: string, meal: Meal) => {
  const res = await API.post(`/diet/${date}/meals`, {
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
  const res = await API.post(`/diet/`, { date })
  return res.data
}

export const deleteMeal = async (date: string, mealId: string) => {
  const res = await API.delete(`/diet/${date}/meals/${mealId}`)
  return res.data
}

export const markEaten = async (date: string, mealId: string) => {
  const res = await API.patch(`/diet/${date}/meals/${mealId}/eaten`, {
    isEaten: true
  })
  return res.data
}
