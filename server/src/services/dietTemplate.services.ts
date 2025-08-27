import { inject, injectable } from "inversify";
import { TemplateRepository } from "../repositories/dietTemplate.repository";
import { ITemplate } from "../models/dietTemplate.model";
import TYPES from "../core/types/types";
import { IDietTemplateService } from "../core/interfaces/services/IDietTemplateService";

@injectable()
export class DietTemplateService implements IDietTemplateService{
  constructor(@inject(TYPES.ITemplateRepository) private _repo: TemplateRepository) {}

  createTemplate(adminId: string, payload: Partial<ITemplate>) {
    payload.createdBy = adminId as any;
    return this._repo.create(payload);
  }

  listTemplates(filter: any = {}) {
    return this._repo.list(filter);
  }

  getTemplate(id: string) {
    return this._repo.getById(id);
  }

  deleteTemplate(id: string) {
    return this._repo.delete(id);
  }
}
