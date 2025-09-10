import { ITemplate } from "../../../models/dietTemplate.model";

export interface IDietTemplateService {
  createTemplate(adminId: string, payload: Partial<ITemplate>): Promise<ITemplate>;
    listTemplates(
    page: number,
    limit: number,
    search?: string
  ): Promise<{
    templates: any[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  getTemplate(id: string): Promise<ITemplate | null>;
  deleteTemplate(id: string): Promise<void|null>;
}
