import { inject, injectable } from "inversify";
import { TemplateRepository } from "../repositories/dietTemplate.repository";
import { ITemplate } from "../models/dietTemplate.model";
import TYPES from "../core/types/types";

@injectable()
export class DietTemplateService{
  constructor(@inject(TYPES.ITemplateRepository) private repo: TemplateRepository) {}

  createTemplate(adminId: string, payload: Partial<ITemplate>) {
    payload.createdBy = adminId as any;
    return this.repo.create(payload);
  }

  listTemplates(filter: any = {}) {
    return this.repo.list(filter);
  }

  getTemplate(id: string) {
    return this.repo.getById(id);
  }

  deleteTemplate(id: string) {
    return this.repo.delete(id);
  }
}
