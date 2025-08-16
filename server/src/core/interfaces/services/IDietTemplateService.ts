import { ITemplate } from "../../../models/dietTemplate.model";

export interface IDietTemplateService {
  createTemplate(adminId: string, payload: Partial<ITemplate>): Promise<ITemplate>;
  listTemplates(filter?: any): Promise<ITemplate[]>;
  getTemplate(id: string): Promise<ITemplate | null>;
  deleteTemplate(id: string): Promise<void|null>;
}
