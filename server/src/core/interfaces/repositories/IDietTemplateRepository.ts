import { ITemplate } from "../../../models/dietTemplate.model";

export interface ITemplateRepository {
  create(template: Partial<ITemplate>): Promise<ITemplate>;
  list(filter?: Record<string, unknown>): Promise<ITemplate[]>;
  getById(id: string): Promise<ITemplate | null>;
  delete(id: string): Promise<void>;
}
