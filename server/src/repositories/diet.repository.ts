import { injectable } from "inversify";
import { DietDayModel, IDietDay, IMeal } from "../models/diet.model";
import { IDietDayRepository } from "../core/interfaces/repositories/IDietRepository";
import { Types } from "mongoose";

@injectable()
export class DietDayRepository implements IDietDayRepository {
  async createDay(userId: string, date: string): Promise<IDietDay> {
    const doc = new DietDayModel({
      user: new Types.ObjectId(userId),
      date,
      meals: [],
    });
    return await doc.save();
  }

  async getByUserAndDate(userId: string, date: string): Promise<IDietDay | null> {
    return DietDayModel.findOne({ user: userId, date }).exec();
  }

  async createOrGet(userId: string, date: string): Promise<IDietDay> {
    const found = await this.getByUserAndDate(userId, date);
    if (found) return found;
    return this.createDay(userId, date);
  }

  async addMeal(userId: string, date: string, meal: Partial<IMeal>): Promise<IDietDay> {
    const updated = await DietDayModel.findOneAndUpdate(
      { user: userId, date },
      { $push: { meals: meal } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).exec();
    if (!updated) throw new Error("Failed to add meal");
    return updated;
  }

  async updateMeal(userId: string, date: string, mealId: string, update: Partial<IMeal>): Promise<IDietDay | null> {
    const set: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(update)) {
      set[`meals.$.${k}`] = v;
    }
    return DietDayModel.findOneAndUpdate(
      { user: userId, date, "meals._id": mealId },
      { $set: set },
      { new: true }
    ).exec();
  }

  async markMeal(userId: string, date: string, mealId: string, isEaten: boolean): Promise<IDietDay | null> {
    return DietDayModel.findOneAndUpdate(
      { user: userId, date, "meals._id": mealId },
      { $set: { "meals.$.isEaten": isEaten } },
      { new: true }
    ).exec();
  }

  async removeMeal(userId: string, date: string, mealId: string): Promise<IDietDay | null> {
    return DietDayModel.findOneAndUpdate(
      { user: userId, date },
      { $pull: { meals: { _id: mealId } } },
      { new: true }
    ).exec();
  }
}
