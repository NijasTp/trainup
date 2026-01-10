import { injectable } from "inversify";
import { FilterQuery } from "mongoose";
import { DietTemplateModel, IDietTemplate } from "../models/dietTemplate.model";

@injectable()
export class TemplateRepository {
  async create(template: Partial<IDietTemplate>): Promise<IDietTemplate> {
    const doc = new DietTemplateModel(template);
    return doc.save();
  }

  async find(query: FilterQuery<IDietTemplate>, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [templates, total] = await Promise.all([
      DietTemplateModel.find(query)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      DietTemplateModel.countDocuments(query).exec(),
    ]);

    return { templates, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string): Promise<IDietTemplate | null> {
    return DietTemplateModel.findById(id).lean().exec();
  }

  async update(id: string, update: Partial<IDietTemplate>) {
    return DietTemplateModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await DietTemplateModel.findByIdAndDelete(id).exec();
  }
}
