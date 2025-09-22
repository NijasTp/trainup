import { inject, injectable } from "inversify";
import { TemplateRepository } from "../repositories/dietTemplate.repository";
import { ITemplate } from "../models/dietTemplate.model";
import TYPES from "../core/types/types";
import { IDietTemplateService } from "../core/interfaces/services/IDietTemplateService";
import { CreateTemplateRequestDto, TemplateResponseDto } from '../dtos/diet.dto';

@injectable()
export class DietTemplateService implements IDietTemplateService {
  constructor(@inject(TYPES.ITemplateRepository) private _dietTemplateRepo: TemplateRepository) {}

  async createTemplate(adminId: string, dto: CreateTemplateRequestDto): Promise<TemplateResponseDto> {
    const payload: Partial<ITemplate> = {
      ...dto,
      createdBy: adminId
    };
    const template = await this._dietTemplateRepo.create(payload);
    return this.mapToResponseDto(template);
  }

  async listTemplates(filter: any = {}): Promise<TemplateResponseDto[]> {
    const templates = await this._dietTemplateRepo.list(filter);
    return templates.map(template => this.mapToResponseDto(template));
  }

  async getTemplate(id: string): Promise<TemplateResponseDto | null> {
    const template = await this._dietTemplateRepo.getById(id);
    return template ? this.mapToResponseDto(template) : null;
  }

  async deleteTemplate(id: string): Promise<void> {
    const success = await this._dietTemplateRepo.delete(id);
  }

  private mapToResponseDto(template: ITemplate): TemplateResponseDto {
    return {
      _id: template._id.toString(),
      title: template.title,
      description: template.description,
      createdBy: template.createdBy.toString(),
      meals: template.meals.map(meal => ({
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
        time: meal.time,
        nutritions: meal.nutritions,
        notes: meal.notes
      })),
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    };
  }
}