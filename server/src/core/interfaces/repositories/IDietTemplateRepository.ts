import { ITemplate } from "../../../models/dietTemplate.model";

export interface ITemplateRepository {
  create(template: Partial<ITemplate>): Promise<ITemplate>;
    list(filter: any, page: number, limit: number, search?: string): Promise<{
    templates: ITemplate[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  getById(id: string): Promise<ITemplate | null>;
  delete(id: string): Promise<void>;
}
