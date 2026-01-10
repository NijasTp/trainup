import { IDietTemplate } from "../../../models/dietTemplate.model";
import { FilterQuery } from "mongoose";

export interface ITemplateRepository {
  create(template: Partial<IDietTemplate>): Promise<IDietTemplate>;
  find(query: FilterQuery<IDietTemplate>, page: number, limit: number): Promise<{
    templates: IDietTemplate[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  getById(id: string): Promise<IDietTemplate | null>;
  update(id: string, update: Partial<IDietTemplate>): Promise<IDietTemplate | null>;
  delete(id: string): Promise<void>;
}
