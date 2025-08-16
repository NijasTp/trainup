import { injectable } from "inversify";
import { TemplateModel, ITemplate } from "../models/dietTemplate.model";

@injectable()
export class TemplateRepository {
  async create(template: Partial<ITemplate>): Promise<ITemplate> {
    const doc = new TemplateModel(template);
    return doc.save();
  }

  async list(filter: any = {}): Promise<ITemplate[]> {
    return TemplateModel.find(filter).lean().exec();
  }

  async getById(id: string): Promise<ITemplate | null> {
    return TemplateModel.findById(id).exec();
  }

  async delete(id: string): Promise<void> {
    await TemplateModel.findByIdAndDelete(id).exec();
  }
}
